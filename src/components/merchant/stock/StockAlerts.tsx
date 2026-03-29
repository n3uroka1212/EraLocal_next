"use client";

import { Badge } from "@/components/ui/Badge";

type StockProduct = {
  id: number;
  name: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  category: string | null;
  minStock: number | null;
  expiryDate: string | null;
  barcode: string | null;
  supplier: string | null;
  description: string | null;
};

interface StockAlertsProps {
  lowStockProducts: StockProduct[];
  expiringProducts: StockProduct[];
}

export function StockAlerts({
  lowStockProducts,
  expiringProducts,
}: StockAlertsProps) {
  const now = new Date();

  if (lowStockProducts.length === 0 && expiringProducts.length === 0) {
    return (
      <div className="bg-green-light rounded-card p-4 text-center">
        <span className="text-green font-medium text-sm">
          &#x2713; Aucune alerte en cours - Tout est en ordre !
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lowStockProducts.length > 0 && (
        <div className="bg-bg2 rounded-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red" />
            <h3 className="text-sm font-semibold text-text">
              Stock bas ({lowStockProducts.length})
            </h3>
          </div>
          <div className="divide-y divide-border">
            {lowStockProducts.map((product) => {
              const isZero = product.quantity === 0;
              return (
                <div
                  key={product.id}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-text3">
                      Min: {product.minStock} {product.unit ?? "unites"}
                    </p>
                  </div>
                  <Badge variant={isZero ? "red" : "orange"}>
                    {product.quantity} {product.unit ?? ""}
                    {isZero ? " - Rupture" : " - Bas"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {expiringProducts.length > 0 && (
        <div className="bg-bg2 rounded-card border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange" />
            <h3 className="text-sm font-semibold text-text">
              Expiration proche ({expiringProducts.length})
            </h3>
          </div>
          <div className="divide-y divide-border">
            {expiringProducts.map((product) => {
              const expiry = new Date(product.expiryDate!);
              const isExpired = expiry <= now;
              const daysLeft = Math.ceil(
                (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
              );

              return (
                <div
                  key={product.id}
                  className="px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-text3">
                      Quantite: {product.quantity} {product.unit ?? "unites"}
                    </p>
                  </div>
                  <Badge variant={isExpired ? "red" : "orange"}>
                    {isExpired
                      ? "Expire"
                      : daysLeft === 0
                        ? "Expire aujourd'hui"
                        : daysLeft === 1
                          ? "Expire demain"
                          : `${daysLeft} jours restants`}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
