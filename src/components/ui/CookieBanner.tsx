"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "eralocal_cookie_consent";

type ConsentValue = "accepted" | "refused";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      setVisible(true);
    }
  }, []);

  function handleConsent(value: ConsentValue) {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--bg4)] bg-[var(--bg2)] p-5 shadow-xl">
        <p className="text-sm leading-relaxed text-[var(--text)]">
          Nous utilisons des cookies essentiels pour le fonctionnement du site et
          des cookies analytiques pour ameliorer votre experience. Pour en savoir
          plus, consultez notre{" "}
          <a
            href="/confidentialite"
            className="underline text-[var(--terra)] hover:text-[var(--terra-mid)] transition-colors"
          >
            politique de confidentialite
          </a>
          .
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => handleConsent("accepted")}
            className="rounded-lg bg-[var(--terra)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--terra-mid)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--terra)] cursor-pointer"
          >
            Accepter tout
          </button>
          <button
            onClick={() => handleConsent("refused")}
            className="rounded-lg border border-[var(--bg4)] bg-[var(--bg3)] px-5 py-2.5 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--bg4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--terra)] cursor-pointer"
          >
            Refuser non-essentiels
          </button>
        </div>
      </div>
    </div>
  );
}
