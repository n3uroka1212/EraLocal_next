import { prisma } from "@/lib/db/client";
import { CityAccountsClient } from "@/components/admin/CityAccountsClient";

export const metadata = { title: "Admin — Comptes ville" };

export default async function AdminVillesPage() {
  const cities = await prisma.cityAccount.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      region: true,
      contactName: true,
      phone: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = cities.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-text">
          Comptes ville
        </h1>
        <p className="text-sm text-text2 mt-1">
          Gerez les comptes municipaux de la plateforme
        </p>
      </div>
      <CityAccountsClient cities={serialized} />
    </div>
  );
}
