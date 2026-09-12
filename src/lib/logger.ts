import { randomUUID } from "node:crypto";

type LogLevel = "debug" | "info" | "warn" | "error";

const SECRET_KEYS =
  /password|secret|token|authorization|cookie|client_secret|apikey|api_key/i;

function redact(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value === "string") {
    if (value.length > 500) return `${value.slice(0, 500)}…`;
    return value;
  }
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SECRET_KEYS.test(k) ? "[redacted]" : redact(v);
    }
    return out;
  }
  return value;
}

function write(level: LogLevel, message: string, fields?: Record<string, unknown>) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...(fields ? (redact(fields) as Record<string, unknown>) : {}),
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (message: string, fields?: Record<string, unknown>) =>
    write("debug", message, fields),
  info: (message: string, fields?: Record<string, unknown>) =>
    write("info", message, fields),
  warn: (message: string, fields?: Record<string, unknown>) =>
    write("warn", message, fields),
  error: (message: string, fields?: Record<string, unknown>) =>
    write("error", message, fields),
};

export function createRequestId(existing?: string | null): string {
  if (existing && existing.length <= 64) return existing;
  return randomUUID();
}

export function logApiError(
  requestId: string,
  route: string,
  error: unknown,
  extra?: Record<string, unknown>,
) {
  logger.error("api_error", {
    requestId,
    route,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack?.split("\n").slice(0, 4) : undefined,
    ...extra,
  });
}
