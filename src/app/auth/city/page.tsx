import { Suspense } from "react";
import EmailLoginForm from "@/components/auth/EmailLoginForm";
import { loginCity } from "@/actions/auth";

export const metadata = {
  title: "Espace Ville — EraLocal",
  description: "Connexion a l'espace ville EraLocal.",
};

export default function CityLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-[440px] bg-[var(--bg2)] rounded-[20px] p-7 shadow-lg">
        <h1 className="font-serif text-xl font-semibold text-[var(--text)] text-center mb-6">
          Espace Ville
        </h1>
        <Suspense fallback={<div className="text-center text-[var(--text2)]">Chargement...</div>}>
          <EmailLoginForm action={loginCity} defaultRedirect="/city/profil" />
        </Suspense>
      </div>
    </main>
  );
}
