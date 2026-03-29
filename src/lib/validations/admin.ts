import { z } from "zod/v4";

export const verifyShopSchema = z.object({
  status: z.enum(["verified", "rejected"], {
    message: "Statut invalide : 'verified' ou 'rejected'",
  }),
  reason: z.string().max(500, "Raison trop longue").optional(),
});

export const cityAccountSchema = z.object({
  name: z.string().min(2, "Nom de la ville requis"),
  email: z.email("Email invalide"),
  department: z.string().min(1, "Departement requis").optional(),
  region: z.string().optional(),
  contactName: z.string().optional(),
  phone: z
    .string()
    .regex(/^(?:\+33|0)[1-9](?:\d{8})$/, "Numero invalide")
    .or(z.literal(""))
    .optional(),
});

export const csvImportSchema = z.object({
  mode: z.enum(["create", "upsert", "replace"], {
    message: "Mode invalide",
  }),
});

export type VerifyShopData = z.infer<typeof verifyShopSchema>;
export type CityAccountData = z.infer<typeof cityAccountSchema>;
