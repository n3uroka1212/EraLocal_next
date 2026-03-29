"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

type ActionFn = (
  prevState: { error?: string; success?: boolean; redirectTo?: string } | null,
  formData: FormData,
) => Promise<{ error?: string; success?: boolean; redirectTo?: string }>;

interface Props {
  action: ActionFn;
  defaultRedirect: string;
  submitLabel?: string;
}

export default function EmailLoginForm({ action, defaultRedirect, submitLabel = "Se connecter" }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) {
      router.push(state.redirectTo ?? defaultRedirect);
    }
  }, [state, router, defaultRedirect]);

  return (
    <div className="w-full max-w-[400px] mx-auto">
      {state?.error && (
        <div className="bg-[var(--red-light)] text-[var(--red)] text-sm rounded-xl px-4 py-3 mb-4">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-4">
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
          {pending ? "Connexion..." : submitLabel}
        </button>
      </form>
    </div>
  );
}
