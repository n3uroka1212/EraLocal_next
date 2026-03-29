import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Sidebar } from "@/components/layouts/Sidebar";
import { ToastContainer } from "@/components/ui/Toast";

const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/boutiques", label: "Boutiques", icon: "🏪" },
  { href: "/admin/produits", label: "Produits", icon: "📦" },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/villes", label: "Villes", icon: "🏙️" },
  { href: "/admin/backups", label: "Backups", icon: "💾" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.userType !== "admin") {
    redirect("/auth/admin");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={ADMIN_NAV} title="Admin" />
      <main className="flex-1 p-4 md:p-6">{children}</main>
      <ToastContainer />
    </div>
  );
}
