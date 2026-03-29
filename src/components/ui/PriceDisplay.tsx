interface PriceDisplayProps {
  price: number;
  unit?: string;
  className?: string;
}

export function PriceDisplay({
  price,
  unit,
  className = "",
}: PriceDisplayProps) {
  const formatted = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);

  return (
    <span
      className={`font-serif font-semibold text-[15px] text-text ${className}`}
    >
      {formatted}
      {unit && (
        <span className="text-[0.75rem] font-sans font-normal text-text2 ml-1">
          / {unit}
        </span>
      )}
    </span>
  );
}
