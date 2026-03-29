import { Suspense } from "react";
import TwoFAVerifyForm from "@/components/auth/TwoFAVerifyForm";

export const metadata = {
  title: "Verification 2FA — EraLocal",
  description: "Saisissez votre code d'authentification a deux facteurs.",
};

export default function TwoFAPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-[440px] bg-[var(--bg2)] rounded-[20px] p-7 shadow-lg">
        <h1 className="font-serif text-xl font-semibold text-[var(--text)] text-center mb-2">
          Verification 2FA
        </h1>
        <p className="text-center text-sm text-[var(--text2)] mb-6">
          Saisissez le code genere par votre application
        </p>
        <Suspense fallback={<div className="text-center text-[var(--text2)]">Chargement...</div>}>
          <TwoFAVerifyForm />
        </Suspense>
      </div>
    </main>
  );
}
