import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { AdminProductManagerClient } from "@/components/admin/AdminProductManagerClient";

export default async function AdminProduitsPage() {
  const session = await getSession();
  if (!session || session.userType !== "admin") {
    redirect("/auth/admin");
  }

  const shops = await prisma.shop.findMany({
    where: { verificationStatus: "verified" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { catalogProducts: true } },
    },
    orderBy: { name: "asc" },
  });

  const serializedShops = shops.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    productCount: s._count.catalogProducts,
  }));

  return <AdminProductManagerClient shops={serializedShops} />;
}
