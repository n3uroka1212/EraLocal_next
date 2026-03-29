import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { id } = await params;
  const pingId = parseInt(id, 10);
  if (isNaN(pingId)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const ping = await prisma.stockPing.findUnique({
    where: { id: pingId },
    select: {
      id: true,
      status: true,
      response: true,
      productName: true,
      respondedAt: true,
      clientId: true,
    },
  });

  if (!ping || ping.clientId !== session.userId) {
    return NextResponse.json({ error: "Ping non trouve" }, { status: 404 });
  }

  return NextResponse.json({
    id: ping.id,
    status: ping.status,
    response: ping.response,
    productName: ping.productName,
    respondedAt: ping.respondedAt,
  });
}
