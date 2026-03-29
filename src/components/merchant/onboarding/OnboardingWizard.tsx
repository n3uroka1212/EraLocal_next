"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepBusinessType } from "./StepBusinessType";
import { StepShopDetails } from "./StepShopDetails";
import { Button } from "@/components/ui/Button";
import { updateOnboarding } from "@/actions/shop";

interface OnboardingWizardProps {
  initialData: {
    shopName: string;
    businessType: string;
    category: string;
    logoEmoji: string;
  };
}

export function OnboardingWizard({ initialData }: OnboardingWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [businessType, setBusinessType] = useState(
    initialData.businessType || "",
  );
  const [category, setCategory] = useState(initialData.category || "");
  const [shopName, setShopName] = useState(initialData.shopName || "");
  const [logoEmoji, setLogoEmoji] = useState(initialData.logoEmoji || "");

  const canProceedStep1 = businessType !== "" && category !== "";
  const canProceedStep2 = shopName.trim().length >= 2;

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("businessType", businessType);
    formData.set("category", category);
    formData.set("shopName", shopName);
    formData.set("logoEmoji", logoEmoji);

    const result = await updateOnboarding(null, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/vitrine");
    router.refresh();
  }

  return (
    <div className="bg-bg2 rounded-card border border-border p-6 space-y-6">
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div
          className={`h-1 flex-1 rounded-full transition-colors ${
            step >= 1 ? "bg-terra" : "bg-bg4"
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-colors ${
            step >= 2 ? "bg-terra" : "bg-bg4"
          }`}
        />
      </div>

      <div>
        <h1 className="text-xl font-bold text-text">
          {step === 1 ? "Type d'activite" : "Details de votre boutique"}
        </h1>
        <p className="text-sm text-text2 mt-1">
          Etape {step} sur 2
        </p>
      </div>

      {error && (
        <p className="text-sm text-red bg-red-light px-3 py-2 rounded-input">
          {error}
        </p>
      )}

      {step === 1 && (
        <StepBusinessType
          businessType={businessType}
          onBusinessTypeChange={setBusinessType}
          category={category}
          onCategoryChange={setCategory}
        />
      )}

      {step === 2 && (
        <StepShopDetails
          shopName={shopName}
          onShopNameChange={setShopName}
          logoEmoji={logoEmoji}
          onLogoEmojiChange={setLogoEmoji}
        />
      )}

      <div className="flex justify-between pt-2">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep(step - 1)}>
            Retour
          </Button>
        ) : (
          <div />
        )}

        {step === 1 ? (
          <Button
            disabled={!canProceedStep1}
            onClick={() => setStep(2)}
          >
            Suivant
          </Button>
        ) : (
          <Button
            disabled={!canProceedStep2}
            loading={loading}
            onClick={handleSubmit}
          >
            Terminer
          </Button>
        )}
      </div>
    </div>
  );
}
