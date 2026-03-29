"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DateDisplay } from "@/components/ui/DateDisplay";
import { respondToPing, deletePing } from "@/actions/pings";

interface PingCardProps {
  ping: {
    id: number;
    productName: string;
    productImage: string | null;
    status: string;
    response: string | null;
    createdAt: string;
  };
}

export function PingCard({ ping }: PingCardProps) {
  const [loading, setLoading] = useState<"stock" | "rupture" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [responded, setResponded] = useState(ping.status === "responded");

  async function handleRespond(response: "en_stock" | "rupture") {
    setLoading(response === "en_stock" ? "stock" : "rupture");
    setError(null);

    const result = await respondToPing(ping.id, response);
    if (result.error) {
      setError(result.error);
    } else {
      setResponded(true);
    }
    setLoading(null);
  }

  async function handleDelete() {
    setLoading("delete");
    setError(null);

    const result = await deletePing(ping.id);
    if (result.error) {
      setError(result.error);
    }
    setLoading(null);
  }

  return (
    <div className="p-4 rounded-card bg-bg2 border border-border">
      <div className="flex items-start gap-3">
        {/* Product image */}
        {ping.productImage ? (
          <img
            src={ping.productImage}
            alt={ping.productName}
            className="w-14 h-14 rounded-small object-cover shrink-0 bg-bg3"
          />
        ) : (
          <div className="w-14 h-14 rounded-small bg-bg3 flex items-center justify-center shrink-0">
            <span className="text-2xl">📦</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text truncate">
            {ping.productName}
          </p>
          <DateDisplay date={ping.createdAt} relative className="text-xs" />
        </div>
      </div>

      {/* Response buttons or responded state */}
      {responded ? (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-green font-medium">
            {ping.response === "en_stock" ? "Repondu : En stock" : "Repondu : Rupture"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            loading={loading === "delete"}
          >
            Supprimer
          </Button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green text-white hover:opacity-90"
            onClick={() => handleRespond("en_stock")}
            loading={loading === "stock"}
            disabled={loading !== null}
          >
            En stock
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="flex-1"
            onClick={() => handleRespond("rupture")}
            loading={loading === "rupture"}
            disabled={loading !== null}
          >
            Rupture
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-red mt-2">{error}</p>}
    </div>
  );
}
