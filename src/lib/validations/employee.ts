import { z } from "zod/v4";

export const employeeSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  email: z.email("Email invalide"),
  role: z.enum(["employee", "manager"], {
    message: "Role invalide",
  }),
  permStockView: z.boolean().optional(),
  permStockEdit: z.boolean().optional(),
  permScanFacture: z.boolean().optional(),
  permScanTicket: z.boolean().optional(),
  permAlertsView: z.boolean().optional(),
  permSettingsView: z.boolean().optional(),
  permEmployeesManage: z.boolean().optional(),
  permShopEdit: z.boolean().optional(),
});

export const employeeUpdateSchema = employeeSchema.partial().extend({
  name: z.string().min(1, "Nom requis").optional(),
  email: z.email("Email invalide").optional(),
});

export type EmployeeData = z.infer<typeof employeeSchema>;
