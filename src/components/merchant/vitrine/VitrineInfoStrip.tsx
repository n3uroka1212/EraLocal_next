"use client";

import { useState } from "react";

interface VitrineInfoStripProps {
  address: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  email: string;
  website: string | null;
  openingHours: Record<string, unknown> | null;
}

const DAY_LABELS: Record<string, string> = {
  lundi: "Lun",
  mardi: "Mar",
  mercredi: "Mer",
  jeudi: "Jeu",
  vendredi: "Ven",
  samedi: "Sam",
  dimanche: "Dim",
};

export function VitrineInfoStrip({
  address,
  postalCode,
  city,
  phone,
  email,
  website,
  openingHours,
}: VitrineInfoStripProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  function toggle(section: string) {
    setExpandedSection(expandedSection === section ? null : section);
  }

  const fullAddress = [address, postalCode, city].filter(Boolean).join(", ");
  const hours = openingHours as Record<
    string,
    { open: boolean; start?: string; end?: string }
  > | null;

  return (
    <div className="space-y-2">
      {/* Horaires */}
      {hours && (
        <div
          className="bg-bg3 rounded-input overflow-hidden"
        >
          <button
            onClick={() => toggle("hours")}
            className="flex items-center justify-between w-full px-3 py-2 text-sm text-text"
          >
            <span>🕐 Horaires</span>
            <span className="text-text3">
              {expandedSection === "hours" ? "▲" : "▼"}
            </span>
          </button>
          {expandedSection === "hours" && (
            <div className="px-3 pb-3 space-y-1">
              {Object.entries(hours).map(([day, schedule]) => (
                <div
                  key={day}
                  className="flex justify-between text-xs text-text2"
                >
                  <span>{DAY_LABELS[day] ?? day}</span>
                  <span>
                    {schedule.open
                      ? `${schedule.start ?? "?"} - ${schedule.end ?? "?"}`
                      : "Ferme"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Localisation */}
      {fullAddress && (
        <div className="bg-bg3 rounded-input">
          <button
            onClick={() => toggle("location")}
            className="flex items-center justify-between w-full px-3 py-2 text-sm text-text"
          >
            <span>📍 {fullAddress}</span>
            <span className="text-text3">
              {expandedSection === "location" ? "▲" : "▼"}
            </span>
          </button>
        </div>
      )}

      {/* Contact */}
      <div className="bg-bg3 rounded-input">
        <button
          onClick={() => toggle("contact")}
          className="flex items-center justify-between w-full px-3 py-2 text-sm text-text"
        >
          <span>📞 Contact</span>
          <span className="text-text3">
            {expandedSection === "contact" ? "▲" : "▼"}
          </span>
        </button>
        {expandedSection === "contact" && (
          <div className="px-3 pb-3 space-y-1 text-xs text-text2">
            {phone && <p>Tel : {phone}</p>}
            <p>Email : {email}</p>
            {website && (
              <p>
                Web :{" "}
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-terra hover:underline"
                >
                  {website}
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
