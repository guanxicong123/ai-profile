import { updateHighlight, deleteHighlight } from "@/lib/db/repos";
import { wrapRoute, readJson } from "@/lib/api/helpers";

export const runtime = "nodejs";

export const PUT = wrapRoute(async (req, { params }) => {
  const id = Number(params.id);
  const body = await readJson<{ content?: string; sort?: number }>(req);
  const updated = updateHighlight(id, body);
  if (!updated) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(updated);
});

export const DELETE = wrapRoute(async (_req, { params }) => {
  const ok = deleteHighlight(Number(params.id));
  if (!ok) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
});
