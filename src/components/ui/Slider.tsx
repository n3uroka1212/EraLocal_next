"use client";

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label?: string;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  label,
  unit,
  onChange,
  className = "",
}: SliderProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.5px] text-text2">
            {label}
          </span>
          <span className="text-sm font-medium text-terra">
            {value}
            {unit && <span className="ml-0.5">{unit}</span>}
          </span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-bg3 rounded-full appearance-none cursor-pointer accent-terra"
      />
    </div>
  );
}
