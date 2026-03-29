import crypto from "crypto";
import type { SessionPayload, UserType } from "./session";

const SESSION_COOKIE = "eralocal_session";

function getSecret(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("NEXTAUTH_SECRET must be at least 16 characters");
  }
  return crypto.scryptSync(secret, "eralocal-session-salt", 32);
}

export function decryptSessionToken(token: string): SessionPayload | null {
  try {
    const key = getSecret();
    const data = Buffer.from(token, "base64url");
    if (data.length < 33) return null;

    const iv = data.subarray(0, 16);
    const authTag = data.subarray(16, 32);
    const encrypted = data.subarray(32);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export type AuthCheckResult =
  | { needsAuth: false; session?: SessionPayload }
  | { needsAuth: true; redirectTo: string; forbidden?: never }
  | { needsAuth: true; forbidden: true; redirectTo?: never };

export function checkRouteAuth(
  pathname: string,
  cookieValue: string | undefined,
): AuthCheckResult {
  const protectedPrefixes: { prefix: string; allowedTypes: UserType[]; loginRedirect: string }[] = [
    { prefix: "/dashboard", allowedTypes: ["merchant"], loginRedirect: "/auth/login" },
    { prefix: "/vitrine", allowedTypes: ["merchant"], loginRedirect: "/auth/login" },
    { prefix: "/boutique", allowedTypes: ["merchant"], loginRedirect: "/auth/login" },
    { prefix: "/stock", allowedTypes: ["merchant"], loginRedirect: "/auth/login" },
    { prefix: "/scanner", allowedTypes: ["merchant"], loginRedirect: "/auth/login" },
    { prefix: "/evenements-gestion", allowedTypes: ["merchant"], loginRedirect: "/auth/login" },
    { prefix: "/activites-gestion", allowedTypes: ["merchant"], loginRedirect: "/auth/login" },
    { prefix: "/employes", allowedTypes: ["merchant"], loginRedirect: "/auth/login" },
    { prefix: "/reglages", allowedTypes: ["merchant"], loginRedirect: "/auth/login" },
    { prefix: "/commandes-marchand", allowedTypes: ["merchant"], loginRedirect: "/auth/login" },
    { prefix: "/panier", allowedTypes: ["consumer"], loginRedirect: "/auth/client/login" },
    { prefix: "/checkout", allowedTypes: ["consumer"], loginRedirect: "/auth/client/login" },
    { prefix: "/commandes", allowedTypes: ["consumer"], loginRedirect: "/auth/client/login" },
    { prefix: "/favoris", allowedTypes: ["consumer"], loginRedirect: "/auth/client/login" },
    { prefix: "/notifications", allowedTypes: ["consumer"], loginRedirect: "/auth/client/login" },
    { prefix: "/profil", allowedTypes: ["consumer"], loginRedirect: "/auth/client/login" },
    { prefix: "/admin", allowedTypes: ["admin"], loginRedirect: "/auth/admin" },
    { prefix: "/city", allowedTypes: ["city"], loginRedirect: "/auth/city" },
  ];

  const matched = protectedPrefixes.find((p) => pathname.startsWith(p.prefix));
  if (!matched) {
    // Public route — no auth needed
    const session = cookieValue ? decryptSessionToken(cookieValue) : undefined;
    return { needsAuth: false, session: session ?? undefined };
  }

  // Protected route — need a valid session
  if (!cookieValue) {
    return { needsAuth: true, redirectTo: matched.loginRedirect };
  }

  const session = decryptSessionToken(cookieValue);
  if (!session) {
    return { needsAuth: true, redirectTo: matched.loginRedirect };
  }

  // Check user type
  if (!matched.allowedTypes.includes(session.userType)) {
    return { needsAuth: true, forbidden: true };
  }

  return { needsAuth: false, session };
}

export { SESSION_COOKIE };
