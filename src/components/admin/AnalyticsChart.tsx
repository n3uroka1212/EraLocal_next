"use client";

interface ChartItem {
  label: string;
  value: number;
}

interface AnalyticsChartProps {
  title: string;
  items: ChartItem[];
  color?: string;
  className?: string;
}

export function AnalyticsChart({
  title,
  items,
  color = "bg-terra",
  className = "",
}: AnalyticsChartProps) {
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className={`bg-bg2 border border-border rounded-card p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-text mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-text2">Aucune donnee</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const pct = (item.value / maxValue) * 100;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <span
                  className="text-xs text-text2 truncate shrink-0"
                  style={{ width: "120px" }}
                  title={item.label}
                >
                  {item.label}
                </span>
                <div className="flex-1 h-5 bg-bg3 rounded-small overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-small transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-text tabular-nums shrink-0 w-10 text-right">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
