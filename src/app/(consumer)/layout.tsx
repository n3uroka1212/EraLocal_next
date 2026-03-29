import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { BottomNav } from "@/components/layouts/BottomNav";
import { ToastContainer } from "@/components/ui/Toast";
import { CartProvider } from "@/providers/CartProvider";
import { FavoritesProvider } from "@/providers/FavoritesProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";

const CONSUMER_NAV = [
  { href: "/", label: "Explorer", icon: "🔍" },
  { href: "/panier", label: "Panier", icon: "🛒" },
  { href: "/favoris", label: "Favoris", icon: "⭐" },
  { href: "/notifications", label: "Notifs", icon: "🔔" },
  { href: "/profil", label: "Profil", icon: "👤" },
];

export default async function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    redirect("/auth/client/login");
  }

  const [favorites, notifications] = await Promise.all([
    prisma.clientFavorite.findMany({
      where: { clientId: session.userId },
      select: { id: true, itemType: true, itemId: true },
    }),
    prisma.clientNotification.findMany({
      where: { clientId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <CartProvider>
      <FavoritesProvider
        initialFavorites={JSON.parse(JSON.stringify(favorites))}
      >
        <NotificationsProvider
          initialNotifications={JSON.parse(JSON.stringify(notifications))}
        >
          <main className="flex-1 pb-20">{children}</main>
          <BottomNav items={CONSUMER_NAV} />
          <ToastContainer />
        </NotificationsProvider>
      </FavoritesProvider>
    </CartProvider>
  );
}
