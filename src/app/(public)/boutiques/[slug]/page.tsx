import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { ShopHero } from "@/components/shop/ShopHero";
import { ShopTabs } from "@/components/shop/ShopTabs";
import { ShopCatalog } from "@/components/shop/ShopCatalog";
import { ShopHours } from "@/components/shop/ShopHours";
import { ShopContact } from "@/components/shop/ShopContact";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getShop(slug: string) {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      catalogProducts: {
        where: { available: true },
        orderBy: { sortOrder: "asc" },
      },
      events: {
        where: {
          active: true,
        },
        orderBy: { eventDate: "asc" },
        take: 5,
      },
    },
  });

  if (!shop || shop.verificationStatus !== "verified") return null;
  return shop;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShop(slug);

  if (!shop) {
    return { title: "Boutique introuvable — EraLocal" };
  }

  return {
    title: `${shop.name} — EraLocal`,
    description:
      shop.description ??
      `Decouvrez ${shop.name}, ${shop.category ?? "boutique locale"} sur EraLocal`,
    openGraph: {
      title: shop.name,
      description: shop.description ?? undefined,
      images: shop.banner ? [shop.banner] : undefined,
    },
  };
}

export default async function ShopPage({ params }: PageProps) {
  const { slug } = await params;
  const shop = await getShop(slug);

  if (!shop) notFound();

  const tabs = [
    {
      id: "catalogue",
      label: "Catalogue",
      content: (
        <ShopCatalog
          products={shop.catalogProducts.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            priceUnit: p.priceUnit,
            category: p.category,
            image: p.image,
          }))}
          shopSlug={shop.slug}
        />
      ),
    },
    {
      id: "horaires",
      label: "Horaires",
      content: (
        <ShopHours
          openingHours={
            shop.openingHours as Record<
              string,
              { open: string; close: string; closed?: boolean }
            > | null
          }
        />
      ),
    },
    {
      id: "contact",
      label: "Contact",
      content: (
        <ShopContact
          phone={shop.phone}
          email={shop.notificationEmail ?? shop.email}
          website={shop.website}
          latitude={shop.latitude}
          longitude={shop.longitude}
          address={[shop.address, shop.postalCode, shop.city]
            .filter(Boolean)
            .join(", ")}
        />
      ),
    },
  ];

  return (
    <div>
      <ShopHero
        name={shop.name}
        banner={shop.banner}
        logoEmoji={shop.logoEmoji}
        category={shop.category}
        businessType={shop.businessType}
      />
      <div className="px-4 md:px-6 py-4">
        <ShopTabs tabs={tabs} />
      </div>
    </div>
  );
}
