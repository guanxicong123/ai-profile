/**
 * 简历流水线的 Zod schema —— 与 src/lib/types.ts 保持一致。
 * 用于 structuredObject（generateText + 手动 JSON.parse + zod safeParse）的运行时校验。
 */
import { z } from "zod";

export const skillCategorySchema = z.enum([
  "frontend",
  "backend",
  "platforms",
  "engineering",
]);
export type SkillCategoryZ = z.infer<typeof skillCategorySchema>;

/* --------------------------------- ParsedJD -------------------------------- */

export const parsedJDSchema = z.object({
  targetRole: z.string().describe("目标岗位名称，如「高级前端开发工程师」"),
  mustHaveSkills: z.array(z.string()).describe("必须掌握的技能/技术栈关键词"),
  niceToHaveSkills: z.array(z.string()).describe("加分技能"),
  responsibilities: z.array(z.string()).describe("岗位职责要点"),
  domains: z.array(z.string()).describe("涉及的业务领域/行业"),
  seniority: z.string().describe("资历级别，如 初级/中级/高级/资深/专家"),
});
export type ParsedJDZ = z.infer<typeof parsedJDSchema>;

/* ------------------------------ ProjectScore ------------------------------ */

export const projectScoreSchema = z.object({
  projectId: z.number().int().positive(),
  name: z.string(),
  score: z.number().min(0).max(100).describe("与 JD 的匹配分 0-100"),
  matchedSkills: z.array(z.string()).describe("命中的技能/领域"),
  reason: z.string().describe("一句话打分理由"),
});
export type ProjectScoreZ = z.infer<typeof projectScoreSchema>;

export const projectScoreListSchema = z.object({
  scores: z.array(projectScoreSchema),
});

/* ------------------------------ ResumeDocument ----------------------------- */

export const profileSchema = z.object({
  name: z.string(),
  title: z.string(),
  birth: z.string(),
  phone: z.string(),
  email: z.string(),
  location: z.string(),
  years: z.string(),
  onlineResume: z.string().optional(),
  tagline: z.string().optional(),
  summary: z.string(),
  industry: z.string(),
  photoPath: z.string().nullable().optional(),
});

export const workExperienceSchema = z.object({
  id: z.number(),
  company: z.string(),
  role: z.string(),
  period: z.string(),
  duties: z.array(z.string()),
  achievements: z.array(z.string()),
  sort: z.number(),
});

export const educationSchema = z.object({
  school: z.string(),
  major: z.string(),
  period: z.string(),
});

export const resumeProjectSchema = z.object({
  projectId: z.number().int().positive().describe("来源项目 ID，必须来自候选列表"),
  name: z.string(),
  role: z.string(),
  period: z.string().nullable().optional(),
  stack: z.array(z.string()),
  overview: z.string().describe("项目概要：基于原素材同义改写，禁止虚构"),
  details: z.array(z.string()).describe("项目描述要点：必须来自原项目 details，可重排/精简/改写，禁止新增"),
  results: z.array(z.string()).describe("项目成绩：必须来自原项目 results，禁止虚构数字"),
});

export const resumeDocumentSchema = z.object({
  profile: profileSchema,
  highlights: z.array(z.string()).describe("个人亮点，按 JD 相关性排序/筛选"),
  skills: z.record(skillCategorySchema, z.array(z.string())).describe("按 JD 相关性排序的技能"),
  workExperiences: z.array(workExperienceSchema),
  projects: z.array(resumeProjectSchema),
  education: educationSchema,
});
export type ResumeDocumentZ = z.infer<typeof resumeDocumentSchema>;

/* --------------------------------- import --------------------------------- */

/** /api/import 从 PDF 抽取项目用 */
export const projectInputSchema = z.object({
  name: z.string().describe("项目名称"),
  role: z.string().describe("在项目中的角色"),
  period: z.string().nullable().optional().describe("项目时间，如 2024.03 — 2025.06"),
  stack: z.array(z.string()).describe("技术栈"),
  overview: z.string().describe("项目概要"),
  details: z.array(z.string()).describe("项目描述/职责要点"),
  results: z.array(z.string()).describe("项目成绩/量化结果"),
  tags: z.array(z.string()).describe("自由标签，用于后续 JD 匹配"),
  domain: z.string().nullable().optional().describe("业务领域"),
  archived: z.boolean().optional().default(false),
});
export const projectInputListSchema = z.object({
  projects: z.array(projectInputSchema),
});
