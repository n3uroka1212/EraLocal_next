"use client";

import { useState } from "react";
import { ShopVerificationCard } from "./ShopVerificationCard";

type VerificationStatus = "pending" | "verified" | "rejected";

export interface ShopForVerification {
  id: number;
  name: string;
  email: string;
  slug: string;
  siret: string | null;
  category: string | null;
  city: string | null;
  verificationStatus: VerificationStatus;
  verificationDate: string | null;
  verificationReason: string | null;
  docIdRecto: string | null;
  docIdVerso: string | null;
  docJustificatif: string | null;
  docKbis: string | null;
  createdAt: string;
}

interface Props {
  shops: ShopForVerification[];
}

const TABS: { key: VerificationStatus; label: string }[] = [
  { key: "pending", label: "En attente" },
  { key: "verified", label: "Verifiees" },
  { key: "rejected", label: "Rejetees" },
];

export function ShopVerificationClient({ shops }: Props) {
  const [activeTab, setActiveTab] = useState<VerificationStatus>("pending");

  const filtered = shops.filter((s) => s.verificationStatus === activeTab);

  const counts: Record<VerificationStatus, number> = {
    pending: shops.filter((s) => s.verificationStatus === "pending").length,
    verified: shops.filter((s) => s.verificationStatus === "verified").length,
    rejected: shops.filter((s) => s.verificationStatus === "rejected").length,
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 bg-bg3 p-1 rounded-tab w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-tab text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === tab.key
                ? "bg-bg2 text-text shadow-sm"
                : "text-text2 hover:text-text"
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span
                className={`ml-2 px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold ${
                  tab.key === "pending"
                    ? "bg-orange-light text-orange"
                    : "bg-bg4 text-text2"
                }`}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-bg2 border border-border rounded-card p-8 text-center">
          <p className="text-text2 text-sm">
            {activeTab === "pending"
              ? "Aucune boutique en attente de verification"
              : activeTab === "verified"
                ? "Aucune boutique verifiee"
                : "Aucune boutique rejetee"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((shop) => (
            <ShopVerificationCard key={shop.id} shop={shop} />
          ))}
        </div>
      )}
    </div>
  );
}
