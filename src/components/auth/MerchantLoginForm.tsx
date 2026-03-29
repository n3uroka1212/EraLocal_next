"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginMerchant, loginMerchantEmail } from "@/actions/auth";

export default function MerchantLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const [mode, setMode] = useState<"code" | "email">("code");

  const [codeState, codeAction, codePending] = useActionState(loginMerchant, null);
  const [emailState, emailAction, emailPending] = useActionState(loginMerchantEmail, null);

  const state = mode === "code" ? codeState : emailState;
  const pending = mode === "code" ? codePending : emailPending;

  useEffect(() => {
    if (state?.success) {
      router.push(state.redirectTo ?? redirectTo);
    } else if (state?.redirectTo && !state.success) {
      router.push(state.redirectTo);
    }
  }, [state, router, redirectTo]);

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Mode toggle */}
      <div className="flex rounded-[10px] bg-[var(--bg3)] mb-6 overflow-hidden">
        <button
          type="button"
          onClick={() => setMode("code")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "code"
              ? "bg-[var(--terra)] text-white"
              : "text-[var(--text2)]"
          }`}
        >
          Code boutique
        </button>
        <button
          type="button"
          onClick={() => setMode("email")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "email"
              ? "bg-[var(--terra)] text-white"
              : "text-[var(--text2)]"
          }`}
        >
          Email
        </button>
      </div>

      {state?.error && (
        <div className="bg-[var(--red-light)] text-[var(--red)] text-sm rounded-xl px-4 py-3 mb-4">
          {state.error}
        </div>
      )}

      {mode === "code" ? (
        <form action={codeAction} className="space-y-4">
          <div>
            <label htmlFor="shopCode" className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1.5">
              Code boutique
            </label>
            <input
              id="shopCode"
              name="shopCode"
              type="text"
              placeholder="SS-XXXXX"
              required
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--terra)]"
            />
          </div>
          <div>
            <label htmlFor="pin" className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1.5">
              PIN
            </label>
            <input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              required
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--terra)]"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[var(--terra)] text-white font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {pending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      ) : (
        <form action={emailAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="marchand@email.com"
              required
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--terra)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1.5">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              required
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--terra)]"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[var(--terra)] text-white font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {pending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-[var(--text2)] mt-6">
        Pas encore de boutique ?{" "}
        <a href="/auth/register" className="text-[var(--terra)] font-medium hover:underline">
          Creer un compte
        </a>
      </p>
    </div>
  );
}
