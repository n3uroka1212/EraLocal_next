interface DistanceBadgeProps {
  distanceKm: number;
  className?: string;
}

export function DistanceBadge({
  distanceKm,
  className = "",
}: DistanceBadgeProps) {
  const formatted =
    distanceKm < 1
      ? `${Math.round(distanceKm * 1000)} m`
      : distanceKm < 10
        ? `${distanceKm.toFixed(1)} km`
        : `${Math.round(distanceKm)} km`;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-input text-[0.7rem] font-medium bg-black/50 text-white backdrop-blur-sm ${className}`}
    >
      <span aria-hidden="true">📍</span>
      {formatted}
    </span>
  );
}
