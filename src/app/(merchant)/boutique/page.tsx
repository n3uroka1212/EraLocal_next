import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { ShopProfileForm } from "@/components/merchant/shop/ShopProfileForm";

export default async function BoutiquePage() {
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
      businessType: true,
      address: true,
      postalCode: true,
      city: true,
      phone: true,
      notificationEmail: true,
      website: true,
      openingHours: true,
      socialMedia: true,
      logo: true,
      logoEmoji: true,
      banner: true,
      latitude: true,
      longitude: true,
      photos: {
        select: { id: true, url: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!shop) redirect("/auth/login");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-text">Profil boutique</h1>
      <ShopProfileForm
        shop={{
          ...shop,
          openingHours: shop.openingHours as Record<string, unknown> | null,
          socialMedia: shop.socialMedia as Record<string, string> | null,
        }}
      />
    </div>
  );
}
