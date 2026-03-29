import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";

const SETTINGS_LINKS = [
  {
    href: "/reglages/stripe",
    label: "Stripe",
    description: "Gerez votre connexion Stripe pour les paiements.",
    icon: "💳",
  },
  {
    href: "/reglages/click-collect",
    label: "Click & Collect",
    description: "Configurez le retrait en boutique.",
    icon: "🛍️",
  },
  {
    href: "/reglages/securite",
    label: "Securite",
    description: "Authentification a deux facteurs (2FA).",
    icon: "🔒",
  },
];

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-text">Reglages</h1>

      <div className="space-y-3">
        {SETTINGS_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-4 p-5 rounded-card bg-bg2 border border-border hover:border-terra transition-colors"
          >
            <span className="text-3xl">{link.icon}</span>
            <div>
              <h2 className="text-sm font-semibold text-text">{link.label}</h2>
              <p className="text-xs text-text2 mt-0.5">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
