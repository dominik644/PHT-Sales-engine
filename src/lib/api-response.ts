import { NextResponse } from "next/server";
import { createRequestId, logApiError } from "@/lib/logger";

export function jsonOk<T extends Record<string, unknown>>(
  body: T,
  init?: { status?: number; requestId?: string },
) {
  const requestId = init?.requestId ?? createRequestId();
  return NextResponse.json(
    { ...body, requestId },
    {
      status: init?.status ?? 200,
      headers: { "x-request-id": requestId },
    },
  );
}

export function jsonError(
  status: number,
  publicMessage: string,
  options?: {
    requestId?: string;
    route?: string;
    cause?: unknown;
    details?: unknown;
  },
) {
  const requestId = options?.requestId ?? createRequestId();
  if (options?.cause || status >= 500) {
    logApiError(requestId, options?.route ?? "unknown", options?.cause ?? publicMessage);
  }
  return NextResponse.json(
    {
      error: publicMessage,
      requestId,
      ...(options?.details && status < 500 ? { details: options.details } : {}),
    },
    {
      status,
      headers: {
        "x-request-id": requestId,
        "Cache-Control": "no-store",
      },
    },
  );
}

/** Map thrown auth/domain errors to safe HTTP responses. */
export function fromThrownError(
  error: unknown,
  route: string,
  requestId?: string,
): NextResponse {
  const message = error instanceof Error ? error.message : "UNKNOWN";
  if (message === "UNAUTHORIZED") {
    return jsonError(401, "Nicht angemeldet.", { requestId, route });
  }
  if (message === "COMPANY_INACTIVE") {
    return jsonError(403, "Firma noch nicht freigeschaltet.", {
      requestId,
      route,
    });
  }
  if (message === "FORBIDDEN") {
    return jsonError(403, "Keine Berechtigung.", { requestId, route });
  }
  return jsonError(500, "Interner Fehler. Bitte später erneut versuchen.", {
    requestId,
    route,
    cause: error,
  });
}
