/**
 * GET /api/generated/[id]/pdf —— 渲染 Puppeteer PDF 并返回 application/pdf
 * 首次成功后可把 pdf 文件路径落库；这里每次实时生成（保证最新文档结构）。
 */
import { getGenerated, setGeneratedPdfPath } from "@/lib/db/repos";
import { renderPDF } from "@/lib/pdf/render";
import { wrapRoute, errorMessage } from "@/lib/api/helpers";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const maxDuration = 120;

export const GET = wrapRoute(async (req, { params }) => {
  const id = Number(params.id);
  const g = getGenerated(id);
  if (!g) return errorMessage("not found", 404);

  const buffer = await renderPDF(g.document);

  // 持久化到 data/pdf 供历史下载
  try {
    const dir = path.join(process.cwd(), "data", "pdf");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const fileName = `resume-${id}-${Date.now()}.pdf`;
    const fullPath = path.join(dir, fileName);
    fs.writeFileSync(fullPath, buffer);
    setGeneratedPdfPath(id, fullPath);
  } catch (e) {
    console.warn("[pdf] 持久化失败（不影响返回）：", e);
  }

  const download = new URL(req.url).searchParams.get("download") === "1";
  // 用 Blob 包裹以兼容 @types/node 与 DOM lib 对 BodyInit 的不同定义
  const body = new Blob([new Uint8Array(buffer)]);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(buffer.length),
      "Cache-Control": "private, no-store",
      ...(download
        ? { "Content-Disposition": `attachment; filename="resume-${id}.pdf"` }
        : { "Content-Disposition": `inline; filename="resume-${id}.pdf"` }),
    },
  });
});
