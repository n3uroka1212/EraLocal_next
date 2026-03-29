import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { CityProfileClient } from "@/components/city/CityProfileClient";

export default async function CityProfilPage() {
  const session = await getSession();
  if (!session || session.userType !== "city") {
    redirect("/auth/city");
  }

  const city = await prisma.cityAccount.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      description: true,
      department: true,
      region: true,
      slogan: true,
      cityCategory: true,
      contactName: true,
      phone: true,
      logo: true,
      logoEmoji: true,
      banner: true,
    },
  });

  if (!city) redirect("/auth/city");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-text">Profil de la ville</h1>
      <CityProfileClient city={city} />
    </div>
  );
}
