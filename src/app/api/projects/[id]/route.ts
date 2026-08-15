import { getProject, updateProject, deleteProject } from "@/lib/db/repos";
import { wrapRoute, readJson } from "@/lib/api/helpers";
import type { ProjectInput } from "@/lib/types";

export const runtime = "nodejs";

export const GET = wrapRoute(async (_req, { params }) => {
  const p = getProject(Number(params.id));
  if (!p) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(p);
});

export const PUT = wrapRoute(async (req, { params }) => {
  const id = Number(params.id);
  const body = await readJson<Partial<ProjectInput>>(req);
  const updated = updateProject(id, body);
  if (!updated) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(updated);
});

export const DELETE = wrapRoute(async (_req, { params }) => {
  const ok = deleteProject(Number(params.id));
  if (!ok) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
});
