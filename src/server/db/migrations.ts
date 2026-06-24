import { getDb } from "./index";

type RawDb = import("better-sqlite3").Database;

function raw(): RawDb {
  const db = getDb();
  return (db as unknown as { session: { client: RawDb } }).session.client;
}

function columnExists(table: string, column: string): boolean {
  const rows = raw()
    .prepare(`PRAGMA table_info(${table})`)
    .all() as Array<{ name: string }>;
  return rows.some((r) => r.name === column);
}

function addColumn(
  table: string,
  column: string,
  definition: string,
): void {
  if (!columnExists(table, column)) {
    raw().exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export function runMigrations(): void {
  addColumn("profiles", "roles", "TEXT DEFAULT '[]'");
  addColumn("profiles", "salary_expectation", "TEXT");
}
