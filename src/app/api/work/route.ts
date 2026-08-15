import { listWork, createWork } from "@/lib/db/repos";
import { wrapRoute, readJson } from "@/lib/api/helpers";
import type { WorkInput } from "@/lib/types";

export const runtime = "nodejs";

export const GET = wrapRoute(async () => {
  return Response.json(listWork());
});

export const POST = wrapRoute(async (req) => {
  const body = await readJson<WorkInput>(req);
  if (!body?.company || !body?.role)
    return Response.json({ error: "company/role 必填" }, { status: 400 });
  return Response.json(createWork({ ...body, sort: body.sort ?? 0 }), { status: 201 });
});
