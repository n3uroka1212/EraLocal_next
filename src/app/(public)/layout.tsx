import { PublicHeader } from "@/components/layouts/PublicHeader";
import { BottomNav } from "@/components/layouts/BottomNav";
import { ToastContainer } from "@/components/ui/Toast";

const PUBLIC_NAV = [
  { href: "/", label: "Explorer", icon: "🔍" },
  { href: "/evenements", label: "Evenements", icon: "📅" },
  { href: "/activites", label: "Activites", icon: "🎯" },
  { href: "/soutien", label: "Soutien", icon: "❤️" },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PublicHeader />
      <main className="flex-1 pb-20 md:pb-8">{children}</main>
      <BottomNav items={PUBLIC_NAV} />
      <ToastContainer />
    </>
  );
}
