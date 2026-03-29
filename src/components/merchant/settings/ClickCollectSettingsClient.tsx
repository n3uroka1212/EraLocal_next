"use client";

import { useActionState } from "react";
import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { updateClickCollectSettings } from "@/actions/settings";

interface ClickCollectSettingsClientProps {
  settings: {
    clickCollectEnabled: boolean;
    ccPrepTime: number | null;
    ccInstructions: string | null;
    ccMinOrder: number | null;
    stripeOnboardingComplete: boolean;
  };
}

export function ClickCollectSettingsClient({
  settings,
}: ClickCollectSettingsClientProps) {
  const [enabled, setEnabled] = useState(settings.clickCollectEnabled);
  const [prepTime, setPrepTime] = useState(String(settings.ccPrepTime ?? "30"));
  const [instructions, setInstructions] = useState(settings.ccInstructions ?? "");
  const [minOrder, setMinOrder] = useState(String(settings.ccMinOrder ?? "0"));

  const [state, formAction, isPending] = useActionState(updateClickCollectSettings, null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Click &amp; Collect</h1>
        <p className="text-sm text-text2 mt-1">
          Configurez les parametres de retrait en boutique.
        </p>
      </div>

      {!settings.stripeOnboardingComplete && (
        <div className="p-4 rounded-card bg-orange-light border border-orange/20">
          <p className="text-sm text-orange font-medium">
            Connectez votre compte Stripe dans les reglages avant d'activer le Click &amp; Collect.
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        {/* Hidden field for enabled state */}
        <input type="hidden" name="clickCollectEnabled" value={String(enabled)} />

        <div className="p-5 rounded-card bg-bg2 border border-border space-y-5">
          {/* Toggle */}
          <Toggle
            checked={enabled}
            onChange={setEnabled}
            label="Activer le Click & Collect"
            disabled={!settings.stripeOnboardingComplete}
          />

          {/* Prep time */}
          <Input
            label="Temps de preparation (minutes)"
            name="ccPrepTime"
            type="number"
            min={1}
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            placeholder="30"
          />

          {/* Instructions */}
          <Textarea
            label="Instructions de retrait"
            name="ccInstructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ex: Presentez-vous au comptoir avec votre numero de commande..."
            rows={3}
          />

          {/* Min order */}
          <Input
            label="Commande minimum (EUR)"
            name="ccMinOrder"
            type="number"
            min={0}
            step={0.01}
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            placeholder="0"
          />
        </div>

        {/* Submit */}
        <Button type="submit" loading={isPending}>
          Enregistrer
        </Button>

        {state?.error && (
          <p className="text-sm text-red">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm text-green">Parametres mis a jour avec succes.</p>
        )}
      </form>
    </div>
  );
}
