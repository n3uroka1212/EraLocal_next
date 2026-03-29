import { z } from "zod/v4";

const validTransitions: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["collected"],
  collected: [],
  cancelled: [],
};

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "preparing", "ready", "collected", "cancelled"], {
    message: "Statut invalide",
  }),
});

export const orderCancelSchema = z.object({
  reason: z.string().max(500, "Raison trop longue").optional(),
});

export const orderFilterSchema = z.object({
  status: z.enum(["pending", "paid", "preparing", "ready", "collected", "cancelled"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export function isValidTransition(from: string, to: string): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

export type OrderStatusData = z.infer<typeof orderStatusSchema>;
export type OrderFilterData = z.infer<typeof orderFilterSchema>;
