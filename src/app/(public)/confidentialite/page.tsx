import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialite — EraLocal",
  description:
    "Politique de confidentialite et protection des donnees personnelles EraLocal.",
};

export default function ConfidentialitePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--text)] sm:text-4xl">
        Politique de Confidentialite
      </h1>
      <p className="mt-2 text-sm text-[var(--text2)]">
        Derniere mise a jour : 28 mars 2026
      </p>

      {/* --- 1. Responsable du traitement --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          1. Responsable du traitement
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          Le responsable du traitement des donnees personnelles est :<br />
          <strong className="text-[var(--text)]">EraLocal SAS</strong>
          <br />
          Adresse : [Adresse a completer]
          <br />
          Email :{" "}
          <a
            href="mailto:contact@eralocal.fr"
            className="text-[var(--terra)] underline hover:text-[var(--terra-mid)] transition-colors"
          >
            contact@eralocal.fr
          </a>
        </p>
      </section>

      {/* --- 2. DPO --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          2. Delegue a la Protection des Donnees (DPO)
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          Vous pouvez contacter notre DPO pour toute question relative a la
          protection de vos donnees personnelles :<br />
          Email :{" "}
          <a
            href="mailto:dpo@eralocal.fr"
            className="text-[var(--terra)] underline hover:text-[var(--terra-mid)] transition-colors"
          >
            dpo@eralocal.fr
          </a>
        </p>
      </section>

      {/* --- 3. Donnees collectees --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          3. Donnees collectees
        </h2>

        <h3 className="mt-4 text-base font-medium text-[var(--text)]">
          Consommateur
        </h3>
        <ul className="mt-2 list-disc pl-5 space-y-1 text-sm leading-relaxed text-[var(--text2)]">
          <li>Nom, prenom, adresse email</li>
          <li>Adresse de livraison / retrait</li>
          <li>Historique de commandes et reservations</li>
          <li>Preferences et favoris</li>
          <li>Donnees de navigation et de geolocalisation (avec consentement)</li>
        </ul>

        <h3 className="mt-4 text-base font-medium text-[var(--text)]">
          Commercant
        </h3>
        <ul className="mt-2 list-disc pl-5 space-y-1 text-sm leading-relaxed text-[var(--text2)]">
          <li>Raison sociale, SIRET, adresse du commerce</li>
          <li>Nom et prenom du representant, adresse email</li>
          <li>Catalogue produits (descriptions, prix, images)</li>
          <li>Documents comptables (factures, bons de commande)</li>
          <li>Donnees analytiques (ventes, frequentation)</li>
        </ul>
      </section>

      {/* --- 4. Finalites du traitement --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          4. Finalites du traitement
        </h2>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm leading-relaxed text-[var(--text2)]">
          <li>Gestion des comptes utilisateurs et authentification</li>
          <li>Fourniture des services de la plateforme (vitrine, catalogue, Click &amp; Collect)</li>
          <li>Traitement des commandes et reservations</li>
          <li>Communication avec les utilisateurs (notifications, support)</li>
          <li>Amelioration de la plateforme et analyse statistique anonymisee</li>
          <li>Respect des obligations legales et comptables</li>
        </ul>
      </section>

      {/* --- 5. Base legale --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          5. Base legale par traitement
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--bg4)]">
                <th className="py-2 pr-4 text-left font-medium text-[var(--text)]">
                  Traitement
                </th>
                <th className="py-2 text-left font-medium text-[var(--text)]">
                  Base legale
                </th>
              </tr>
            </thead>
            <tbody className="text-[var(--text2)]">
              <tr className="border-b border-[var(--bg4)]">
                <td className="py-2 pr-4">Gestion de compte</td>
                <td className="py-2">Execution du contrat</td>
              </tr>
              <tr className="border-b border-[var(--bg4)]">
                <td className="py-2 pr-4">Traitement des commandes</td>
                <td className="py-2">Execution du contrat</td>
              </tr>
              <tr className="border-b border-[var(--bg4)]">
                <td className="py-2 pr-4">Cookies analytiques</td>
                <td className="py-2">Consentement</td>
              </tr>
              <tr className="border-b border-[var(--bg4)]">
                <td className="py-2 pr-4">Geolocalisation</td>
                <td className="py-2">Consentement</td>
              </tr>
              <tr className="border-b border-[var(--bg4)]">
                <td className="py-2 pr-4">Obligations comptables</td>
                <td className="py-2">Obligation legale</td>
              </tr>
              <tr className="border-b border-[var(--bg4)]">
                <td className="py-2 pr-4">Securite de la plateforme</td>
                <td className="py-2">Interet legitime</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* --- 6. Duree de conservation --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          6. Duree de conservation
        </h2>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm leading-relaxed text-[var(--text2)]">
          <li>
            <strong className="text-[var(--text)]">Donnees analytiques</strong> :
            13 mois maximum
          </li>
          <li>
            <strong className="text-[var(--text)]">Donnees de commandes</strong> :
            5 ans (obligations comptables)
          </li>
          <li>
            <strong className="text-[var(--text)]">Documents scannes</strong> :
            6 mois apres traitement
          </li>
          <li>
            <strong className="text-[var(--text)]">Compte utilisateur</strong> :
            conservation pendant la duree de la relation contractuelle, puis 3
            ans apres la derniere activite
          </li>
        </ul>
      </section>

      {/* --- 7. Droits de la personne --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          7. Vos droits
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          Conformement au RGPD (articles 15 a 21) et a la loi Informatique et
          Libertes, vous disposez des droits suivants :
        </p>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm leading-relaxed text-[var(--text2)]">
          <li>
            <strong className="text-[var(--text)]">Acces</strong> : obtenir la
            confirmation que vos donnees sont traitees et en recevoir une copie
          </li>
          <li>
            <strong className="text-[var(--text)]">Rectification</strong> :
            corriger des donnees inexactes ou incompletes
          </li>
          <li>
            <strong className="text-[var(--text)]">Effacement</strong> :
            demander la suppression de vos donnees dans les conditions prevues
            par la loi
          </li>
          <li>
            <strong className="text-[var(--text)]">Portabilite</strong> :
            recevoir vos donnees dans un format structure et lisible par machine
          </li>
          <li>
            <strong className="text-[var(--text)]">Opposition</strong> : vous
            opposer au traitement de vos donnees pour des motifs legitimes
          </li>
          <li>
            <strong className="text-[var(--text)]">Limitation</strong> :
            demander la limitation du traitement dans certains cas
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          Pour exercer ces droits, contactez notre DPO a{" "}
          <a
            href="mailto:dpo@eralocal.fr"
            className="text-[var(--terra)] underline hover:text-[var(--terra-mid)] transition-colors"
          >
            dpo@eralocal.fr
          </a>
          . Vous pouvez egalement introduire une reclamation aupres de la CNIL (
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--terra)] underline hover:text-[var(--terra-mid)] transition-colors"
          >
            www.cnil.fr
          </a>
          ).
        </p>
      </section>

      {/* --- 8. Cookies --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          8. Cookies utilises
        </h2>

        <h3 className="mt-4 text-base font-medium text-[var(--text)]">
          Cookies essentiels (sans consentement)
        </h3>
        <ul className="mt-2 list-disc pl-5 space-y-1 text-sm leading-relaxed text-[var(--text2)]">
          <li>
            <strong className="text-[var(--text)]">eralocal_session</strong> :
            maintien de la session utilisateur
          </li>
          <li>
            <strong className="text-[var(--text)]">eralocal_theme</strong> :
            preference de theme (clair / sombre)
          </li>
          <li>
            <strong className="text-[var(--text)]">eralocal_cookie_consent</strong> :
            enregistrement de votre choix de consentement
          </li>
        </ul>

        <h3 className="mt-4 text-base font-medium text-[var(--text)]">
          Cookies analytiques (avec consentement)
        </h3>
        <ul className="mt-2 list-disc pl-5 space-y-1 text-sm leading-relaxed text-[var(--text2)]">
          <li>
            Mesure d&apos;audience anonymisee pour ameliorer l&apos;experience
            utilisateur
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          Vous pouvez a tout moment modifier vos preferences de cookies en
          supprimant vos donnees de navigation ou via les parametres de votre
          navigateur.
        </p>
      </section>

      {/* --- 9. Contact --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          9. Contact
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          Pour toute question relative a cette politique de confidentialite :
        </p>
        <ul className="mt-3 list-none space-y-1 text-sm leading-relaxed text-[var(--text2)]">
          <li>
            Email :{" "}
            <a
              href="mailto:contact@eralocal.fr"
              className="text-[var(--terra)] underline hover:text-[var(--terra-mid)] transition-colors"
            >
              contact@eralocal.fr
            </a>
          </li>
          <li>
            DPO :{" "}
            <a
              href="mailto:dpo@eralocal.fr"
              className="text-[var(--terra)] underline hover:text-[var(--terra-mid)] transition-colors"
            >
              dpo@eralocal.fr
            </a>
          </li>
          <li>Adresse : [Adresse a completer]</li>
        </ul>
      </section>

      <hr className="mt-12 border-[var(--bg4)]" />
      <p className="mt-4 text-xs text-[var(--text3)]">
        EraLocal — Tous droits reserves.
      </p>
    </main>
  );
}
