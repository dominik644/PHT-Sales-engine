import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDemoMode } from "@/lib/env";
import { createRequestId } from "@/lib/logger";

export function proxy(request: NextRequest) {
  const requestId = createRequestId(request.headers.get("x-request-id"));
  const response = NextResponse.next({
    request: {
      headers: (() => {
        const headers = new Headers(request.headers);
        headers.set("x-request-id", requestId);
        return headers;
      })(),
    },
  });

  response.headers.set("x-request-id", requestId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  response.headers.set("X-DNS-Prefetch-Control", "off");

  const isProd = process.env.NODE_ENV === "production";
  const goLiveHardening = isProd && !getDemoMode();
  const scriptSrc = isProd
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "style-src 'self' 'unsafe-inline'",
      scriptSrc,
      "connect-src 'self'",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      ...(goLiveHardening ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  );

  if (goLiveHardening) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  const path = request.nextUrl.pathname;
  if (
    path.startsWith("/admin") ||
    path.startsWith("/account") ||
    path.startsWith("/api/")
  ) {
    response.headers.set("Cache-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
