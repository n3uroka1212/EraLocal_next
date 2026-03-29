import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { PingsManagementClient } from "@/components/merchant/pings/PingsManagementClient";

export default async function PingsPage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  const pings = await prisma.stockPing.findMany({
    where: { shopId: session.shopId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      productName: true,
      productImage: true,
      status: true,
      response: true,
      createdAt: true,
    },
  });

  const serialized = pings.map((ping) => ({
    id: ping.id,
    productName: ping.productName,
    productImage: ping.productImage,
    status: ping.status as string,
    response: ping.response,
    createdAt: ping.createdAt.toISOString(),
  }));

  return <PingsManagementClient pings={serialized} />;
}
