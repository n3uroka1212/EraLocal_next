import { z } from "zod/v4";

// --- Onboarding ---

export const onboardingSchema = z.object({
  businessType: z.enum(["commercant", "producteur", "artisan", "activite"], {
    message: "Type d'activite requis",
  }),
  category: z.string().min(1, "Categorie requise"),
  shopName: z.string().min(2, "Nom de boutique requis (min 2 caracteres)"),
  logoEmoji: z.string().optional(),
});

// --- Profil boutique ---

const dayScheduleSchema = z.object({
  open: z.boolean(),
  start: z.string().optional(),
  end: z.string().optional(),
  lunchBreak: z.boolean().optional(),
  lunchStart: z.string().optional(),
  lunchEnd: z.string().optional(),
});

export const openingHoursSchema = z.object({
  lundi: dayScheduleSchema,
  mardi: dayScheduleSchema,
  mercredi: dayScheduleSchema,
  jeudi: dayScheduleSchema,
  vendredi: dayScheduleSchema,
  samedi: dayScheduleSchema,
  dimanche: dayScheduleSchema,
});

export const socialMediaSchema = z.object({
  facebook: z.url("URL invalide").or(z.literal("")).optional(),
  instagram: z.url("URL invalide").or(z.literal("")).optional(),
  twitter: z.url("URL invalide").or(z.literal("")).optional(),
  tiktok: z.url("URL invalide").or(z.literal("")).optional(),
  website: z.url("URL invalide").or(z.literal("")).optional(),
});

export const shopProfileSchema = z.object({
  name: z.string().min(2, "Nom requis (min 2 caracteres)"),
  description: z.string().max(1000, "Description trop longue").optional(),
  category: z.string().optional(),
  address: z.string().optional(),
  postalCode: z
    .string()
    .regex(/^\d{5}$/, "Code postal invalide")
    .or(z.literal(""))
    .optional(),
  city: z.string().optional(),
  phone: z
    .string()
    .regex(/^(?:\+33|0)[1-9](?:\d{8})$/, "Numero de telephone invalide")
    .or(z.literal(""))
    .optional(),
  notificationEmail: z
    .email("Email invalide")
    .or(z.literal(""))
    .optional(),
  website: z.url("URL invalide").or(z.literal("")).optional(),
  openingHours: openingHoursSchema.optional(),
  socialMedia: socialMediaSchema.optional(),
  logoEmoji: z.string().optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
export type ShopProfileData = z.infer<typeof shopProfileSchema>;
export type OpeningHoursData = z.infer<typeof openingHoursSchema>;
export type SocialMediaData = z.infer<typeof socialMediaSchema>;
