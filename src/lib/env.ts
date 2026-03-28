import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(16),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  NEXTAUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.format());
    throw new Error("Missing or invalid environment variables. Check .env.local");
  }
  return result.data;
}
