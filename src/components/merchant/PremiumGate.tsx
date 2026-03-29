"use client";

import { Button } from "@/components/ui/Button";

interface PremiumGateProps {
  /** If provided with children, acts as a wrapper: shows children when true, gate when false */
  isPremium?: boolean;
  children?: React.ReactNode;
  /** Feature name shown in the gate message */
  feature?: string;
  /** Extra description text */
  description?: string;
}

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  "Gestion du stock":
    "Gerez votre stock en temps reel, configurez des seuils d'alerte et ne manquez plus jamais de produits.",
  "Scanner OCR":
    "Scannez vos factures et bons de livraison pour mettre a jour votre stock automatiquement.",
};

export function PremiumGate({
  isPremium,
  children,
  feature = "Cette fonctionnalite",
  description,
}: PremiumGateProps) {
  // Wrapper mode: if isPremium is explicitly provided with children
  if (isPremium === true && children) {
    return <>{children}</>;
  }

  // If isPremium is true but no children, nothing to show
  if (isPremium === true) {
    return null;
  }

  const desc =
    description ??
    FEATURE_DESCRIPTIONS[feature] ??
    "Gerez votre stock en temps reel, scannez vos factures et recevez des alertes automatiques pour ne jamais manquer de produits.";

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full text-center px-6">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-terra-light flex items-center justify-center">
          <span className="text-3xl">&#x2B50;</span>
        </div>
        <h2 className="text-2xl font-bold font-serif text-text mb-3">
          Fonctionnalite Premium
        </h2>
        <p className="text-text2 text-sm leading-relaxed mb-2">
          {feature} est reservee aux abonnes Premium.
        </p>
        <p className="text-text3 text-sm leading-relaxed mb-8">{desc}</p>
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              window.location.href = "/reglages?tab=abonnement";
            }}
          >
            Passer au Premium
          </Button>
          <p className="text-xs text-text3">
            A partir de 9,90&#x20AC;/mois &middot; Sans engagement
          </p>
        </div>
        <div className="mt-8 p-4 bg-bg3 rounded-card">
          <h3 className="text-sm font-semibold text-text mb-3">
            Le Premium inclut :
          </h3>
          <ul className="text-left text-sm text-text2 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green mt-0.5">&#x2713;</span>
              Gestion de stock avancee
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green mt-0.5">&#x2713;</span>
              Scanner OCR de factures
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green mt-0.5">&#x2713;</span>
              Alertes stock bas et peremption
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green mt-0.5">&#x2713;</span>
              Gestion des employes
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green mt-0.5">&#x2713;</span>
              Statistiques detaillees
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
