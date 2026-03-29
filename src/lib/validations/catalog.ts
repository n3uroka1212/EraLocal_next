import { z } from "zod/v4";

export const catalogProductSchema = z.object({
  name: z.string().min(1, "Nom du produit requis"),
  description: z.string().max(1000, "Description trop longue").optional(),
  price: z.coerce
    .number()
    .min(0, "Le prix doit etre positif")
    .optional(),
  priceUnit: z.string().optional(),
  category: z.string().optional(),
  available: z.boolean().optional(),
});

export const catalogVariantSchema = z.object({
  name: z.string().min(1, "Nom de la variante requis"),
  price: z.coerce
    .number()
    .min(0, "Le prix doit etre positif")
    .optional(),
  available: z.boolean().optional(),
});

export const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      sortOrder: z.number(),
    }),
  ),
});

export type CatalogProductData = z.infer<typeof catalogProductSchema>;
export type CatalogVariantData = z.infer<typeof catalogVariantSchema>;
