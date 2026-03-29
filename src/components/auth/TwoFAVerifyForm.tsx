"use client";

import { useActionState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyLoginTOTP } from "@/actions/totp";

export default function TwoFAVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get("shopId") ?? "";

  const [state, formAction, pending] = useActionState(verifyLoginTOTP, null);

  useEffect(() => {
    if (state?.success) {
      router.push(state.redirectTo ?? "/dashboard");
    }
  }, [state, router]);

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {state?.error && (
        <div className="bg-[var(--red-light)] text-[var(--red)] text-sm rounded-xl px-4 py-3 mb-4">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="shopId" value={shopId} />

        <div>
          <label htmlFor="code" className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1.5">
            Code a 6 chiffres
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            pattern="\d{6}"
            required
            autoFocus
            autoComplete="one-time-code"
            placeholder="000000"
            className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] text-center text-2xl font-mono tracking-[0.5em] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--terra)]"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-[var(--terra)] text-white font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
        >
          {pending ? "Verification..." : "Verifier"}
        </button>
      </form>

      <p className="text-center text-xs text-[var(--text2)] mt-4">
        Ouvrez votre application d&apos;authentification (Google Authenticator, Authy...)
        et saisissez le code affiche.
      </p>
    </div>
  );
}
