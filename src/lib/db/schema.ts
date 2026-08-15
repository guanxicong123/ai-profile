/**
 * SQLite 建表语句。类型对齐 src/lib/types.ts。
 * 启动时由 db/index.ts 执行 CREATE TABLE IF NOT EXISTS。
 */

export const SCHEMA_SQL: string[] = [
  // profile：单行表（固定 id=1）
  `CREATE TABLE IF NOT EXISTS profile (
    id            INTEGER PRIMARY KEY CHECK (id = 1),
    name          TEXT NOT NULL DEFAULT '',
    title         TEXT NOT NULL DEFAULT '',
    birth         TEXT NOT NULL DEFAULT '',
    phone         TEXT NOT NULL DEFAULT '',
    email         TEXT NOT NULL DEFAULT '',
    location      TEXT NOT NULL DEFAULT '',
    years         TEXT NOT NULL DEFAULT '',
    online_resume TEXT,
    tagline       TEXT,
    summary       TEXT NOT NULL DEFAULT '',
    industry      TEXT NOT NULL DEFAULT '',
    photo_path    TEXT
  );`,

  `CREATE TABLE IF NOT EXISTS highlights (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    sort    INTEGER NOT NULL DEFAULT 0
  );`,

  `CREATE TABLE IF NOT EXISTS skills (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    content  TEXT NOT NULL,
    sort     INTEGER NOT NULL DEFAULT 0
  );`,

  `CREATE TABLE IF NOT EXISTS work_experiences (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    company      TEXT NOT NULL,
    role         TEXT NOT NULL,
    period       TEXT NOT NULL,
    duties       TEXT NOT NULL DEFAULT '[]',
    achievements TEXT NOT NULL DEFAULT '[]',
    sort         INTEGER NOT NULL DEFAULT 0
  );`,

  `CREATE TABLE IF NOT EXISTS projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    role        TEXT NOT NULL,
    period      TEXT,
    stack       TEXT NOT NULL DEFAULT '[]',
    overview    TEXT NOT NULL DEFAULT '',
    details     TEXT NOT NULL DEFAULT '[]',
    results     TEXT NOT NULL DEFAULT '[]',
    tags        TEXT NOT NULL DEFAULT '[]',
    domain      TEXT,
    archived    INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );`,

  // education：单行表（固定 id=1）
  `CREATE TABLE IF NOT EXISTS education (
    id     INTEGER PRIMARY KEY CHECK (id = 1),
    school TEXT NOT NULL DEFAULT '',
    major  TEXT NOT NULL DEFAULT '',
    period TEXT NOT NULL DEFAULT ''
  );`,

  `CREATE TABLE IF NOT EXISTS jd_sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    jd_text     TEXT NOT NULL,
    target_role TEXT,
    parsed_jd   TEXT,
    scores      TEXT,
    created_at  TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS generated_resumes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    jd_text     TEXT NOT NULL,
    target_role TEXT,
    parsed_jd   TEXT NOT NULL DEFAULT '{}',
    scores      TEXT NOT NULL DEFAULT '[]',
    document    TEXT NOT NULL DEFAULT '{}',
    pdf_path    TEXT,
    created_at  TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );`,
];
