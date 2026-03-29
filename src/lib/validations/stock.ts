import { z } from "zod/v4";

export const stockProductSchema = z.object({
  name: z.string().min(1, "Nom du produit requis"),
  quantity: z.coerce.number().min(0, "La quantite doit etre positive"),
  unit: z.string().optional(),
  price: z.coerce.number().min(0, "Le prix doit etre positif").optional(),
  category: z.string().optional(),
  minStock: z.coerce.number().int().min(0, "Le stock minimum doit etre positif").optional(),
  expiryDate: z.coerce.date({ message: "Date d'expiration invalide" }).optional(),
  barcode: z.string().max(50, "Code-barres trop long").optional(),
  supplier: z.string().max(200, "Nom fournisseur trop long").optional(),
  description: z.string().max(1000, "Description trop longue").optional(),
});

export const adjustQuantitySchema = z.object({
  delta: z.coerce.number({ message: "Quantite invalide" }),
});

export type StockProductData = z.infer<typeof stockProductSchema>;
