import { listProjects, createProject } from "@/lib/db/repos";
import { wrapRoute, readJson, getQueryParam } from "@/lib/api/helpers";
import type { ProjectInput } from "@/lib/types";

export const runtime = "nodejs";

export const GET = wrapRoute(async (req) => {
  const q = getQueryParam(req, "q") || undefined;
  const domain = getQueryParam(req, "domain") || undefined;
  const archivedRaw = getQueryParam(req, "archived");
  // 默认只返回未归档；显式 archived=all/undefined 时返回全部；true 只看归档
  let archived: boolean | undefined = false;
  if (archivedRaw === "true") archived = true;
  else if (archivedRaw === "all") archived = undefined;
  return Response.json(listProjects({ q, domain, archived }));
});

export const POST = wrapRoute(async (req) => {
  const body = await readJson<ProjectInput>(req);
  if (!body?.name || !body?.role)
    return Response.json({ error: "name/role 必填" }, { status: 400 });
  return Response.json(
    createProject({
      name: body.name,
      role: body.role,
      period: body.period ?? null,
      stack: body.stack ?? [],
      overview: body.overview ?? "",
      details: body.details ?? [],
      results: body.results ?? [],
      tags: body.tags ?? [],
      domain: body.domain ?? null,
      archived: body.archived ?? false,
    }),
    { status: 201 }
  );
});
