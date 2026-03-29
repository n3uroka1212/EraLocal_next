import { z } from "zod/v4";

export const cityProfileSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  description: z.string().max(2000, "Description trop longue").optional(),
  department: z.string().optional(),
  region: z.string().optional(),
  slogan: z.string().max(200, "Slogan trop long").optional(),
  cityCategory: z.string().optional(),
  contactName: z.string().optional(),
  phone: z
    .string()
    .regex(/^(?:\+33|0)[1-9](?:\d{8})$/, "Numero invalide")
    .or(z.literal(""))
    .optional(),
});

export const POINT_CATEGORIES = [
  "monument",
  "eglise",
  "parc",
  "musee",
  "chateau",
  "place",
  "fontaine",
  "theatre",
  "bibliotheque",
  "marche",
  "pont",
  "autre",
] as const;

export const cityPointSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().max(2000, "Description trop longue").optional(),
  history: z.string().max(5000, "Historique trop long").optional(),
  address: z.string().max(500, "Adresse trop longue").optional(),
  category: z.enum(POINT_CATEGORIES, {
    message: "Categorie invalide",
  }).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  active: z.boolean().optional(),
});

export type CityProfileData = z.infer<typeof cityProfileSchema>;
export type CityPointData = z.infer<typeof cityPointSchema>;
