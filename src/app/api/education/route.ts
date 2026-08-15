import { getEducation, upsertEducation } from "@/lib/db/repos";
import { wrapRoute, readJson } from "@/lib/api/helpers";
import type { Education } from "@/lib/types";

export const runtime = "nodejs";

export const GET = wrapRoute(async () => {
  return Response.json(getEducation());
});

export const PUT = wrapRoute(async (req) => {
  const body = await readJson<Education>(req);
  return Response.json(upsertEducation(body));
});
