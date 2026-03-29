import Image from "next/image";

interface ShopHeroProps {
  name: string;
  banner?: string | null;
  logoEmoji?: string | null;
  category?: string | null;
  businessType: string;
}

const typeEmojis: Record<string, string> = {
  commercant: "🏪",
  producteur: "🌾",
  artisan: "🎨",
  activite: "🎯",
};

export function ShopHero({
  name,
  banner,
  logoEmoji,
  category,
  businessType,
}: ShopHeroProps) {
  return (
    <div className="relative w-full h-56 md:h-72 overflow-hidden md:rounded-b-[20px]">
      {banner ? (
        <Image
          src={banner}
          alt={`Banniere ${name}`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#D5CBBD] to-[#B8AFA3]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-end gap-3">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-terra-light border-2 border-white shadow-lg text-2xl">
            {logoEmoji || typeEmojis[businessType] || "🏪"}
          </div>
          <div>
            <h1 className="text-[28px] font-bold font-serif text-white leading-tight">
              {name}
            </h1>
            {category && (
              <p className="text-sm text-white/80 mt-0.5">{category}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
