import { NextRequest, NextResponse } from "next/server";
import { checkRouteAuth, SESSION_COOKIE } from "@/lib/auth/proxy-auth";

const isProduction = process.env.NODE_ENV === "production";

export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = !isProduction;

  // --- Auth check ---
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const authResult = checkRouteAuth(pathname, sessionCookie);

  if (authResult.needsAuth) {
    if ("forbidden" in authResult) {
      // Wrong user type → 403
      return NextResponse.rewrite(new URL("/forbidden", request.url), {
        status: 403,
      });
    }
    // Not authenticated → redirect to login
    const loginUrl = new URL(authResult.redirectTo, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // --- CSP & security headers ---
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

  // Pass session info to Server Components via headers
  if (authResult.session) {
    requestHeaders.set(
      "x-session",
      JSON.stringify(authResult.session),
    );
  }

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
