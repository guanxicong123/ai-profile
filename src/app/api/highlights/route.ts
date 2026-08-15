import { listHighlights, createHighlight } from "@/lib/db/repos";
import { wrapRoute, readJson } from "@/lib/api/helpers";

export const runtime = "nodejs";

export const GET = wrapRoute(async () => {
  return Response.json(listHighlights());
});

export const POST = wrapRoute(async (req) => {
  const body = await readJson<{ content: string; sort?: number }>(req);
  if (!body?.content?.trim()) return Response.json({ error: "content 必填" }, { status: 400 });
  return Response.json(createHighlight(body.content, body.sort ?? 0), { status: 201 });
});
