"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";

interface PrivateCodeSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

export function PrivateCodeSheet({
  open,
  onClose,
  onSubmit,
}: PrivateCodeSheetProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit() {
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      setError("Le code doit contenir 6 caracteres");
      return;
    }
    setError("");
    onSubmit(trimmed);
    setCode("");
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Code prive">
      <div className="space-y-4">
        <p className="text-sm text-text2">
          Saisissez le code a 6 caracteres pour acceder au contenu prive.
        </p>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.slice(0, 6).toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
          className="w-full bg-bg3 border-[1.5px] border-border rounded-input px-4 py-3 text-center text-lg font-mono tracking-[0.3em] text-text placeholder:text-text3 outline-none focus:border-terra"
        />
        {error && <p className="text-sm text-red">{error}</p>}
        <Button variant="primary" size="lg" onClick={handleSubmit}>
          Valider
        </Button>
      </div>
    </BottomSheet>
  );
}
