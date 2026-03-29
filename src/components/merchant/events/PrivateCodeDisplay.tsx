"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { regenerateEventCode } from "@/actions/events";

interface PrivateCodeDisplayProps {
  eventId: number;
  code: string;
}

export function PrivateCodeDisplay({ eventId, code }: PrivateCodeDisplayProps) {
  const [currentCode, setCurrentCode] = useState(code);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = currentCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regenerateEventCode(eventId);
      if (result.success && result.privateCode) {
        setCurrentCode(result.privateCode);
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-bg3 border border-border rounded-input px-3 py-1.5">
        <span className="font-mono text-sm font-bold tracking-[0.2em] text-terra select-all">
          {currentCode}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        title="Copier le code"
      >
        {copied ? (
          <svg className="w-4 h-4 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRegenerate}
        loading={isPending}
        title="Regenerer le code"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </Button>
    </div>
  );
}
