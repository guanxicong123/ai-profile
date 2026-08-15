import type { ResumeDocument } from "@/lib/types";
import seed from "../../../scripts/seed-data.json";

const data = seed as any;

export const mockResumeDocument: ResumeDocument = {
  profile: data.profile,
  highlights: data.highlights,
  skills: data.skills,
  workExperiences: data.work.map((w: any, i: number) => ({
    id: i + 1,
    company: w.company,
    role: w.role,
    period: w.period,
    duties: w.duties,
    achievements: w.achievements,
    sort: i,
  })),
  projects: data.projects.map((p: any, i: number) => ({
    projectId: i + 1,
    name: p.name,
    role: p.role,
    period: p.period ?? null,
    stack: p.stack,
    overview: p.overview,
    details: p.details,
    results: p.results,
  })),
  education: data.education,
};
