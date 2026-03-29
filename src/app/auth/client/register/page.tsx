import { Suspense } from "react";
import ClientAuthForm from "@/components/auth/ClientAuthForm";

export const metadata = {
  title: "Inscription — EraLocal",
  description: "Creez votre compte EraLocal pour decouvrir les commerces locaux.",
};

export default function ClientRegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-[440px] bg-[var(--bg2)] rounded-[20px] p-7 shadow-lg">
        <h1 className="font-serif text-xl font-semibold text-[var(--text)] text-center mb-6">
          Mon compte
        </h1>
        <Suspense fallback={<div className="text-center text-[var(--text2)]">Chargement...</div>}>
          <ClientAuthForm defaultMode="register" />
        </Suspense>
      </div>
    </main>
  );
}
