/**
 * 种子数据导入：清空并重写 profile/highlights/skills/work/projects/education。
 * 运行：npm run seed （tsx scripts/seed.ts）
 */
import { getDb } from "../src/lib/db/index";
import {
  resetForSeed,
  upsertProfile,
  createHighlight,
  createSkill,
  createWork,
  createProject,
  upsertEducation,
  listProjects,
} from "../src/lib/db/repos";
import type { Profile, SkillCategory, WorkInput, ProjectInput } from "../src/lib/types";
import seed from "./seed-data.json";

interface SeedShape {
  profile: Profile;
  highlights: string[];
  skills: Record<SkillCategory, string[]>;
  work: Array<Omit<WorkInput, "sort">>;
  education: { school: string; major: string; period: string };
  projects: ProjectInput[];
}

function main() {
  // 触发建表
  getDb();
  resetForSeed();

  const data = seed as SeedShape;

  upsertProfile(data.profile);

  data.highlights.forEach((content, i) => createHighlight(content, i));

  (Object.keys(data.skills) as SkillCategory[]).forEach((category) => {
    data.skills[category].forEach((content, i) => createSkill(category, content, i));
  });

  data.work.forEach((w, i) => {
    createWork({ ...w, sort: i });
  });

  data.projects.forEach((p) => {
    createProject({ ...p, archived: false });
  });

  upsertEducation(data.education);

  const projects = listProjects();
  console.log(`✅ Seed 完成：projects=${projects.length}`);
  projects.forEach((p) => console.log(`   - [${p.id}] ${p.name} (${p.domain ?? "-"})`));
}

main();
