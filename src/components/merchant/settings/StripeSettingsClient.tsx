"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { initiateStripeOnboarding, disconnectStripe } from "@/actions/stripe";

interface StripeSettingsClientProps {
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
}

export function StripeSettingsClient({
  stripeAccountId,
  stripeOnboardingComplete,
}: StripeSettingsClientProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  const isConnected = !!stripeAccountId && stripeOnboardingComplete;

  async function handleConnect() {
    setLoading(true);
    setError(null);

    const result = await initiateStripeOnboarding();
    if (result.error) {
      setError(result.error);
    } else if (result.url) {
      window.location.href = result.url;
    }
    // If no URL returned (mock mode), the page will revalidate
    setLoading(false);
  }

  async function handleDisconnect() {
    setDisconnectLoading(true);
    setError(null);

    const result = await disconnectStripe();
    if (result.error) {
      setError(result.error);
    }
    setDisconnectLoading(false);
    setShowDisconnect(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Stripe</h1>
        <p className="text-sm text-text2 mt-1">
          Connectez votre compte Stripe pour recevoir les paiements Click &amp; Collect.
        </p>
      </div>

      {/* Status card */}
      <div className="p-5 rounded-card bg-bg2 border border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-text">Statut de connexion</span>
          {isConnected ? (
            <Badge variant="green">Connecte</Badge>
          ) : stripeAccountId ? (
            <Badge variant="orange">Onboarding incomplet</Badge>
          ) : (
            <Badge variant="default">Non connecte</Badge>
          )}
        </div>

        {isConnected && (
          <p className="text-xs text-text3 font-mono mb-4">
            Compte : {stripeAccountId}
          </p>
        )}

        <div className="flex gap-3">
          {!isConnected ? (
            <Button onClick={handleConnect} loading={loading}>
              {stripeAccountId ? "Reprendre l'onboarding" : "Connecter Stripe"}
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDisconnect(true)}
            >
              Deconnecter
            </Button>
          )}
        </div>

        {error && <p className="text-xs text-red mt-3">{error}</p>}
      </div>

      {/* Disconnect confirmation */}
      <ConfirmDialog
        open={showDisconnect}
        onClose={() => setShowDisconnect(false)}
        onConfirm={handleDisconnect}
        title="Deconnecter Stripe"
        message="Etes-vous sur de vouloir deconnecter votre compte Stripe ? Le Click & Collect doit etre desactive au prealable."
        confirmLabel="Deconnecter"
        variant="danger"
        loading={disconnectLoading}
      />
    </div>
  );
}
