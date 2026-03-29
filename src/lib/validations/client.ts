import { z } from "zod/v4";

export const clientProfileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caracteres").optional(),
  email: z.email("Adresse email invalide").optional(),
  phone: z
    .string()
    .regex(/^(?:\+33|0)[1-9](?:\d{8})$/, "Numero de telephone invalide")
    .or(z.literal(""))
    .optional(),
  city: z.string().max(100, "Ville trop longue").optional(),
});

export const checkoutSchema = z.object({
  clientName: z.string().min(2, "Nom requis"),
  clientPhone: z
    .string()
    .regex(/^(?:\+33|0)[1-9](?:\d{8})$/, "Numero de telephone invalide"),
  clientEmail: z.email("Email invalide").optional(),
  pickupTime: z.coerce.date({ message: "Creneau de retrait requis" }),
  notes: z.string().max(500, "Notes trop longues").optional(),
});

export const newsletterSchema = z.object({
  email: z.email("Adresse email invalide"),
});

export type ClientProfileData = z.infer<typeof clientProfileSchema>;
export type CheckoutData = z.infer<typeof checkoutSchema>;
export type NewsletterData = z.infer<typeof newsletterSchema>;
