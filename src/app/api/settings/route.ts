import { getPublicSettings, saveSettings } from "@/lib/settings";
import { wrapRoute, readJson } from "@/lib/api/helpers";
import type { Settings } from "@/lib/types";

export const runtime = "nodejs";

export const GET = wrapRoute(async () => {
  return Response.json(getPublicSettings());
});

export const PUT = wrapRoute(async (req) => {
  const body = await readJson<Partial<Settings>>(req);
  const saved = saveSettings(body);
  // 回显时再次脱敏
  return Response.json({
    projectCount: saved.projectCount,
    model: { ...saved.model, apiKey: saved.model.apiKey ? "***" : "" },
    hasApiKey: Boolean(saved.model.apiKey),
  });
});
