import { z } from "zod/v4";

// --- Login marchand par code boutique + PIN ---

export const loginSchema = z.object({
  shopCode: z
    .string()
    .regex(/^SS-[A-Z0-9]{5}$/, "Format attendu : SS-XXXXX"),
  pin: z
    .string()
    .regex(/^\d{6}$/, "Le PIN doit contenir 6 chiffres"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// --- Login marchand par email ---

export const loginEmailSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
});

export type LoginEmailInput = z.infer<typeof loginEmailSchema>;

// --- Inscription marchand (etape 1) ---

export const registerMerchantSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caracteres"),
  address: z.string().min(5, "Adresse requise"),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  city: z.string().min(2, "Ville requise"),
  siret: z
    .string()
    .regex(/^\d{14}$/, "Le SIRET doit contenir 14 chiffres"),
  phone: z
    .string()
    .regex(/^(?:\+33|0)[1-9](?:\d{8})$/, "Numero de telephone invalide"),
  email: z.email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre",
    ),
});

export type RegisterMerchantInput = z.infer<typeof registerMerchantSchema>;

// --- Inscription consommateur ---

export const registerClientSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caracteres").optional(),
});

export type RegisterClientInput = z.infer<typeof registerClientSchema>;

// --- 2FA ---

export const twoFASchema = z.object({
  code: z
    .string()
    .regex(/^\d{6}$/, "Le code doit contenir 6 chiffres"),
});

export type TwoFAInput = z.infer<typeof twoFASchema>;

// --- Changement de mot de passe ---

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// --- Validation SIRET (algorithme de Luhn) ---

export function isValidSiret(siret: string): boolean {
  if (!/^\d{14}$/.test(siret)) return false;

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(siret[i], 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}
