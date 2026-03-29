"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { PingCard } from "./PingCard";

interface Ping {
  id: number;
  productName: string;
  productImage: string | null;
  status: string;
  response: string | null;
  createdAt: string;
}

interface PingsManagementClientProps {
  pings: Ping[];
}

export function PingsManagementClient({ pings }: PingsManagementClientProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text">Pings</h1>
        <p className="text-sm text-text2 mt-1">
          Les clients demandent si un produit est en stock.
        </p>
      </div>

      {pings.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Aucun ping"
          description="Vous n'avez pas de demandes de stock en attente."
        />
      ) : (
        <div className="space-y-3">
          {pings.map((ping) => (
            <PingCard key={ping.id} ping={ping} />
          ))}
        </div>
      )}
    </div>
  );
}
