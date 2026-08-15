/**
 * POST /api/import（multipart field=file，支持 .pdf / .docx / .md）
 * PDF 用 pdf-parse 抽取文本，DOCX 用 mammoth 抽取文本，Markdown 直接按 UTF-8 纯文本读取，
 * 再调 LLM 按 ProjectInput 数组抽取；不落库。
 */
// 直接引实现文件：pdf-parse 主入口在 module.parent 为空时会执行自测代码并尝试读取
// ./test/data/05-versions-space.pdf（npm 包未带该文件），在 Next/Turbopack 构建期会 ENOENT。
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import { getSettings } from "@/lib/settings";
import { createModel } from "@/lib/llm/providers";
import {
  IMPORT_SYSTEM,
  IMPORT_MARKDOWN_HINT,
  buildImportPrompt,
} from "@/lib/llm/prompts";
import { projectInputListSchema } from "@/lib/resume/schema";
import { structuredObject } from "@/lib/llm/structured";
import { wrapRoute, errorMessage } from "@/lib/api/helpers";

export const runtime = "nodejs";

const MD_EXTS = new Set([".md", ".markdown"]);

function getExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

function describeSource(ext: string): string {
  if (ext === ".pdf") return "PDF";
  if (ext === ".docx") return "Word 文档";
  if (MD_EXTS.has(ext)) return "Markdown 文档";
  return "文件";
}

/** 剥掉 UTF-8 BOM（U+FEFF），避免污染首行。按字符码判断，避免源码内嵌不可见字符。 */
function stripBom(text: string): string {
  if (text.charCodeAt(0) === 0xfeff) return text.slice(1);
  return text;
}

async function extractText(ext: string, arrayBuffer: ArrayBuffer): Promise<string> {
  if (ext === ".pdf") {
    // 经典版 pdf-parse@1.1.1：CommonJS，直接传 Buffer，无 worker 分离问题
    const buffer = Buffer.from(arrayBuffer);
    const data = await pdfParse(buffer);
    return data.text || "";
  }
  if (ext === ".docx") {
    // Node 版 mammoth 接受 { buffer: Buffer }（{arrayBuffer} 是浏览器版 API，会报 "Could not find file in options"）
    const buffer = Buffer.from(arrayBuffer);
    const r = await mammoth.extractRawText({ buffer });
    return r.value || "";
  }
  if (MD_EXTS.has(ext)) {
    // Markdown 是纯文本，无需第三方库
    return stripBom(Buffer.from(arrayBuffer).toString("utf-8"));
  }
  throw new Error(`不支持的扩展名: ${ext}`);
}

export const POST = wrapRoute(async (req) => {
  const form = await req.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return errorMessage("缺少 file 字段（multipart/form-data）", 400);
  }

  const ext = getExt(file.name);
  if (ext === ".doc") {
    return errorMessage("暂不支持旧版 .doc 格式，请用 Word 另存为 .docx 后上传", 422);
  }
  if (ext !== ".pdf" && ext !== ".docx" && !MD_EXTS.has(ext)) {
    return errorMessage("仅支持 .pdf / .docx / .md 文件", 400);
  }

  const arrayBuffer = await file.arrayBuffer();
  const text = await extractText(ext, arrayBuffer);

  if (!text.trim()) {
    return errorMessage(`未能从${describeSource(ext)}中抽取到文本`, 422);
  }

  const settings = getSettings();
  if (!settings.model.apiKey) {
    return errorMessage("未配置模型 API Key，请先在 /settings 配置", 400);
  }

  const model = createModel(settings.model);
  const sourceHint = MD_EXTS.has(ext) ? IMPORT_MARKDOWN_HINT : undefined;
  const object = await structuredObject<{ projects: unknown[] }>({
    model,
    schema: projectInputListSchema,
    system: IMPORT_SYSTEM,
    prompt: buildImportPrompt(text, sourceHint),
    maxOutputTokens: 8000,
  });

  return Response.json({ projects: object.projects });
});
