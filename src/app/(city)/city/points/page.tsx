import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { CityPointsClient } from "@/components/city/CityPointsClient";

export default async function CityPointsPage() {
  const session = await getSession();
  if (!session || session.userType !== "city") {
    redirect("/auth/city");
  }

  const points = await prisma.cityPoint.findMany({
    where: { cityId: session.userId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <CityPointsClient points={JSON.parse(JSON.stringify(points))} />
  );
}
