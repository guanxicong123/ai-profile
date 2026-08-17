/**
 * 各表增删改查。JSON 字段在此层透明序列化/反序列化。
 */
import { getDb } from "./index";
import type {
  Profile,
  Highlight,
  Skill,
  SkillCategory,
  WorkExperience,
  Project,
  ProjectInput,
  WorkInput,
  Education,
  GeneratedResume,
  ParsedJD,
  ProjectScore,
  ResumeDocument,
} from "@/lib/types";

/* -------------------------------- helpers -------------------------------- */

function nowIso(): string {
  return new Date().toISOString();
}

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

type ProjectRow = {
  id: number;
  name: string;
  role: string;
  period: string | null;
  stack: string;
  overview: string;
  details: string;
  results: string;
  tags: string;
  domain: string | null;
  archived: number;
  created_at: string;
  updated_at: string;
};

function rowToProject(r: ProjectRow): Project {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    period: r.period,
    stack: parseJson<string[]>(r.stack, []),
    overview: r.overview,
    details: parseJson<string[]>(r.details, []),
    results: parseJson<string[]>(r.results, []),
    tags: parseJson<string[]>(r.tags, []),
    domain: r.domain,
    archived: r.archived === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

type WorkRow = {
  id: number;
  company: string;
  role: string;
  period: string;
  duties: string;
  achievements: string;
  sort: number;
};

function rowToWork(r: WorkRow): WorkExperience {
  return {
    id: r.id,
    company: r.company,
    role: r.role,
    period: r.period,
    duties: parseJson<string[]>(r.duties, []),
    achievements: parseJson<string[]>(r.achievements, []),
    sort: r.sort,
  };
}

type GenRow = {
  id: number;
  jd_text: string;
  target_role: string | null;
  parsed_jd: string;
  scores: string;
  document: string;
  pdf_path: string | null;
  created_at: string;
};

function rowToGenerated(r: GenRow): GeneratedResume {
  return {
    id: r.id,
    jdText: r.jd_text,
    targetRole: r.target_role,
    parsedJD: parseJson<ParsedJD>(r.parsed_jd, {} as ParsedJD),
    scores: parseJson<ProjectScore[]>(r.scores, []),
    document: parseJson<ResumeDocument>(r.document, {} as ResumeDocument),
    pdfPath: r.pdf_path,
    createdAt: r.created_at,
  };
}

/* --------------------------------- profile -------------------------------- */

const DEFAULT_PROFILE: Profile = {
  name: "",
  title: "",
  birth: "",
  phone: "",
  email: "",
  location: "",
  years: "",
  summary: "",
  industry: "",
};

export function getProfile(): Profile {
  const db = getDb();
  const row = db.prepare("SELECT * FROM profile WHERE id = 1").get() as
    | (Record<string, unknown> & { id: number })
    | undefined;
  if (!row) return { ...DEFAULT_PROFILE };
  return {
    name: String(row.name ?? ""),
    title: String(row.title ?? ""),
    birth: String(row.birth ?? ""),
    phone: String(row.phone ?? ""),
    email: String(row.email ?? ""),
    location: String(row.location ?? ""),
    years: String(row.years ?? ""),
    onlineResume: row.online_resume != null ? String(row.online_resume) : undefined,
    tagline: row.tagline != null ? String(row.tagline) : undefined,
    summary: String(row.summary ?? ""),
    industry: String(row.industry ?? ""),
    photoPath: row.photo_path != null ? String(row.photo_path) : null,
  };
}

export function upsertProfile(p: Profile): Profile {
  const db = getDb();
  db.prepare(
    `INSERT INTO profile (id, name, title, birth, phone, email, location, years, online_resume, tagline, summary, industry, photo_path)
     VALUES (1, @name, @title, @birth, @phone, @email, @location, @years, @online_resume, @tagline, @summary, @industry, @photo_path)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, title=excluded.title, birth=excluded.birth, phone=excluded.phone,
       email=excluded.email, location=excluded.location, years=excluded.years,
       online_resume=excluded.online_resume, tagline=excluded.tagline,
       summary=excluded.summary, industry=excluded.industry, photo_path=excluded.photo_path`
  ).run({
    name: p.name,
    title: p.title,
    birth: p.birth,
    phone: p.phone,
    email: p.email,
    location: p.location,
    years: p.years,
    online_resume: p.onlineResume ?? null,
    tagline: p.tagline ?? null,
    summary: p.summary,
    industry: p.industry,
    photo_path: p.photoPath ?? null,
  });
  return getProfile();
}

/* ------------------------------- highlights ------------------------------- */

export function listHighlights(): Highlight[] {
  const db = getDb();
  return (db.prepare("SELECT id, content, sort FROM highlights ORDER BY sort ASC, id ASC").all() as Highlight[]).map(
    (r) => ({ id: r.id, content: r.content, sort: r.sort })
  );
}

export function createHighlight(content: string, sort = 0): Highlight {
  const db = getDb();
  const info = db.prepare("INSERT INTO highlights (content, sort) VALUES (?, ?)").run(content, sort);
  return { id: Number(info.lastInsertRowid), content, sort };
}

export function updateHighlight(id: number, patch: Partial<Omit<Highlight, "id">>): Highlight | null {
  const db = getDb();
  const cur = db.prepare("SELECT id, content, sort FROM highlights WHERE id = ?").get(id) as Highlight | undefined;
  if (!cur) return null;
  const next = { content: patch.content ?? cur.content, sort: patch.sort ?? cur.sort };
  db.prepare("UPDATE highlights SET content = ?, sort = ? WHERE id = ?").run(next.content, next.sort, id);
  return { id, ...next };
}

export function deleteHighlight(id: number): boolean {
  const info = getDb().prepare("DELETE FROM highlights WHERE id = ?").run(id);
  return info.changes > 0;
}

/* --------------------------------- skills --------------------------------- */

export function listSkills(): Skill[] {
  const db = getDb();
  return (db.prepare("SELECT id, category, content, sort FROM skills ORDER BY sort ASC, id ASC").all() as Skill[]).map(
    (r) => ({ id: r.id, category: r.category as SkillCategory, content: r.content, sort: r.sort })
  );
}

export function createSkill(category: SkillCategory, content: string, sort = 0): Skill {
  const db = getDb();
  const info = db.prepare("INSERT INTO skills (category, content, sort) VALUES (?, ?, ?)").run(category, content, sort);
  return { id: Number(info.lastInsertRowid), category, content, sort };
}

export function updateSkill(id: number, patch: Partial<Omit<Skill, "id">>): Skill | null {
  const db = getDb();
  const cur = db.prepare("SELECT id, category, content, sort FROM skills WHERE id = ?").get(id) as Skill | undefined;
  if (!cur) return null;
  const next = {
    category: (patch.category ?? cur.category) as SkillCategory,
    content: patch.content ?? cur.content,
    sort: patch.sort ?? cur.sort,
  };
  db.prepare("UPDATE skills SET category = ?, content = ?, sort = ? WHERE id = ?").run(
    next.category,
    next.content,
    next.sort,
    id
  );
  return { id, ...next };
}

export function deleteSkill(id: number): boolean {
  const info = getDb().prepare("DELETE FROM skills WHERE id = ?").run(id);
  return info.changes > 0;
}

/* ---------------------------------- work ---------------------------------- */

export function listWork(): WorkExperience[] {
  const db = getDb();
  return (db.prepare("SELECT * FROM work_experiences ORDER BY sort ASC, id ASC").all() as WorkRow[]).map(rowToWork);
}

export function createWork(input: WorkInput): WorkExperience {
  const db = getDb();
  const sort = input.sort ?? 0;
  const info = db
    .prepare(
      `INSERT INTO work_experiences (company, role, period, duties, achievements, sort)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.company,
      input.role,
      input.period,
      JSON.stringify(input.duties ?? []),
      JSON.stringify(input.achievements ?? []),
      sort
    );
  return { id: Number(info.lastInsertRowid), ...input, sort };
}

export function updateWork(id: number, patch: Partial<WorkInput>): WorkExperience | null {
  const db = getDb();
  const cur = db.prepare("SELECT * FROM work_experiences WHERE id = ?").get(id) as WorkRow | undefined;
  if (!cur) return null;
  const current = rowToWork(cur);
  const next: WorkExperience = {
    ...current,
    company: patch.company ?? current.company,
    role: patch.role ?? current.role,
    period: patch.period ?? current.period,
    duties: patch.duties ?? current.duties,
    achievements: patch.achievements ?? current.achievements,
    sort: patch.sort ?? current.sort,
  };
  db.prepare(
    `UPDATE work_experiences SET company=?, role=?, period=?, duties=?, achievements=?, sort=? WHERE id=?`
  ).run(
    next.company,
    next.role,
    next.period,
    JSON.stringify(next.duties),
    JSON.stringify(next.achievements),
    next.sort,
    id
  );
  return next;
}

export function deleteWork(id: number): boolean {
  const info = getDb().prepare("DELETE FROM work_experiences WHERE id = ?").run(id);
  return info.changes > 0;
}

/* -------------------------------- projects -------------------------------- */

export interface ProjectListFilter {
  q?: string;
  domain?: string;
  archived?: boolean;
}

export function listProjects(filter: ProjectListFilter = {}): Project[] {
  const db = getDb();
  const where: string[] = [];
  const params: Record<string, unknown> = {};

  // archived 默认只返回未归档；显式传 undefined 时返回全部
  if (filter.archived !== undefined) {
    where.push("archived = @archived");
    params.archived = filter.archived ? 1 : 0;
  }
  if (filter.domain) {
    where.push("domain = @domain");
    params.domain = filter.domain;
  }
  if (filter.q) {
    where.push("(name LIKE @q OR overview LIKE @q OR domain LIKE @q OR tags LIKE @q OR stack LIKE @q)");
    params.q = `%${filter.q}%`;
  }

  const sql = `SELECT * FROM projects ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY archived ASC, updated_at DESC, id DESC`;
  return (db.prepare(sql).all(params) as ProjectRow[]).map(rowToProject);
}

export function getProject(id: number): Project | null {
  const row = getDb().prepare("SELECT * FROM projects WHERE id = ?").get(id) as ProjectRow | undefined;
  return row ? rowToProject(row) : null;
}

export function createProject(input: ProjectInput): Project {
  const db = getDb();
  const ts = nowIso();
  const info = db
    .prepare(
      `INSERT INTO projects (name, role, period, stack, overview, details, results, tags, domain, archived, created_at, updated_at)
       VALUES (@name, @role, @period, @stack, @overview, @details, @results, @tags, @domain, @archived, @created_at, @updated_at)`
    )
    .run({
      name: input.name,
      role: input.role,
      period: input.period ?? null,
      stack: JSON.stringify(input.stack ?? []),
      overview: input.overview ?? "",
      details: JSON.stringify(input.details ?? []),
      results: JSON.stringify(input.results ?? []),
      tags: JSON.stringify(input.tags ?? []),
      domain: input.domain ?? null,
      archived: input.archived ? 1 : 0,
      created_at: ts,
      updated_at: ts,
    });
  return getProject(Number(info.lastInsertRowid))!;
}

export function updateProject(id: number, patch: Partial<ProjectInput>): Project | null {
  const db = getDb();
  const cur = getProject(id);
  if (!cur) return null;
  const next: ProjectInput = {
    name: patch.name ?? cur.name,
    role: patch.role ?? cur.role,
    period: patch.period !== undefined ? patch.period : cur.period,
    stack: patch.stack ?? cur.stack,
    overview: patch.overview ?? cur.overview,
    details: patch.details ?? cur.details,
    results: patch.results ?? cur.results,
    tags: patch.tags ?? cur.tags,
    domain: patch.domain !== undefined ? patch.domain : cur.domain,
    archived: patch.archived ?? cur.archived,
  };
  db.prepare(
    `UPDATE projects SET name=@name, role=@role, period=@period, stack=@stack, overview=@overview,
       details=@details, results=@results, tags=@tags, domain=@domain, archived=@archived, updated_at=@updated_at
     WHERE id=@id`
  ).run({
    name: next.name,
    role: next.role,
    period: next.period ?? null,
    stack: JSON.stringify(next.stack),
    overview: next.overview,
    details: JSON.stringify(next.details),
    results: JSON.stringify(next.results),
    tags: JSON.stringify(next.tags),
    domain: next.domain ?? null,
    archived: next.archived ? 1 : 0,
    updated_at: nowIso(),
    id,
  });
  return getProject(id);
}

export function deleteProject(id: number): boolean {
  const info = getDb().prepare("DELETE FROM projects WHERE id = ?").run(id);
  return info.changes > 0;
}

/* ------------------------------- education -------------------------------- */

export function getEducation(): Education {
  const db = getDb();
  const row = db.prepare("SELECT school, major, period FROM education WHERE id = 1").get() as
    | Education
    | undefined;
  return row ?? { school: "", major: "", period: "" };
}

export function upsertEducation(e: Education): Education {
  const db = getDb();
  db.prepare(
    `INSERT INTO education (id, school, major, period) VALUES (1, @school, @major, @period)
     ON CONFLICT(id) DO UPDATE SET school=excluded.school, major=excluded.major, period=excluded.period`
  ).run({ school: e.school, major: e.major, period: e.period });
  return getEducation();
}

/* --------------------------- generated_resumes ---------------------------- */

export interface CreateGeneratedInput {
  jdText: string;
  targetRole?: string | null;
  parsedJD: ParsedJD;
  scores: ProjectScore[];
  document: ResumeDocument;
  pdfPath?: string | null;
}

export function createGenerated(input: CreateGeneratedInput): GeneratedResume {
  const db = getDb();
  const ts = nowIso();
  const info = db
    .prepare(
      `INSERT INTO generated_resumes (jd_text, target_role, parsed_jd, scores, document, pdf_path, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.jdText,
      input.targetRole ?? null,
      JSON.stringify(input.parsedJD),
      JSON.stringify(input.scores),
      JSON.stringify(input.document),
      input.pdfPath ?? null,
      ts
    );
  return getGenerated(Number(info.lastInsertRowid))!;
}

export function getGenerated(id: number): GeneratedResume | null {
  const row = getDb().prepare("SELECT * FROM generated_resumes WHERE id = ?").get(id) as GenRow | undefined;
  return row ? rowToGenerated(row) : null;
}

export function listGenerated(): GeneratedResume[] {
  return (getDb().prepare("SELECT * FROM generated_resumes ORDER BY created_at DESC, id DESC").all() as GenRow[]).map(
    rowToGenerated
  );
}

export function deleteGenerated(id: number): boolean {
  const info = getDb().prepare("DELETE FROM generated_resumes WHERE id = ?").run(id);
  return info.changes > 0;
}

export function setGeneratedPdfPath(id: number, pdfPath: string): void {
  getDb().prepare("UPDATE generated_resumes SET pdf_path = ? WHERE id = ?").run(pdfPath, id);
}

/**
 * 回写编辑后的简历正文（预览页整份编辑后保存）。
 * 只更新 document 字段；generated_resumes 无 updated_at，不改时间戳。
 * 记录不存在返回 null。
 */
export function updateGenerated(
  id: number,
  patch: { document: ResumeDocument }
): GeneratedResume | null {
  const info = getDb()
    .prepare("UPDATE generated_resumes SET document = ? WHERE id = ?")
    .run(JSON.stringify(patch.document), id);
  if (info.changes === 0) return null;
  return getGenerated(id);
}

/* -------------------------------- settings -------------------------------- */

export function getSetting(key: string): string | null {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

export function setSetting(key: string, value: string): void {
  getDb()
    .prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    )
    .run(key, value);
}

/* --------------------------- seed support (reset) ------------------------- */

export function resetForSeed(): void {
  const db = getDb();
  const tables = [
    "highlights",
    "skills",
    "work_experiences",
    "projects",
    "generated_resumes",
    "jd_sessions",
    "profile",
    "education",
  ];
  const tx = db.transaction(() => {
    for (const t of tables) db.exec(`DELETE FROM ${t}`);
  });
  tx();
}
