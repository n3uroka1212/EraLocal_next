import Link from "next/link";

interface ProductShopInfoProps {
  shopSlug: string;
  shopName: string;
  shopCity?: string | null;
  shopLogoEmoji?: string | null;
}

export function ProductShopInfo({
  shopSlug,
  shopName,
  shopCity,
  shopLogoEmoji,
}: ProductShopInfoProps) {
  return (
    <Link
      href={`/boutiques/${shopSlug}`}
      className="flex items-center gap-3 p-3 rounded-card border border-border hover:bg-bg3 transition-colors"
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-terra-light text-lg">
        {shopLogoEmoji || "🏪"}
      </div>
      <div>
        <p className="text-sm font-semibold text-text">{shopName}</p>
        {shopCity && (
          <p className="text-[0.75rem] text-text2">{shopCity}</p>
        )}
      </div>
    </Link>
  );
}
