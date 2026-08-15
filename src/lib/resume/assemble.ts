/**
 * 简历成稿：给定 JD + 完整素材，调用 LLM 生成 ResumeDocument。
 * 数据获取放在 API 层，assemble 只负责组织 prompt + 结构化输出。
 */
import type { LanguageModel } from "ai";
import type {
  Education,
  Highlight,
  ParsedJD,
  Profile,
  Project,
  ResumeDocument,
  Skill,
  WorkExperience,
} from "@/lib/types";
import { resumeDocumentSchema } from "./schema";
import { structuredObject } from "@/lib/llm/structured";
import { ASSEMBLE_SYSTEM, buildAssemblePrompt } from "@/lib/llm/prompts";

export interface AssembleFixedMaterial {
  profile: Profile;
  highlights: Highlight[];
  skills: Skill[];
  work: WorkExperience[];
  education: Education;
}

export interface AssembleResult {
  parsedJD: ParsedJD;
  scores: import("@/lib/types").ProjectScore[];
  document: ResumeDocument;
}

export async function assembleResume(input: {
  jd: ParsedJD;
  topProjects: Project[];
  material: AssembleFixedMaterial;
  model: LanguageModel;
}): Promise<ResumeDocument> {
  const { jd, topProjects, material, model } = input;

  const skillsByCategory: Record<string, string[]> = {
    frontend: [],
    backend: [],
    platforms: [],
    engineering: [],
  };
  for (const s of material.skills) {
    (skillsByCategory[s.category] ||= []).push(s.content);
  }

  const projectsPayload = topProjects.map((p) => ({
    projectId: p.id,
    name: p.name,
    role: p.role,
    period: p.period,
    stack: p.stack,
    overview: p.overview,
    details: p.details,
    results: p.results,
  }));

  const doc = await structuredObject<ResumeDocument>({
    model,
    schema: resumeDocumentSchema,
    system: ASSEMBLE_SYSTEM,
    prompt: buildAssemblePrompt({
      jd,
      profile: material.profile,
      highlights: material.highlights.map((h) => h.content),
      skills: skillsByCategory,
      workExperiences: material.work,
      education: material.education,
      projects: projectsPayload,
    }),
    maxOutputTokens: 8000,
  });

  // 后置真实性护栏：确保 projectId 来自候选列表，且不增删项目
  const allowedIds = new Set(topProjects.map((p) => p.id));
  doc.projects = (doc.projects || [])
    .filter((p) => allowedIds.has(p.projectId))
    .map((p) => {
      const src = topProjects.find((x) => x.id === p.projectId)!;
      return {
        projectId: p.projectId,
        name: p.name || src.name,
        role: p.role || src.role,
        period: p.period ?? src.period,
        stack: p.stack?.length ? p.stack : src.stack,
        overview: p.overview || src.overview,
        details: p.details?.length ? p.details : src.details,
        results: p.results?.length ? p.results : src.results,
      };
    });

  return doc;
}
