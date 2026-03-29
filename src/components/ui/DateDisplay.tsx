interface DateDisplayProps {
  date: Date | string;
  relative?: boolean;
  className?: string;
}

function getRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffH = Math.floor(diffMs / 3_600_000);
  const diffD = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD < 7) return `Il y a ${diffD}j`;
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DateDisplay({
  date,
  relative = false,
  className = "",
}: DateDisplayProps) {
  const d = typeof date === "string" ? new Date(date) : date;
  const display = relative
    ? getRelative(d)
    : d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <time
      dateTime={d.toISOString()}
      className={`text-sm text-text2 ${className}`}
    >
      {display}
    </time>
  );
}
