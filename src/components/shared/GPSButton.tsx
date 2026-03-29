"use client";

interface GPSButtonProps {
  lat: number;
  lng: number;
  label?: string;
  className?: string;
}

export function GPSButton({
  lat,
  lng,
  label = "Y aller",
  className = "",
}: GPSButtonProps) {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex-1 flex items-center justify-center gap-2 px-3.5 py-3.5 rounded-button bg-terra text-white font-semibold text-sm transition-all duration-200 hover:bg-accent-hover ${className}`}
    >
      <span aria-hidden="true">📍</span>
      {label}
    </a>
  );
}
