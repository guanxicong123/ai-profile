import { updateSkill, deleteSkill } from "@/lib/db/repos";
import { wrapRoute, readJson } from "@/lib/api/helpers";

export const runtime = "nodejs";

export const PUT = wrapRoute(async (req, { params }) => {
  const id = Number(params.id);
  const body = await readJson<{ category?: import("@/lib/types").SkillCategory; content?: string; sort?: number }>(req);
  const updated = updateSkill(id, body);
  if (!updated) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(updated);
});

export const DELETE = wrapRoute(async (_req, { params }) => {
  const ok = deleteSkill(Number(params.id));
  if (!ok) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
});
