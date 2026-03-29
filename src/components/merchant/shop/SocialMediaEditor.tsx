"use client";

import { Input } from "@/components/ui/Input";

const SOCIAL_FIELDS = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "twitter", label: "X (Twitter)", placeholder: "https://x.com/..." },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
];

interface SocialMediaEditorProps {
  value: Record<string, string> | null;
  onChange: (value: Record<string, string>) => void;
}

export function SocialMediaEditor({
  value,
  onChange,
}: SocialMediaEditorProps) {
  const social = value ?? {};

  function updateField(key: string, val: string) {
    onChange({ ...social, [key]: val });
  }

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-text">Reseaux sociaux</h2>
      {SOCIAL_FIELDS.map((field) => (
        <Input
          key={field.key}
          label={field.label}
          placeholder={field.placeholder}
          value={social[field.key] ?? ""}
          onChange={(e) => updateField(field.key, e.target.value)}
        />
      ))}
    </section>
  );
}
