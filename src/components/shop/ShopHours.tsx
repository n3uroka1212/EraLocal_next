interface DayHours {
  open: string;
  close: string;
  closed?: boolean;
}

interface ShopHoursProps {
  openingHours?: Record<string, DayHours> | null;
}

const DAYS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

const DAY_LABELS: Record<string, string> = {
  lundi: "Lundi",
  mardi: "Mardi",
  mercredi: "Mercredi",
  jeudi: "Jeudi",
  vendredi: "Vendredi",
  samedi: "Samedi",
  dimanche: "Dimanche",
};

function isOpenNow(
  hours: Record<string, DayHours> | null | undefined,
): boolean {
  if (!hours) return false;
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // Monday = 0
  const dayKey = DAYS[dayIndex];
  const dayHours = hours[dayKey];
  if (!dayHours || dayHours.closed) return false;

  const currentTime =
    now.getHours().toString().padStart(2, "0") +
    ":" +
    now.getMinutes().toString().padStart(2, "0");

  return currentTime >= dayHours.open && currentTime <= dayHours.close;
}

export function ShopHours({ openingHours }: ShopHoursProps) {
  const hours = openingHours as Record<string, DayHours> | null | undefined;
  const open = isOpenNow(hours);
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`w-2.5 h-2.5 rounded-full ${open ? "bg-[#3A8B4A]" : "bg-[#C04020]"}`}
        />
        <span
          className={`text-sm font-semibold ${open ? "text-[#2A6B38]" : "text-[#9B3A25]"}`}
        >
          {open ? "Ouvert" : "Ferme"}
        </span>
      </div>
      {hours && (
        <div className="space-y-1.5">
          {DAYS.map((day, i) => {
            const d = hours[day];
            const isToday = i === todayIndex;
            return (
              <div
                key={day}
                className={`flex justify-between text-sm px-2 py-1 rounded ${isToday ? "bg-terra-light font-semibold" : ""}`}
              >
                <span className={isToday ? "text-terra" : "text-text2"}>
                  {DAY_LABELS[day]}
                </span>
                <span className={isToday ? "text-terra" : "text-text"}>
                  {d?.closed
                    ? "Ferme"
                    : d
                      ? `${d.open} - ${d.close}`
                      : "—"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
