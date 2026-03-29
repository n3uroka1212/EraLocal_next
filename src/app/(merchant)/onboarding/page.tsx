import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { OnboardingWizard } from "@/components/merchant/onboarding/OnboardingWizard";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  const shop = await prisma.shop.findUnique({
    where: { id: session.shopId },
    select: {
      onboardingComplete: true,
      name: true,
      businessType: true,
      category: true,
      logoEmoji: true,
    },
  });

  if (!shop) redirect("/auth/login");

  if (shop.onboardingComplete) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-lg">
        <OnboardingWizard
          initialData={{
            shopName: shop.name,
            businessType: shop.businessType,
            category: shop.category ?? "",
            logoEmoji: shop.logoEmoji ?? "",
          }}
        />
      </div>
    </div>
  );
}
