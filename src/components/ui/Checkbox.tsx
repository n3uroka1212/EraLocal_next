"use client";

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled,
}: CheckboxProps) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 rounded border-border text-terra accent-terra cursor-pointer disabled:opacity-50"
      />
      <span className="text-sm text-text">{label}</span>
    </label>
  );
}
