import { getProfile, upsertProfile } from "@/lib/db/repos";
import { wrapRoute, readJson } from "@/lib/api/helpers";
import type { Profile } from "@/lib/types";

export const runtime = "nodejs";

export const GET = wrapRoute(async () => {
  return Response.json(getProfile());
});

export const PUT = wrapRoute(async (req) => {
  const body = await readJson<Profile>(req);
  return Response.json(upsertProfile(body));
});
