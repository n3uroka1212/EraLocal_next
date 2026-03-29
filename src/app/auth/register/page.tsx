import MerchantRegisterWizard from "@/components/auth/MerchantRegisterWizard";

export const metadata = {
  title: "Inscription Marchand — EraLocal",
  description: "Creez votre boutique sur EraLocal en quelques etapes.",
};

export default function MerchantRegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 py-8">
      <div className="w-full max-w-[540px] bg-[var(--bg2)] rounded-[20px] p-7 shadow-lg">
        <h1 className="font-serif text-xl font-semibold text-[var(--text)] text-center mb-6">
          Creer ma boutique
        </h1>
        <MerchantRegisterWizard />
        <p className="text-center text-sm text-[var(--text2)] mt-6">
          Deja inscrit ?{" "}
          <a href="/auth/login" className="text-[var(--terra)] font-medium hover:underline">
            Se connecter
          </a>
        </p>
      </div>
    </main>
  );
}
