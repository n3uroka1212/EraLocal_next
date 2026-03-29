"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginClient, registerClient } from "@/actions/auth";

export default function ClientAuthForm({ defaultMode = "login" }: { defaultMode?: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const [mode, setMode] = useState<"login" | "register">(defaultMode);

  const [loginState, loginAction, loginPending] = useActionState(loginClient, null);
  const [registerState, registerAction, registerPending] = useActionState(registerClient, null);

  const state = mode === "login" ? loginState : registerState;
  const pending = mode === "login" ? loginPending : registerPending;

  useEffect(() => {
    if (state?.success) {
      router.push(redirectTo);
    }
  }, [state, router, redirectTo]);

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {/* Tabs */}
      <div className="flex rounded-[10px] bg-[var(--bg3)] mb-6 overflow-hidden">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "login"
              ? "bg-[var(--terra)] text-white"
              : "text-[var(--text2)]"
          }`}
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "register"
              ? "bg-[var(--terra)] text-white"
              : "text-[var(--text2)]"
          }`}
        >
          Inscription
        </button>
      </div>

      {state?.error && (
        <div className="bg-[var(--red-light)] text-[var(--red)] text-sm rounded-xl px-4 py-3 mb-4">
          {state.error}
        </div>
      )}

      {mode === "login" ? (
        <form action={loginAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
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
        <form action={registerAction} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1.5">
              Nom (optionnel)
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--terra)]"
            />
          </div>
          <div>
            <label htmlFor="register-email" className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1.5">
              Email
            </label>
            <input
              id="register-email"
              name="email"
              type="email"
              required
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--terra)]"
            />
          </div>
          <div>
            <label htmlFor="register-password" className="block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1.5">
              Mot de passe (min. 8 caracteres)
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              minLength={8}
              required
              className="w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--terra)]"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-[var(--terra)] text-white font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {pending ? "Inscription..." : "Creer mon compte"}
          </button>
        </form>
      )}
    </div>
  );
}
