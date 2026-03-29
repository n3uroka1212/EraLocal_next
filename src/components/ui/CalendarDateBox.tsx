interface CalendarDateBoxProps {
  date: Date | string;
  className?: string;
}

export function CalendarDateBox({
  date,
  className = "",
}: CalendarDateBoxProps) {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = d.getDate();
  const month = d
    .toLocaleDateString("fr-FR", { month: "short" })
    .toUpperCase()
    .replace(".", "");

  return (
    <div
      className={`flex flex-col items-center justify-center w-12 h-14 bg-terra-light rounded-input ${className}`}
    >
      <span className="text-lg font-bold leading-none text-terra">{day}</span>
      <span className="text-[0.6rem] font-semibold text-terra-mid mt-0.5">
        {month}
      </span>
    </div>
  );
}
