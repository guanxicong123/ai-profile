import { updateWork, deleteWork } from "@/lib/db/repos";
import { wrapRoute, readJson } from "@/lib/api/helpers";
import type { WorkInput } from "@/lib/types";

export const runtime = "nodejs";

export const PUT = wrapRoute(async (req, { params }) => {
  const id = Number(params.id);
  const body = await readJson<Partial<WorkInput>>(req);
  const updated = updateWork(id, body);
  if (!updated) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(updated);
});

export const DELETE = wrapRoute(async (_req, { params }) => {
  const ok = deleteWork(Number(params.id));
  if (!ok) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
});
