"use client";

import { Input } from "@/components/ui/Input";

const BUSINESS_TYPES = [
  { value: "commercant", label: "Commercant", icon: "🏪" },
  { value: "producteur", label: "Producteur", icon: "🌾" },
  { value: "artisan", label: "Artisan", icon: "🔨" },
  { value: "activite", label: "Activite", icon: "🎯" },
];

interface StepBusinessTypeProps {
  businessType: string;
  onBusinessTypeChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}

export function StepBusinessType({
  businessType,
  onBusinessTypeChange,
  category,
  onCategoryChange,
}: StepBusinessTypeProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {BUSINESS_TYPES.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => onBusinessTypeChange(type.value)}
            className={`flex flex-col items-center gap-2 p-5 rounded-card border-2 transition-all duration-200 cursor-pointer ${
              businessType === type.value
                ? "border-terra bg-terra-light/50"
                : "border-border hover:border-terra/50"
            }`}
          >
            <span className="text-3xl">{type.icon}</span>
            <span className="text-sm font-medium text-text">{type.label}</span>
          </button>
        ))}
      </div>

      <Input
        label="Categorie"
        placeholder="Ex: Boulangerie, Fromagerie, Yoga..."
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      />
    </div>
  );
}
