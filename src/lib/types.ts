/**
 * 共享数据类型 —— 前后端唯一事实源。
 * 后端 SQLite 仓储、API 路由、前端 UI 与 PDF 模板都基于此文件。
 * 字段对齐 D:/cong/personal-profile/src/data/resume.ts（已清洗的简历数据）。
 */

export type SkillCategory = "frontend" | "backend" | "platforms" | "engineering";

export interface Profile {
  name: string;
  title: string;
  birth: string;
  phone: string;
  email: string;
  location: string;
  years: string;
  onlineResume?: string;
  tagline?: string;
  summary: string;
  industry: string;
  photoPath?: string | null;
}

export interface Highlight {
  id: number;
  content: string;
  sort: number;
}

export interface Skill {
  id: number;
  category: SkillCategory;
  content: string;
  sort: number;
}

export interface WorkExperience {
  id: number;
  company: string;
  role: string;
  period: string;
  duties: string[];
  achievements: string[];
  sort: number;
}

export interface Project {
  id: number;
  name: string;
  role: string;
  period?: string | null;
  stack: string[];
  overview: string;
  details: string[];
  results: string[];
  /** 自由标签：用于 JD 匹配，如 ["音视频","移动端","React Native"] */
  tags: string[];
  /** 业务领域，如 "HR/低代码/广播/移动应用" */
  domain?: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  school: string;
  major: string;
  period: string;
}

/** 项目的可编辑输入形态（无 id/时间戳） */
export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;
export type WorkInput = Omit<WorkExperience, "id">;

/* ----------------------------- 简历成稿数据 ----------------------------- */

/**
 * ResumeDocument 是 PDF / 预览渲染的输入。
 * 由「固定素材 + LLM 根据 JD 选择/改写后的项目」组装而成。
 */
export interface ResumeDocument {
  profile: Profile;
  highlights: string[];
  skills: Record<SkillCategory, string[]>;
  workExperiences: WorkExperience[];
  projects: ResumeProject[];
  education: Education;
}

export interface ResumeProject {
  projectId: number;
  name: string;
  role: string;
  period?: string | null;
  stack: string[];
  overview: string;
  details: string[];
  results: string[];
}

/* ------------------------------- JD 匹配 -------------------------------- */

export interface ParsedJD {
  targetRole: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  responsibilities: string[];
  domains: string[];
  seniority: string;
}

export interface ProjectScore {
  projectId: number;
  name: string;
  score: number; // 0-100
  matchedSkills: string[];
  reason: string;
}

export interface GenerateRequest {
  jdText: string;
  targetRole?: string;
  /** 期望入选的项目数量，默认 5 */
  projectCount?: number;
  /** 模型设置覆盖（不传则用 settings） */
  modelOverride?: ModelConfig;
}

export interface GenerateResponse {
  sessionId: number;
  parsedJD: ParsedJD;
  scores: ProjectScore[];
  /** 最终成稿（已可直接渲染 PDF） */
  document: ResumeDocument;
  createdAt: string;
}

export interface GeneratedResume {
  id: number;
  jdText: string;
  targetRole: string | null;
  parsedJD: ParsedJD;
  scores: ProjectScore[];
  document: ResumeDocument;
  pdfPath: string | null;
  createdAt: string;
}

/* ------------------------------- 设置 ----------------------------------- */

export type ProviderKind = "anthropic" | "openai";

export interface ModelConfig {
  provider: ProviderKind;
  /** 模型 ID，如 claude-sonnet-5 / doubao-seed-1-6 / gpt-4o */
  model: string;
  apiKey: string;
  /** OpenAI 兼容端点（豆包等），anthropic 可留空 */
  baseURL?: string;
  temperature?: number;
}

export interface Settings {
  model: ModelConfig;
  projectCount: number;
}
