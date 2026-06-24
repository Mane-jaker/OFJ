import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const STORE_DIR = join(homedir(), ".ofj");
const STORE_FILE = join(STORE_DIR, "connection.json");

export interface StoredConnection {
  port: number;
  hostname: string;
  pid: number;
  startedAt: string;
  lastHeartbeatAt: string;
}

function ensureDir(): void {
  mkdirSync(STORE_DIR, { recursive: true });
}

export function saveConnection(
  data: Omit<StoredConnection, "lastHeartbeatAt">,
): void {
  ensureDir();
  const existing = loadConnection();
  const payload: StoredConnection = {
    ...data,
    lastHeartbeatAt:
      existing?.lastHeartbeatAt ?? new Date().toISOString(),
  };
  writeFileSync(STORE_FILE, JSON.stringify(payload, null, 2), "utf-8");
}

export function loadConnection(): StoredConnection | null {
  if (!existsSync(STORE_FILE)) return null;
  try {
    const raw = readFileSync(STORE_FILE, "utf-8");
    return JSON.parse(raw) as StoredConnection;
  } catch {
    return null;
  }
}

export function clearConnection(): void {
  if (existsSync(STORE_FILE)) {
    try {
      unlinkSync(STORE_FILE);
    } catch {}
  }
}

export function updateHeartbeat(): void {
  const existing = loadConnection();
  if (!existing) return;
  existing.lastHeartbeatAt = new Date().toISOString();
  writeFileSync(STORE_FILE, JSON.stringify(existing, null, 2), "utf-8");
}

export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}
