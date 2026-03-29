import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/layouts/Sidebar";
import { ToastContainer } from "@/components/ui/Toast";

const CITY_NAV = [
  { href: "/city/profil", label: "Profil", icon: "🏙️" },
  { href: "/city/points", label: "Points d'interet", icon: "📍" },
];

export default async function CityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.userType !== "city") {
    redirect("/auth/city");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={CITY_NAV} title="Ma Ville" />
      <main className="flex-1 p-4 md:p-6">{children}</main>
      <ToastContainer />
    </div>
  );
}
