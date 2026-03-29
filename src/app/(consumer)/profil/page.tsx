import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { ProfileClient } from "@/components/consumer/profile/ProfileClient";

export default async function ProfilPage() {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    redirect("/auth/client/login");
  }

  const client = await prisma.client.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      city: true,
      createdAt: true,
    },
  });

  if (!client) {
    redirect("/auth/client/login");
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold font-serif text-text">Mon profil</h1>
      <ProfileClient
        client={JSON.parse(JSON.stringify(client))}
      />
    </div>
  );
}
