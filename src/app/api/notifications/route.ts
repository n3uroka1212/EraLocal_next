import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    return NextResponse.json([], { status: 401 });
  }

  const notifications = await prisma.clientNotification.findMany({
    where: { clientId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}
