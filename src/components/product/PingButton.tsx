"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { sendPing } from "@/actions/consumer-pings";
import { Button } from "@/components/ui/Button";
import { PingResponsePopup } from "@/components/popups/PingResponsePopup";
import { toast } from "@/components/ui/Toast";

interface PingButtonProps {
  productId: number;
}

type PingStatus = "idle" | "sending" | "polling" | "responded" | "cooldown";

interface PingResponse {
  id: number;
  status: string;
  response: "en_stock" | "rupture" | null;
  productName: string;
  respondedAt: string | null;
}

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
const POLL_INTERVAL_MS = 3000;

export function PingButton({ productId }: PingButtonProps) {
  const [status, setStatus] = useState<PingStatus>("idle");
  const [pingResponse, setPingResponse] = useState<PingResponse | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownEndRef = useRef<number>(0);

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const startCooldown = useCallback(() => {
    setStatus("cooldown");
    cooldownEndRef.current = Date.now() + COOLDOWN_MS;

    const updateRemaining = () => {
      const remaining = Math.max(0, cooldownEndRef.current - Date.now());
      setCooldownRemaining(remaining);
      if (remaining <= 0) {
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = null;
        setStatus("idle");
        setCooldownRemaining(0);
      }
    };

    updateRemaining();
    cooldownRef.current = setInterval(updateRemaining, 1000);
  }, []);

  const notifyUser = useCallback(() => {
    // Audio notification
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio not supported, ignore
    }

    // Vibration
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

  const pollForResponse = useCallback(
    (pingId: number) => {
      setStatus("polling");

      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/pings/status/${pingId}`);
          if (!res.ok) return;

          const data: PingResponse = await res.json();

          if (data.status !== "pending" && data.response) {
            clearPolling();
            setPingResponse(data);
            setShowPopup(true);
            notifyUser();
            startCooldown();
          }
        } catch {
          // Network error, will retry on next interval
        }
      }, POLL_INTERVAL_MS);
    },
    [clearPolling, notifyUser, startCooldown],
  );

  const handleClick = async () => {
    setStatus("sending");

    const result = await sendPing(productId);

    if (result.error) {
      toast("error", result.error);
      setStatus("idle");
      return;
    }

    if (result.success && result.pingId) {
      toast("info", "Ping envoye au commercant");
      pollForResponse(result.pingId);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearPolling();
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [clearPolling]);

  const formatCooldown = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const isDisabled =
    status === "sending" || status === "polling" || status === "cooldown";

  const buttonLabel = (): string => {
    switch (status) {
      case "sending":
        return "Envoi...";
      case "polling":
        return "En attente...";
      case "cooldown":
        return `Patientez ${formatCooldown(cooldownRemaining)}`;
      case "responded":
      case "idle":
      default:
        return "Demander la disponibilite";
    }
  };

  return (
    <>
      <Button
        variant="secondary"
        size="lg"
        disabled={isDisabled}
        loading={status === "sending"}
        onClick={handleClick}
      >
        {status === "polling" && (
          <span className="inline-block w-4 h-4 border-2 border-terra border-t-transparent rounded-full animate-spin" />
        )}
        {buttonLabel()}
      </Button>

      {showPopup && pingResponse?.response && (
        <PingResponsePopup
          open={showPopup}
          onClose={() => setShowPopup(false)}
          response={pingResponse.response}
          productName={pingResponse.productName}
        />
      )}
    </>
  );
}
