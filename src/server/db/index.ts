import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

let db: ReturnType<typeof drizzle<typeof schema>>;
let tablesCreated = false;

export function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  if (db) return db;

  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST;

  const sqlite = isTest
    ? new Database(":memory:")
    : new Database("src/server/db/data.db");

  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  db = drizzle(sqlite, { schema });

  if (!tablesCreated && !isTest) {
    createTables();
    tablesCreated = true;
  }

  return db;
}

export function createTables() {
  getDb();
  type RawDb = InstanceType<typeof Database>;
  const raw = (db as unknown as { session: { client: RawDb } }).session.client;

  raw.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      title TEXT,
      location TEXT,
      cv_text TEXT,
      cv_file_path TEXT,
      skills TEXT DEFAULT '[]',
      experience TEXT DEFAULT '[]',
      education TEXT DEFAULT '[]',
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE TABLE IF NOT EXISTS searches (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','running','completed','failed')),
      platforms TEXT DEFAULT '[]',
      search_terms TEXT DEFAULT '[]',
      model TEXT,
      filters TEXT DEFAULT '{}',
      results_count INTEGER DEFAULT 0,
      started_at INTEGER,
      completed_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE TABLE IF NOT EXISTS job_listings (
      id TEXT PRIMARY KEY,
      search_id TEXT NOT NULL REFERENCES searches(id),
      platform TEXT NOT NULL,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      description TEXT,
      url TEXT UNIQUE,
      location TEXT,
      salary_range TEXT,
      posted_date TEXT,
      relevance_score REAL,
      is_favorite INTEGER DEFAULT 0,
      is_viewed INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE TABLE IF NOT EXISTS generated_cvs (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      job_listing_id TEXT REFERENCES job_listings(id),
      content TEXT NOT NULL,
      tailored_summary TEXT,
      tailored_skills TEXT DEFAULT '[]',
      tailored_experience TEXT DEFAULT '[]',
      file_path TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
    );
  `);
}

export { schema };
