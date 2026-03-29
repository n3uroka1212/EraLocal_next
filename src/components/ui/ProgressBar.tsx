interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  className = "",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div
      className={`w-full h-2 bg-bg3 rounded-full overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-terra rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}
