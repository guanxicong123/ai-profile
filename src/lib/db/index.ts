/**
 * better-sqlite3 单例。
 * 路径：data/<DB_FILE>（DB_FILE 默认 app.db，可用环境变量覆盖），启动确保目录存在；开启 WAL。
 * 在模块加载时执行建表（CREATE TABLE IF NOT EXISTS）。
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA_SQL } from "./schema";

const DB_FILE = process.env.DB_FILE || "app.db";

let _db: Database.Database | null = null;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function getDb(): Database.Database {
  if (_db) return _db;

  const dir = path.join(process.cwd(), "data");
  ensureDir(dir);
  const abs = path.join(dir, DB_FILE);

  const db = new Database(abs);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  const migrate = db.transaction(() => {
    for (const sql of SCHEMA_SQL) db.exec(sql);
  });
  migrate();

  _db = db;
  return db;
}
