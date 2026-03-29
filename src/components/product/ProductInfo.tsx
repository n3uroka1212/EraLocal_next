import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Badge } from "@/components/ui/Badge";

interface ProductInfoProps {
  name: string;
  description?: string | null;
  price?: number | null;
  priceUnit?: string | null;
  category?: string | null;
}

export function ProductInfo({
  name,
  description,
  price,
  priceUnit,
  category,
}: ProductInfoProps) {
  return (
    <div>
      <h1 className="text-[18px] font-semibold font-serif text-text">
        {name}
      </h1>
      {category && (
        <Badge variant="terra" className="mt-2">
          {category}
        </Badge>
      )}
      {price != null && (
        <div className="mt-3">
          <PriceDisplay
            price={price}
            unit={priceUnit ?? undefined}
            className="text-xl"
          />
        </div>
      )}
      {description && (
        <p className="mt-3 text-sm text-text2 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
