import { spawn, type ChildProcess } from "node:child_process";
import { createServer, type AddressInfo } from "node:net";
import { createOpencodeClient } from "@opencode-ai/sdk";
import { clearModel } from "./model-store";
import {
  saveConnection,
  loadConnection,
  clearConnection,
  isProcessAlive,
  updateHeartbeat,
} from "./connection-store";
import { isHeartbeatStale, HEARTBEAT_TIMEOUT_MS } from "./heartbeat";

export interface OpencodeConnection {
  port: number;
  hostname: string;
  client: ReturnType<typeof createOpencodeClient>;
  pid: number;
  startedAt: Date;
}

let connection: OpencodeConnection | null = null;
let child: ChildProcess | null = null;
let heartbeatCheckInterval: ReturnType<typeof setInterval> | null = null;

function findAvailablePort(start: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(start, "127.0.0.1", () => {
      const port = (server.address() as AddressInfo)?.port;
      server.close(() => resolve(port as number));
    });
    server.on("error", () => {
      if (start < 65535) resolve(findAvailablePort(start + 1));
      else reject(new Error("No available ports found"));
    });
  });
}

function waitForHealth(
  port: number,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<void> {
  const start = Date.now();
  return new Promise<void>((resolve, reject) => {
    function check() {
      if (signal?.aborted) {
        reject(new Error("Aborted"));
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error("Server did not become healthy within timeout"));
        return;
      }
      fetch(`http://127.0.0.1:${port}/global/health`)
        .then((res) => {
          if (res.ok) resolve();
          else setTimeout(check, 200);
        })
        .catch(() => setTimeout(check, 200));
    }
    check();
  });
}

function startHeartbeatWatcher(): void {
  if (heartbeatCheckInterval) return;
  heartbeatCheckInterval = setInterval(() => {
    if (!connection) {
      if (heartbeatCheckInterval) {
        clearInterval(heartbeatCheckInterval);
        heartbeatCheckInterval = null;
      }
      return;
    }
    const stored = loadConnection();
    if (stored && isHeartbeatStale(stored.lastHeartbeatAt)) {
      cleanup();
    }
  }, 30_000);
}

function stopHeartbeatWatcher(): void {
  if (heartbeatCheckInterval) {
    clearInterval(heartbeatCheckInterval);
    heartbeatCheckInterval = null;
  }
}

function tryRestoreFromFile(): void {
  const stored = loadConnection();
  if (!stored) return;

  if (!isProcessAlive(stored.pid)) {
    clearConnection();
    return;
  }

  const client = createOpencodeClient({
    baseUrl: `http://${stored.hostname}:${stored.port}`,
  });
  connection = {
    port: stored.port,
    hostname: stored.hostname,
    client,
    pid: stored.pid,
    startedAt: new Date(stored.startedAt),
  };

  startHeartbeatWatcher();
}

tryRestoreFromFile();

export async function connect(
  signal?: AbortSignal,
): Promise<OpencodeConnection> {
  if (connection) {
    return connection;
  }

  const port = await findAvailablePort(4096);

  child = spawn(
    "opencode",
    [
      "serve",
      "--port",
      String(port),
      "--hostname",
      "127.0.0.1",
      "--cors",
      "http://localhost:3000",
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  child.stdout?.on("data", () => {});
  child.stderr?.on("data", () => {});

  child.on("error", (err) => {
    console.error("opencode serve error:", err.message);
    cleanup();
  });

  child.on("exit", (code) => {
    if (connection) {
      console.error("opencode server exited unexpectedly with code", code);
      cleanup();
    }
  });

  try {
    await waitForHealth(port, 15_000, signal);
  } catch (err) {
    cleanup();
    throw err;
  }

  const client = createOpencodeClient({
    baseUrl: `http://127.0.0.1:${port}`,
  });

  connection = {
    port,
    hostname: "127.0.0.1",
    client,
    pid: child.pid!,
    startedAt: new Date(),
  };

  saveConnection({
    port,
    hostname: "127.0.0.1",
    pid: child.pid!,
    startedAt: connection.startedAt.toISOString(),
  });

  startHeartbeatWatcher();

  return connection;
}

function cleanup(): void {
  if (child) {
    try {
      child.kill("SIGTERM");
    } catch {}
    child = null;
  }
  connection = null;
  clearModel();
  clearConnection();
  stopHeartbeatWatcher();
}

export function disconnect(): void {
  cleanup();
}

export function getConnection(): OpencodeConnection | null {
  if (!connection) return null;

  const stored = loadConnection();
  if (stored && isHeartbeatStale(stored.lastHeartbeatAt)) {
    cleanup();
    return null;
  }

  return connection;
}

export function isConnected(): boolean {
  return getConnection() !== null;
}

export async function checkHealth(): Promise<boolean> {
  const conn = getConnection();
  if (!conn) return false;
  try {
    const res = await fetch(
      `http://127.0.0.1:${conn.port}/global/health`,
    );
    return res.ok;
  } catch {
    return false;
  }
}

if (typeof process !== "undefined") {
  const handleExit = () => {
    stopHeartbeatWatcher();
    if (connection) {
      cleanup();
    }
  };
  process.on("exit", handleExit);
  process.on("SIGTERM", handleExit);
  process.on("SIGINT", handleExit);
}
