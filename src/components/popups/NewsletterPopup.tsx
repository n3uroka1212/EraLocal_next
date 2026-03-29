"use client";

import { useEffect, useState, useActionState } from "react";
import { subscribeNewsletter } from "@/actions/clients";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "eralocal_newsletter_seen";

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [state, formAction, isPending] = useActionState(
    subscribeNewsletter,
    null,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => {
      setVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  useEffect(() => {
    if (state?.success) {
      localStorage.setItem(STORAGE_KEY, "1");
    }
  }, [state]);

  useEffect(() => {
    if (!visible) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-4"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Inscription a la newsletter"
        onClick={(e) => e.stopPropagation()}
        className="relative bg-bg2 rounded-modal p-6 shadow-lg w-full max-w-md animate-[scaleIn_0.3s_ease]"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-small text-text3 hover:text-text hover:bg-bg3 transition-colors"
          aria-label="Fermer"
        >
          &#x2715;
        </button>

        {state?.success ? (
          /* Success state */
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-light text-green text-2xl font-bold">
              &#x2713;
            </div>
            <h2 className="text-xl font-bold font-serif text-text mb-2">
              Merci !
            </h2>
            <p className="text-sm text-text2">
              Vous recevrez bientot nos actualites locales.
            </p>
            <Button
              variant="primary"
              size="md"
              className="mt-4"
              onClick={handleClose}
            >
              Fermer
            </Button>
          </div>
        ) : (
          /* Form state */
          <>
            <h2 className="text-xl font-bold font-serif text-text mb-1">
              Restez informe
            </h2>
            <p className="text-sm text-text2 mb-5">
              Recevez les dernieres nouveautes de vos commercants locaux
              directement dans votre boite mail.
            </p>

            <form action={formAction} className="space-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="votre@email.com"
                required
              />

              {state?.error && (
                <p className="text-sm text-red">{state.error}</p>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isPending}
              >
                S&apos;inscrire
              </Button>
            </form>

            <p className="text-[0.65rem] text-text3 mt-4 leading-relaxed">
              En vous inscrivant, vous acceptez de recevoir nos emails.
              Desinscription a tout moment.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
