import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { checkPermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/client";
import { EmployeesManagementClient } from "@/components/merchant/employees/EmployeesManagementClient";

export default async function EmployeesPage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  if (!checkPermission(session, "employees_manage")) {
    redirect("/dashboard");
  }

  const employees = await prisma.employee.findMany({
    where: { shopId: session.shopId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      permStockView: true,
      permStockEdit: true,
      permScanFacture: true,
      permScanTicket: true,
      permAlertsView: true,
      permSettingsView: true,
      permEmployeesManage: true,
      permShopEdit: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return <EmployeesManagementClient employees={JSON.parse(JSON.stringify(employees))} />;
}
