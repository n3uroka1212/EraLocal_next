"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createCityAccount } from "@/actions/admin";
import { toast } from "@/components/ui/Toast";

interface Props {
  onSuccess: (name: string, password: string) => void;
  onCancel: () => void;
}

export function CityAccountForm({ onSuccess, onCancel }: Props) {
  const [state, formAction, isPending] = useActionState(createCityAccount, null);

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast("error", state.error);
    } else if (state.success && state.password) {
      // Get the name from the form for the success callback
      const form = document.querySelector<HTMLFormElement>(
        "[data-city-form]",
      );
      const nameInput = form?.querySelector<HTMLInputElement>(
        'input[name="name"]',
      );
      const name = nameInput?.value ?? "Ville";
      onSuccess(name, state.password);
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} data-city-form className="space-y-4">
      <Input
        name="name"
        label="Nom de la ville"
        placeholder="Ex: Marseille"
        required
      />
      <Input
        name="email"
        label="Email"
        type="email"
        placeholder="contact@ville-marseille.fr"
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          name="department"
          label="Departement"
          placeholder="Ex: 13"
        />
        <Input
          name="region"
          label="Region"
          placeholder="Ex: PACA"
        />
      </div>
      <Input
        name="contactName"
        label="Nom du contact"
        placeholder="Ex: Jean Dupont"
      />
      <Input
        name="phone"
        label="Telephone"
        type="tel"
        placeholder="Ex: 0491000000"
      />

      {state?.error && (
        <p className="text-sm text-red bg-red-light rounded-input px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={isPending}>
          Creer le compte
        </Button>
      </div>
    </form>
  );
}
