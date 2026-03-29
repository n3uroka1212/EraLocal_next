import { z } from "zod/v4";

export const eventSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().max(2000, "Description trop longue").optional(),
  eventType: z.enum(["marche", "degustation", "atelier", "autre"], {
    message: "Type d'evenement invalide",
  }).optional(),
  eventDate: z.coerce.date({ message: "Date invalide" }).optional(),
  eventTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format heure invalide (HH:MM)")
    .or(z.literal(""))
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format heure invalide (HH:MM)")
    .or(z.literal(""))
    .optional(),
  address: z.string().max(500, "Adresse trop longue").optional(),
  phone: z
    .string()
    .regex(/^(?:\+33|0)[1-9](?:\d{8})$/, "Numero de telephone invalide")
    .or(z.literal(""))
    .optional(),
  website: z.url("URL invalide").or(z.literal("")).optional(),
  isRecurring: z.boolean().optional(),
  recurringDay: z.string().optional(),
  recurringDays: z.string().optional(),
  isPrivate: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const eventUpdateSchema = eventSchema.partial().extend({
  title: z.string().min(1, "Titre requis").optional(),
});

export type EventData = z.infer<typeof eventSchema>;
