"use client";

import { useActionState, useState, useEffect } from "react";
import { registerMerchant } from "@/actions/auth";

type Step = 1 | 2 | 3;

export default function MerchantRegisterWizard() {
  const [step, setStep] = useState<Step>(1);
  const [formValues, setFormValues] = useState({
    name: "",
    address: "",
    postalCode: "",
    city: "",
    siret: "",
    phone: "",
    email: "",
    password: "",
  });

  const [state, formAction, pending] = useActionState(registerMerchant, null);

  useEffect(() => {
    if (state?.success) {
      setStep(3);
    }
  }, [state]);

  const handleStep1 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setFormValues({
      name: fd.get("name") as string,
      address: fd.get("address") as string,
      postalCode: fd.get("postalCode") as string,
      city: fd.get("city") as string,
      siret: fd.get("siret") as string,
      phone: fd.get("phone") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });
    setStep(2);
  };

  const handleStep2Submit = () => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(formValues)) {
      fd.set(k, v);
    }
    formAction(fd);
  };

  const inputClass =
    "w-full bg-[var(--bg3)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text)] placeholder:text-[var(--text3)] focus:outline-none focus:border-[var(--terra)]";
  const labelClass =
    "block text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1.5";

  return (
    <div className="w-full max-w-[500px] mx-auto">
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? "bg-[var(--terra)]" : "bg-[var(--bg3)]"
            }`}
          />
        ))}
      </div>

      {state?.error && step !== 3 && (
        <div className="bg-[var(--red-light)] text-[var(--red)] text-sm rounded-xl px-4 py-3 mb-4">
          {state.error}
        </div>
      )}

      {/* Step 1: Informations */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <h2 className="font-serif text-lg font-semibold text-[var(--text)] mb-2">
            Informations de votre boutique
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClass}>Nom de la boutique</label>
              <input id="name" name="name" required defaultValue={formValues.name} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className={labelClass}>Adresse</label>
              <input id="address" name="address" required defaultValue={formValues.address} className={inputClass} />
            </div>
            <div>
              <label htmlFor="postalCode" className={labelClass}>Code postal</label>
              <input id="postalCode" name="postalCode" required pattern="\d{5}" defaultValue={formValues.postalCode} className={inputClass} />
            </div>
            <div>
              <label htmlFor="city" className={labelClass}>Ville</label>
              <input id="city" name="city" required defaultValue={formValues.city} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="siret" className={labelClass}>SIRET (14 chiffres)</label>
              <input id="siret" name="siret" required pattern="\d{14}" maxLength={14} defaultValue={formValues.siret} className={inputClass} />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Telephone</label>
              <input id="phone" name="phone" type="tel" required defaultValue={formValues.phone} className={inputClass} />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input id="email" name="email" type="email" required defaultValue={formValues.email} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="password" className={labelClass}>Mot de passe (min 8 car., 1 maj, 1 min, 1 chiffre)</label>
              <input id="password" name="password" type="password" required minLength={8} defaultValue={formValues.password} className={inputClass} />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--terra)] text-white font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors"
          >
            Continuer
          </button>
        </form>
      )}

      {/* Step 2: Confirmation & documents */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-serif text-lg font-semibold text-[var(--text)] mb-2">
            Confirmation
          </h2>

          <div className="bg-[var(--bg3)] rounded-xl p-4 space-y-2 text-sm">
            <div><span className="text-[var(--text2)]">Boutique :</span> <span className="text-[var(--text)]">{formValues.name}</span></div>
            <div><span className="text-[var(--text2)]">Adresse :</span> <span className="text-[var(--text)]">{formValues.address}, {formValues.postalCode} {formValues.city}</span></div>
            <div><span className="text-[var(--text2)]">SIRET :</span> <span className="text-[var(--text)]">{formValues.siret}</span></div>
            <div><span className="text-[var(--text2)]">Email :</span> <span className="text-[var(--text)]">{formValues.email}</span></div>
            <div><span className="text-[var(--text2)]">Telephone :</span> <span className="text-[var(--text)]">{formValues.phone}</span></div>
          </div>

          <p className="text-xs text-[var(--text2)]">
            Les documents de verification (piece d&apos;identite, justificatif) pourront etre ajoutes depuis votre dashboard.
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 border border-[var(--border)] text-[var(--text)] font-medium py-3 rounded-xl hover:bg-[var(--bg3)] transition-colors"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={handleStep2Submit}
              disabled={pending}
              className="flex-1 bg-[var(--terra)] text-white font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {pending ? "Creation..." : "Creer ma boutique"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Success */}
      {step === 3 && state?.success && (
        <div className="text-center space-y-6">
          <h2 className="font-serif text-lg font-semibold text-[var(--text)]">
            Boutique creee !
          </h2>

          <div className="bg-[var(--green-light)] rounded-xl p-6 space-y-4">
            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1">
                Code boutique
              </p>
              <p className="font-mono text-2xl font-bold text-[var(--green)]">
                {state.shopCode}
              </p>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(state.shopCode ?? "")}
                className="text-xs text-[var(--terra)] mt-1 hover:underline"
              >
                Copier
              </button>
            </div>

            <div>
              <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-[var(--text2)] mb-1">
                PIN
              </p>
              <p className="font-mono text-2xl font-bold text-[var(--green)]">
                {state.pin}
              </p>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(state.pin ?? "")}
                className="text-xs text-[var(--terra)] mt-1 hover:underline"
              >
                Copier
              </button>
            </div>
          </div>

          <p className="text-sm text-[var(--red)] font-medium">
            Notez ces informations ! Le PIN ne sera plus affiche.
          </p>

          <a
            href="/dashboard"
            className="inline-block w-full bg-[var(--terra)] text-white font-medium py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-center"
          >
            Acceder a mon dashboard
          </a>
        </div>
      )}
    </div>
  );
}
