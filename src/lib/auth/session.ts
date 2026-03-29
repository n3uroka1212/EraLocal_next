import { cookies } from "next/headers";
import crypto from "crypto";

export type UserType = "merchant" | "consumer" | "admin" | "city";

export interface SessionPayload {
  userId: number;
  userType: UserType;
  shopId?: number;
  permissions?: Record<string, boolean>;
}

const SESSION_COOKIE = "eralocal_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

const isProduction = process.env.NODE_ENV === "production";

function getSecret(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("NEXTAUTH_SECRET must be at least 16 characters");
  }
  return crypto.scryptSync(secret, "eralocal-session-salt", 32);
}

function encrypt(payload: SessionPayload): string {
  const key = getSecret();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const json = JSON.stringify(payload);
  const encrypted = Buffer.concat([
    cipher.update(json, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // iv (16) + authTag (16) + encrypted
  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

function decrypt(token: string): SessionPayload | null {
  try {
    const key = getSecret();
    const data = Buffer.from(token, "base64url");

    if (data.length < 33) return null; // iv(16) + authTag(16) + min 1 byte

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

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = encrypt(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);

  if (!cookie?.value) return null;

  return decrypt(cookie.value);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function refreshSession(): Promise<void> {
  const session = await getSession();
  if (session) {
    await createSession(session);
  }
}

// Exported for unit testing
export { encrypt, decrypt, SESSION_COOKIE, SESSION_MAX_AGE };
