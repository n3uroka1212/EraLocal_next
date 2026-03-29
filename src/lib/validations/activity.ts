import { z } from "zod/v4";

export const activitySchema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().max(2000, "Description trop longue").optional(),
  category: z.string().optional(),
  address: z.string().max(500, "Adresse trop longue").optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  phone: z
    .string()
    .regex(/^(?:\+33|0)[1-9](?:\d{8})$/, "Numero de telephone invalide")
    .or(z.literal(""))
    .optional(),
  website: z.url("URL invalide").or(z.literal("")).optional(),
  priceInfo: z.string().max(200, "Info prix trop longue").optional(),
  duration: z.string().max(100, "Duree trop longue").optional(),
  active: z.boolean().optional(),
  folderId: z.coerce.number().int().positive().nullable().optional(),
});

export const folderSchema = z.object({
  name: z.string().min(1, "Nom du dossier requis"),
  description: z.string().max(500, "Description trop longue").optional(),
  code: z
    .string()
    .length(6, "Le code doit faire 6 caracteres")
    .regex(/^[A-Z0-9]+$/, "Le code doit etre alphanumerique majuscule")
    .optional(),
});

export type ActivityData = z.infer<typeof activitySchema>;
export type FolderData = z.infer<typeof folderSchema>;
