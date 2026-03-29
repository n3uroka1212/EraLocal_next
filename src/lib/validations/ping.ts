import { z } from "zod/v4";

export const pingResponseSchema = z.object({
  response: z.enum(["en_stock", "rupture"], {
    message: "Reponse invalide : 'en_stock' ou 'rupture'",
  }),
});

export type PingResponseData = z.infer<typeof pingResponseSchema>;
