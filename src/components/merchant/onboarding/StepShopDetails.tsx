"use client";

import { Input } from "@/components/ui/Input";

const EMOJIS = [
  "🥖", "🥐", "🧁", "🍰", "🥗", "🧀", "🥩", "🐟",
  "🥑", "🍓", "🫙", "🍯", "☕", "🍷", "🐾", "🐕",
  "🐈", "🌸", "🎁", "📦", "👗", "👟",
];

interface StepShopDetailsProps {
  shopName: string;
  onShopNameChange: (value: string) => void;
  logoEmoji: string;
  onLogoEmojiChange: (value: string) => void;
}

export function StepShopDetails({
  shopName,
  onShopNameChange,
  logoEmoji,
  onLogoEmojiChange,
}: StepShopDetailsProps) {
  return (
    <div className="space-y-5">
      <Input
        label="Nom de votre boutique"
        placeholder="Ma Boulangerie"
        value={shopName}
        onChange={(e) => onShopNameChange(e.target.value)}
      />

      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2 mb-2">
          Logo emoji
        </p>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() =>
                onLogoEmojiChange(logoEmoji === emoji ? "" : emoji)
              }
              className={`w-11 h-11 flex items-center justify-center text-2xl rounded-button transition-all duration-150 cursor-pointer hover:scale-110 hover:bg-terra-light ${
                logoEmoji === emoji
                  ? "border-2 border-terra bg-terra-light"
                  : "border border-transparent"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
