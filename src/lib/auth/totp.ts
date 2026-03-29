import { TOTP, Secret } from "otpauth";
import QRCode from "qrcode";
import crypto from "crypto";

const ISSUER = "EraLocal";
const TOTP_PERIOD = 30; // seconds
const TOTP_WINDOW = 1; // +/- 1 period tolerance

function createTOTP(secret: string, accountName: string): TOTP {
  return new TOTP({
    issuer: ISSUER,
    label: accountName,
    algorithm: "SHA1",
    digits: 6,
    period: TOTP_PERIOD,
    secret: Secret.fromBase32(secret),
  });
}

export function generateTOTPSecret(): string {
  const secret = new Secret({ size: 20 });
  return secret.base32;
}

export function verifyTOTPCode(secret: string, code: string, accountName = ""): boolean {
  const totp = createTOTP(secret, accountName);
  const delta = totp.validate({ token: code, window: TOTP_WINDOW });
  return delta !== null;
}

export async function generateTOTPQRCode(
  secret: string,
  accountName: string,
): Promise<string> {
  const totp = createTOTP(secret, accountName);
  const uri = totp.toString();
  return QRCode.toDataURL(uri);
}

export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    // Format: XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}
