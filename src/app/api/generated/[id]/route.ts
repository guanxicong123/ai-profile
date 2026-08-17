import { getGenerated, deleteGenerated, updateGenerated } from "@/lib/db/repos";
import { wrapRoute, readJson } from "@/lib/api/helpers";
import { resumeDocumentSchema } from "@/lib/resume/schema";
import type { ResumeDocument } from "@/lib/types";

export const runtime = "nodejs";

export const GET = wrapRoute(async (_req, { params }) => {
  const g = getGenerated(Number(params.id));
  if (!g) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(g);
});

export const PUT = wrapRoute(async (req, { params }) => {
  const id = Number(params.id);
  const body = await readJson<{ document: unknown }>(req);
  if (!body || typeof body !== "object" || body.document == null) {
    return Response.json({ error: "请求体缺少 document 字段" }, { status: 400 });
  }

  const parsed = resumeDocumentSchema.safeParse(body.document);
  if (!parsed.success) {
    return Response.json(
      {
        error: "document 不符合 ResumeDocument 结构",
        issues: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  // zod 的 z.record 推断出的 skills 各分类为可选，与 types.ts 的 ResumeDocument
  // （四个分类均必填）存在类型表达差异；运行时已由 schema 校验通过，这里安全转换。
  const updated = updateGenerated(id, { document: parsed.data as unknown as ResumeDocument });
  if (!updated) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(updated);
});

export const DELETE = wrapRoute(async (_req, { params }) => {
  const ok = deleteGenerated(Number(params.id));
  if (!ok) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
});
