/**
 * JD 解析 + 项目打分。
 * - parseJD(text, model)
 * - scoreProjects(jd, projects, model)：先按关键词预筛，再让 LLM 对候选打分。
 *
 * 传给 LLM 的项目仅包含 id/name/overview/stack/tags/domain，节省 token。
 */
import type { LanguageModel } from "ai";
import type { ParsedJD, Project, ProjectScore } from "@/lib/types";
import { parsedJDSchema, projectScoreListSchema } from "./schema";
import { structuredObject } from "@/lib/llm/structured";
import {
  JD_PARSE_SYSTEM,
  SCORE_SYSTEM,
  buildJDParsePrompt,
  buildScorePrompt,
} from "@/lib/llm/prompts";

export async function parseJD(jdText: string, model: LanguageModel): Promise<ParsedJD> {
  return structuredObject<ParsedJD>({
    model,
    schema: parsedJDSchema,
    system: JD_PARSE_SYSTEM,
    prompt: buildJDParsePrompt(jdText),
    maxOutputTokens: 4000,
  });
}

/** 关键词命中预筛：stack/tags/domain 与 mustHave/niceToHave/responsibilities/domains 任意命中即为候选。 */
export function prefilterCandidates(
  jd: ParsedJD,
  projects: Project[]
): Project[] {
  const active = projects.filter((p) => !p.archived);
  if (active.length === 0) return [];

  const needles = [
    ...jd.mustHaveSkills,
    ...jd.niceToHaveSkills,
    ...jd.responsibilities,
    ...jd.domains,
  ]
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (needles.length === 0) return active;

  const matched = active.filter((p) => {
    const haystack = [
      ...(p.stack || []),
      ...(p.tags || []),
      p.domain || "",
      p.overview || "",
      p.name || "",
    ]
      .join(" ")
      .toLowerCase();
    return needles.some((kw) => kw && haystack.includes(kw));
  });

  // 若关键词命中为 0，或命中数过少（<3，素材库本身很小），退化为全部候选，
  // 交给 LLM 排序，避免无法凑足 Top N。素材库通常只有个位数项目，全量打分成本可忽略。
  if (matched.length === 0 || matched.length < 3) return active;
  return matched;
}

export async function scoreProjects(
  jd: ParsedJD,
  projects: Project[],
  model: LanguageModel
): Promise<ProjectScore[]> {
  const candidates = prefilterCandidates(jd, projects);
  if (candidates.length === 0) return [];

  const candidatePayload = candidates.map((p) => ({
    projectId: p.id,
    name: p.name,
    overview: p.overview,
    stack: p.stack,
    tags: p.tags,
    domain: p.domain,
  }));

  const object = await structuredObject<{ scores: ProjectScore[] }>({
    model,
    schema: projectScoreListSchema,
    system: SCORE_SYSTEM,
    prompt: buildScorePrompt({ jd, candidates: candidatePayload }),
    maxOutputTokens: 8000,
  });

  const scores = (object.scores as ProjectScore[])
    // 防御：过滤掉 LLM 幻觉出的 projectId
    .filter((s) => candidates.some((c) => c.id === s.projectId))
    .map((s) => ({
      projectId: s.projectId,
      name:
        candidates.find((c) => c.id === s.projectId)?.name ?? s.name,
      score: clampScore(s.score),
      matchedSkills: Array.isArray(s.matchedSkills) ? s.matchedSkills : [],
      reason: s.reason ?? "",
    }));

  scores.sort((a, b) => b.score - a.score);
  return scores;
}

function clampScore(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}
