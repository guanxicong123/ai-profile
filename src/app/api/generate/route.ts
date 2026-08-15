/**
 * POST /api/generate（同步长任务）
 * 读 GenerateRequest：parseJD → scoreProjects → Top N → assemble → 落库 → 返回 GenerateResponse
 */
import {
  listProjects,
  getProfile,
  listHighlights,
  listSkills,
  listWork,
  getEducation,
  createGenerated,
} from "@/lib/db/repos";
import { resolveModel, getSettings } from "@/lib/settings";
import { createModel } from "@/lib/llm/providers";
import { parseJD, scoreProjects } from "@/lib/resume/match";
import { assembleResume } from "@/lib/resume/assemble";
import { wrapRoute, readJson } from "@/lib/api/helpers";
import type { GenerateRequest, GenerateResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export const POST = wrapRoute(async (req) => {
  const body = await readJson<GenerateRequest>(req);
  if (!body?.jdText?.trim()) {
    return Response.json({ error: "jdText 必填" }, { status: 400 });
  }

  const settings = getSettings();
  const modelCfg = resolveModel(body.modelOverride);
  if (!modelCfg.apiKey) {
    return Response.json({ error: "未配置模型 API Key，请到设置页配置或在 modelOverride 中传入。" }, { status: 400 });
  }
  const projectCount = body.projectCount ?? settings.projectCount ?? 5;

  const model = createModel(modelCfg);

  // 1) 解析 JD
  const parsedJD = await parseJD(body.jdText, model);
  // 若请求中指定了 targetRole，以请求为准
  if (body.targetRole) parsedJD.targetRole = body.targetRole;

  // 2) 项目打分（预筛 + LLM）
  const allProjects = listProjects({ archived: false });
  const scores = await scoreProjects(parsedJD, allProjects, model);

  // 3) 取 Top N
  const topIds = scores.slice(0, projectCount).map((s) => s.projectId);
  const topProjects = topIds
    .map((id) => allProjects.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (topProjects.length === 0) {
    return Response.json({ error: "没有匹配的项目素材，无法生成简历。" }, { status: 422 });
  }

  // 4) 组装成稿
  const document = await assembleResume({
    jd: parsedJD,
    topProjects,
    material: {
      profile: getProfile(),
      highlights: listHighlights(),
      skills: listSkills(),
      work: listWork(),
      education: getEducation(),
    },
    model,
  });

  // 5) 落库
  const saved = createGenerated({
    jdText: body.jdText,
    targetRole: parsedJD.targetRole,
    parsedJD,
    scores,
    document,
    pdfPath: null,
  });

  const resp: GenerateResponse = {
    sessionId: saved.id,
    parsedJD,
    scores,
    document,
    createdAt: saved.createdAt,
  };
  return Response.json(resp);
});
