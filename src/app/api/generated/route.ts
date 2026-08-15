import { listGenerated } from "@/lib/db/repos";
import { wrapRoute } from "@/lib/api/helpers";

export const runtime = "nodejs";

export const GET = wrapRoute(async () => {
  // CONTRACT：GET /api/generated → GeneratedResume[]（历史列表）
  return Response.json(listGenerated());
});
