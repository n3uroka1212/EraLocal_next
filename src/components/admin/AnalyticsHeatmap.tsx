"use client";

import { useState } from "react";

interface HeatmapCell {
  day: number; // 0=Lun, 6=Dim
  hour: number; // 0-23
  count: number;
}

interface AnalyticsHeatmapProps {
  data: HeatmapCell[];
  className?: string;
}

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

function getIntensityClass(count: number, maxCount: number): string {
  if (maxCount === 0 || count === 0) return "bg-bg3";
  const ratio = count / maxCount;
  if (ratio > 0.75) return "bg-terra";
  if (ratio > 0.5) return "bg-terra-mid";
  if (ratio > 0.25) return "bg-terra-light";
  return "bg-bg4";
}

export function AnalyticsHeatmap({
  data,
  className = "",
}: AnalyticsHeatmapProps) {
  const [tooltip, setTooltip] = useState<{
    day: number;
    hour: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  // Build lookup map
  const cellMap = new Map<string, number>();
  for (const cell of data) {
    cellMap.set(`${cell.day}-${cell.hour}`, cell.count);
  }

  const maxCount = Math.max(...data.map((d) => d.count), 0);

  return (
    <div className={`bg-bg2 border border-border rounded-card p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-text mb-4">
        Activite par heure et jour
      </h3>

      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Hour labels */}
          <div className="flex ml-10 mb-1">
            {HOURS.map((h) => (
              <div
                key={h}
                className="flex-1 text-center text-[0.6rem] text-text3"
              >
                {h % 3 === 0 ? `${h}h` : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          {DAYS.map((day, dayIdx) => (
            <div key={day} className="flex items-center mb-0.5">
              <span className="w-10 text-xs text-text2 shrink-0">{day}</span>
              <div className="flex flex-1 gap-0.5">
                {HOURS.map((hour) => {
                  const count = cellMap.get(`${dayIdx}-${hour}`) ?? 0;
                  return (
                    <div
                      key={hour}
                      className={`flex-1 h-5 rounded-[3px] cursor-default transition-colors duration-200 ${getIntensityClass(count, maxCount)}`}
                      onMouseEnter={(e) => {
                        const rect = (
                          e.target as HTMLElement
                        ).getBoundingClientRect();
                        setTooltip({
                          day: dayIdx,
                          hour,
                          count,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 ml-10">
            <span className="text-[0.6rem] text-text3">Moins</span>
            <div className="w-4 h-3 rounded-[2px] bg-bg3" />
            <div className="w-4 h-3 rounded-[2px] bg-bg4" />
            <div className="w-4 h-3 rounded-[2px] bg-terra-light" />
            <div className="w-4 h-3 rounded-[2px] bg-terra-mid" />
            <div className="w-4 h-3 rounded-[2px] bg-terra" />
            <span className="text-[0.6rem] text-text3">Plus</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-text text-bg text-xs font-medium px-2.5 py-1.5 rounded-small shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 36,
            transform: "translateX(-50%)",
          }}
        >
          {DAYS[tooltip.day]} {tooltip.hour}h : {tooltip.count} evenement
          {tooltip.count !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
