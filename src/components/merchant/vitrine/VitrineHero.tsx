"use client";

import Link from "next/link";

interface VitrineHeroProps {
  name: string;
  banner: string | null;
  logo: string | null;
  logoEmoji: string | null;
}

export function VitrineHero({ name, banner, logo, logoEmoji }: VitrineHeroProps) {
  return (
    <div
      className="relative h-[260px]"
      style={
        banner
          ? { backgroundImage: `url(${banner})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: "linear-gradient(160deg, #3D2B1A, #6B3D24, var(--terra))" }
      }
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/18 to-black/45" />

      {/* Edit button */}
      <Link
        href="/boutique"
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors z-10"
        title="Editer le profil"
      >
        ✎
      </Link>

      {/* Logo */}
      <div className="absolute left-5 bottom-[-28px] z-10">
        <div className="w-14 h-14 rounded-card border-[3px] border-bg2 bg-bg2 flex items-center justify-center overflow-hidden shadow-lg">
          {logo ? (
            <img
              src={logo}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : logoEmoji ? (
            <span className="text-3xl">{logoEmoji}</span>
          ) : (
            <span className="text-3xl">🏪</span>
          )}
        </div>
      </div>

      {/* Shop name */}
      <div className="absolute bottom-4 left-24 right-4 z-10">
        <h2 className="text-xl font-bold text-white drop-shadow-lg">
          {name}
        </h2>
      </div>
    </div>
  );
}
