import { Suspense } from "react";
import MerchantLoginForm from "@/components/auth/MerchantLoginForm";

export const metadata = {
  title: "Connexion Marchand — EraLocal",
  description: "Connectez-vous a votre espace marchand EraLocal.",
};

export default function MerchantLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-[440px] bg-[var(--bg2)] rounded-[20px] p-7 shadow-lg">
        <h1 className="font-serif text-xl font-semibold text-[var(--text)] text-center mb-6">
          Connexion Marchand
        </h1>
        <Suspense fallback={<div className="text-center text-[var(--text2)]">Chargement...</div>}>
          <MerchantLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
