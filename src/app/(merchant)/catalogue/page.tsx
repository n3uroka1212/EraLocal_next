import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { CatalogPageClient } from "@/components/merchant/catalog/CatalogPageClient";

export default async function CataloguePage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  const products = await prisma.catalogProduct.findMany({
    where: { shopId: session.shopId },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Catalogue</h1>
      <CatalogPageClient
        products={products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          priceUnit: p.priceUnit,
          category: p.category,
          image: p.image,
          available: p.available,
          sortOrder: p.sortOrder,
          variantSourceName: p.variantSourceName,
          variants: p.variants.map((v) => ({
            id: v.id,
            name: v.name,
            price: v.price,
            available: v.available,
            sortOrder: v.sortOrder,
          })),
        }))}
      />
    </div>
  );
}
