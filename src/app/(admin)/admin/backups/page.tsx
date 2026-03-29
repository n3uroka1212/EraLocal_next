import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { BackupManagerClient } from "@/components/admin/BackupManagerClient";

export default async function BackupsPage() {
  const session = await getSession();
  if (!session || session.userType !== "admin") {
    redirect("/auth/admin");
  }

  const backupEvents = await prisma.analyticsEvent.findMany({
    where: { eventType: "backup_created" },
    select: {
      id: true,
      targetName: true,
      extra: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const backups = backupEvents.map((b) => {
    const extra = b.extra as Record<string, unknown> | null;
    const stats = (extra?.stats ?? {}) as Record<string, number>;
    const totalRecords =
      (stats.shops ?? 0) +
      (stats.products ?? 0) +
      (stats.orders ?? 0) +
      (stats.clients ?? 0);
    const estimatedSize = `~${Math.round(totalRecords * 0.8)} KB`;

    return {
      id: b.id,
      name: b.targetName ?? `backup-${b.id}`,
      createdAt: b.createdAt.toISOString(),
      size: estimatedSize,
      stats,
    };
  });

  return <BackupManagerClient backups={backups} />;
}
