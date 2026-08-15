import { getGenerated, deleteGenerated } from "@/lib/db/repos";
import { wrapRoute } from "@/lib/api/helpers";

export const runtime = "nodejs";

export const GET = wrapRoute(async (_req, { params }) => {
  const g = getGenerated(Number(params.id));
  if (!g) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(g);
});

export const DELETE = wrapRoute(async (_req, { params }) => {
  const ok = deleteGenerated(Number(params.id));
  if (!ok) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
});
