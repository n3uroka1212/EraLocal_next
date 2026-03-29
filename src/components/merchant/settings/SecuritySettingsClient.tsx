"use client";

import { useState, useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { setup2FA, verify2FA, disable2FA } from "@/actions/totp";

interface SecuritySettingsClientProps {
  totpEnabled: boolean;
}

export function SecuritySettingsClient({ totpEnabled }: SecuritySettingsClientProps) {
  const [is2FAEnabled, setIs2FAEnabled] = useState(totpEnabled);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  const [verifyState, verifyAction, verifyPending] = useActionState(
    async (prevState: { error?: string; success?: boolean; recoveryCodes?: string[] } | null, formData: FormData) => {
      const result = await verify2FA(prevState, formData);
      if (result.success && result.recoveryCodes) {
        setRecoveryCodes(result.recoveryCodes);
        setQrCode(null);
        setIs2FAEnabled(true);
      }
      return result;
    },
    null,
  );

  const [disableState, disableAction, disablePending] = useActionState(
    async (prevState: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await disable2FA(prevState, formData);
      if (result.success) {
        setShowDisableModal(false);
        setIs2FAEnabled(false);
      }
      return result;
    },
    null,
  );

  async function handleStartSetup() {
    setSetupLoading(true);
    setSetupError(null);
    setRecoveryCodes(null);

    const result = await setup2FA();
    if (result.error) {
      setSetupError(result.error);
    } else if (result.qrCode) {
      setQrCode(result.qrCode);
      setShowSetupModal(true);
    }
    setSetupLoading(false);
  }

  function handleCloseSetup() {
    setShowSetupModal(false);
    setQrCode(null);
    setRecoveryCodes(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Securite</h1>
        <p className="text-sm text-text2 mt-1">
          Gerez l'authentification a deux facteurs pour votre compte.
        </p>
      </div>

      {/* 2FA Status card */}
      <div className="p-5 rounded-card bg-bg2 border border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-text">
            Authentification a deux facteurs (2FA)
          </span>
          {is2FAEnabled ? (
            <Badge variant="green">Active</Badge>
          ) : (
            <Badge variant="default">Desactive</Badge>
          )}
        </div>

        <p className="text-sm text-text2 mb-4">
          {is2FAEnabled
            ? "Votre compte est protege par l'authentification a deux facteurs."
            : "Ajoutez une couche de securite supplementaire a votre compte avec une application d'authentification (Google Authenticator, Authy, etc.)."}
        </p>

        {is2FAEnabled ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDisableModal(true)}
          >
            Desactiver le 2FA
          </Button>
        ) : (
          <Button onClick={handleStartSetup} loading={setupLoading}>
            Activer le 2FA
          </Button>
        )}

        {setupError && <p className="text-xs text-red mt-3">{setupError}</p>}
      </div>

      {/* Setup modal: QR code + verification */}
      <Modal
        open={showSetupModal}
        onClose={handleCloseSetup}
        title="Configurer le 2FA"
      >
        {qrCode && !recoveryCodes && (
          <div className="space-y-4">
            <p className="text-sm text-text2">
              Scannez ce QR code avec votre application d'authentification, puis entrez le code genere.
            </p>

            <div className="flex justify-center p-4 bg-white rounded-card">
              <img
                src={qrCode}
                alt="QR Code 2FA"
                className="w-48 h-48"
              />
            </div>

            <form action={verifyAction} className="space-y-3">
              <Input
                label="Code de verification"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
                autoComplete="one-time-code"
              />
              <Button type="submit" loading={verifyPending} className="w-full">
                Verifier et activer
              </Button>
              {verifyState?.error && (
                <p className="text-xs text-red">{verifyState.error}</p>
              )}
            </form>
          </div>
        )}

        {recoveryCodes && (
          <div className="space-y-4">
            <p className="text-sm text-green font-medium">
              2FA active avec succes !
            </p>
            <p className="text-sm text-text2">
              Sauvegardez ces codes de recuperation dans un endroit sur. Ils vous permettront d'acceder a votre compte si vous perdez votre appareil.
            </p>

            <div className="p-4 bg-bg3 rounded-card">
              <div className="grid grid-cols-2 gap-2">
                {recoveryCodes.map((code) => (
                  <span
                    key={code}
                    className="font-mono text-sm text-text text-center py-1"
                  >
                    {code}
                  </span>
                ))}
              </div>
            </div>

            <Button onClick={handleCloseSetup} className="w-full">
              J'ai sauvegarde mes codes
            </Button>
          </div>
        )}
      </Modal>

      {/* Disable modal */}
      <Modal
        open={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        title="Desactiver le 2FA"
      >
        <p className="text-sm text-text2 mb-4">
          Entrez un code de votre application d'authentification pour confirmer la desactivation.
        </p>

        <form action={disableAction} className="space-y-3">
          <Input
            label="Code de verification"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="000000"
            autoComplete="one-time-code"
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setShowDisableModal(false)}
            >
              Annuler
            </Button>
            <Button variant="danger" type="submit" loading={disablePending}>
              Desactiver
            </Button>
          </div>
          {disableState?.error && (
            <p className="text-xs text-red">{disableState.error}</p>
          )}
        </form>
      </Modal>
    </div>
  );
}
