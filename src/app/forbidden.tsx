import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-[var(--text)] mb-4">
          403 — Acces interdit
        </h1>
        <p className="text-[var(--text2)] mb-6">
          Vous n&apos;avez pas les droits necessaires pour acceder a cette page.
        </p>
        <Link
          href="/"
          className="inline-block bg-[var(--terra)] text-white font-medium px-6 py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
