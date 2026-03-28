import { NextRequest, NextResponse } from "next/server";

const isProduction = process.env.NODE_ENV === "production";

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = !isProduction;

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline' https://unpkg.com;
    img-src 'self' blob: data: https://*.tile.openstreetmap.org;
    font-src 'self';
    connect-src 'self' https://api.stripe.com${isDev ? " ws://localhost:*" : ""};
    frame-src https://js.stripe.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isProduction ? "upgrade-insecure-requests;" : ""}
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Security headers
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)",
  );

  if (isProduction) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
