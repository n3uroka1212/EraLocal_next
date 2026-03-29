"use client";

import { useState, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface PinDisplayProps {
  open: boolean;
  onClose: () => void;
  pin: string;
  employeeName: string;
}

export function PinDisplay({ open, onClose, pin, employeeName }: PinDisplayProps) {
  const [copied, setCopied] = useState(false);

  const copyPin = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = pin;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [pin]);

  return (
    <Modal open={open} onClose={onClose} title="PIN de connexion">
      <div className="space-y-5">
        <p className="text-sm text-text2">
          Voici le code PIN pour <span className="font-semibold text-text">{employeeName}</span>.
        </p>

        <div className="flex justify-center py-4">
          <span className="text-4xl font-mono font-bold tracking-[0.4em] text-text bg-bg3 px-6 py-3 rounded-card border border-border select-all">
            {pin}
          </span>
        </div>

        <div className="bg-[#FEF3C7] border border-[#F59E0B]/20 rounded-card px-4 py-3">
          <p className="text-sm text-[#92400E] font-medium">
            Ce PIN ne sera plus affiche. Notez-le.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={copyPin}>
            {copied ? "Copie !" : "Copier le PIN"}
          </Button>
          <Button variant="primary" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
