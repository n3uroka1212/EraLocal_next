import { PriceDisplay } from "@/components/ui/PriceDisplay";

interface Variant {
  id: number;
  name: string;
  price: number | null;
  available: boolean;
}

interface ProductVariantsProps {
  variants: Variant[];
}

export function ProductVariants({ variants }: ProductVariantsProps) {
  if (variants.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-2">Variantes</h3>
      <div className="space-y-2">
        {variants.map((v) => (
          <div
            key={v.id}
            className={`flex items-center justify-between px-3 py-2 rounded-input border border-border ${
              !v.available ? "opacity-50" : ""
            }`}
          >
            <span className="text-sm text-text">{v.name}</span>
            <div className="flex items-center gap-2">
              {v.price != null && <PriceDisplay price={v.price} />}
              {!v.available && (
                <span className="text-[0.7rem] text-red font-medium">
                  Rupture
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
