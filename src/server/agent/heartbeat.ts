export const HEARTBEAT_INTERVAL_MS = 30_000;
export const HEARTBEAT_TIMEOUT_MS = 2 * 60_000;

export function isHeartbeatStale(lastHeartbeatAt: string): boolean {
  const last = new Date(lastHeartbeatAt).getTime();
  return Date.now() - last > HEARTBEAT_TIMEOUT_MS;
}
