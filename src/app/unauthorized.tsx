import Link from "next/link";

export default function Unauthorized() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="text-center">
        <h1 className="font-serif text-2xl font-semibold text-[var(--text)] mb-4">
          401 — Non authentifie
        </h1>
        <p className="text-[var(--text2)] mb-6">
          Veuillez vous connecter pour acceder a cette page.
        </p>
        <Link
          href="/auth/login"
          className="inline-block bg-[var(--terra)] text-white font-medium px-6 py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
        >
          Se connecter
        </Link>
      </div>
    </main>
  );
}
