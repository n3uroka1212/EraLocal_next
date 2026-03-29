import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { VitrinePreview } from "@/components/merchant/vitrine/VitrinePreview";

export default async function VitrinePage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      address: true,
      postalCode: true,
      city: true,
      phone: true,
      email: true,
      website: true,
      openingHours: true,
      logo: true,
      logoEmoji: true,
      banner: true,
      latitude: true,
      longitude: true,
      catalogProducts: {
        where: { available: true },
        include: { variants: { orderBy: { sortOrder: "asc" } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!shop) redirect("/auth/login");

  const categories = [
    ...new Set(
      shop.catalogProducts
        .map((p) => p.category)
        .filter((c): c is string => !!c),
    ),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Ma Vitrine</h1>
        <span className="text-xs text-text3">
          Apercu tel que vu par vos clients
        </span>
      </div>
      <VitrinePreview
        shop={{
          name: shop.name,
          description: shop.description,
          category: shop.category,
          address: shop.address,
          postalCode: shop.postalCode,
          city: shop.city,
          phone: shop.phone,
          email: shop.email,
          website: shop.website,
          openingHours: shop.openingHours as Record<string, unknown> | null,
          logo: shop.logo,
          logoEmoji: shop.logoEmoji,
          banner: shop.banner,
        }}
        products={shop.catalogProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          priceUnit: p.priceUnit,
          category: p.category,
          image: p.image,
          variants: p.variants.map((v) => ({
            id: v.id,
            name: v.name,
            price: v.price,
          })),
        }))}
        categories={categories}
      />
    </div>
  );
}
