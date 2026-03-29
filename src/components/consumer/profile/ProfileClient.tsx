"use client";

import { useActionState, useEffect } from "react";
import { updateClientProfile, logoutClient } from "@/actions/clients";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Toast";

interface ClientData {
  id: number;
  name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  createdAt: string;
}

interface ProfileClientProps {
  client: ClientData;
}

export function ProfileClient({ client }: ProfileClientProps) {
  const [state, formAction, isPending] = useActionState(
    updateClientProfile,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      toast("success", "Profil mis a jour avec succes");
    }
    if (state?.error) {
      toast("error", state.error);
    }
  }, [state]);

  return (
    <div className="space-y-8">
      {/* Profile Form */}
      <form action={formAction} className="space-y-4">
        <Input
          label="Nom"
          name="name"
          type="text"
          defaultValue={client.name ?? ""}
          placeholder="Votre nom"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          defaultValue={client.email}
          placeholder="votre@email.com"
          required
        />
        <Input
          label="Telephone"
          name="phone"
          type="tel"
          defaultValue={client.phone ?? ""}
          placeholder="06 12 34 56 78"
        />
        <Input
          label="Ville"
          name="city"
          type="text"
          defaultValue={client.city ?? ""}
          placeholder="Votre ville"
        />

        {state?.error && (
          <p className="text-sm text-red">{state.error}</p>
        )}

        <Button type="submit" variant="primary" size="lg" loading={isPending}>
          Enregistrer
        </Button>
      </form>

      {/* RGPD Section */}
      <section className="rounded-card bg-bg2 border border-border p-5 space-y-3">
        <h2 className="text-base font-semibold text-text">Vos donnees</h2>
        <p className="text-sm text-text2 leading-relaxed">
          EraLocal collecte vos donnees personnelles (nom, email, telephone,
          ville) afin de vous permettre d&apos;utiliser nos services : passer des
          commandes, recevoir des notifications de disponibilite et decouvrir les
          commercants de votre ville. Vos donnees ne sont jamais vendues a des
          tiers. Vous pouvez a tout moment modifier ou supprimer vos informations
          depuis cette page. Pour toute question, contactez-nous a{" "}
          <a
            href="mailto:contact@eralocal.fr"
            className="text-terra underline hover:opacity-80"
          >
            contact@eralocal.fr
          </a>
          .
        </p>
        <p className="text-xs text-text3">
          Membre depuis le{" "}
          {new Date(client.createdAt).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </section>

      {/* Logout */}
      <form action={logoutClient}>
        <Button type="submit" variant="danger" size="lg">
          Deconnexion
        </Button>
      </form>
    </div>
  );
}
