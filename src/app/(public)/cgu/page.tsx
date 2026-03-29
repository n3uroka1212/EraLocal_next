import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Generales d'Utilisation — EraLocal",
  description:
    "Conditions Generales d'Utilisation de la plateforme EraLocal.",
};

export default function CGUPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[var(--text)] sm:text-4xl">
        Conditions Generales d&apos;Utilisation
      </h1>
      <p className="mt-2 text-sm text-[var(--text2)]">
        Derniere mise a jour : 28 mars 2026
      </p>

      {/* --- 1. Objet --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          1. Objet
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          Les presentes Conditions Generales d&apos;Utilisation (ci-apres
          &laquo;&nbsp;CGU&nbsp;&raquo;) ont pour objet de definir les
          conditions d&apos;acces et d&apos;utilisation de la plateforme EraLocal
          accessible a l&apos;adresse{" "}
          <span className="text-[var(--terra)]">eralocal.fr</span>. En
          accedant ou en utilisant la plateforme, l&apos;utilisateur accepte sans
          reserve les presentes CGU.
        </p>
      </section>

      {/* --- 2. Definitions --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          2. Definitions
        </h2>
        <ul className="mt-3 list-disc pl-5 space-y-2 text-sm leading-relaxed text-[var(--text2)]">
          <li>
            <strong className="text-[var(--text)]">Plateforme</strong> : le site
            web et l&apos;application EraLocal.
          </li>
          <li>
            <strong className="text-[var(--text)]">Utilisateur</strong> : toute
            personne physique ou morale accedant a la plateforme.
          </li>
          <li>
            <strong className="text-[var(--text)]">Commercant</strong> :
            utilisateur inscrit en tant que professionnel proposant des produits
            ou services.
          </li>
          <li>
            <strong className="text-[var(--text)]">Consommateur</strong> :
            utilisateur inscrit en tant que particulier effectuant des achats ou
            reservations.
          </li>
          <li>
            <strong className="text-[var(--text)]">Contenu</strong> : tout texte,
            image, donnee ou fichier publie sur la plateforme.
          </li>
        </ul>
      </section>

      {/* --- 3. Inscription --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          3. Inscription et Compte
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          L&apos;inscription est ouverte a toute personne physique agee de 16 ans
          minimum ou toute personne morale legalement constituee. L&apos;utilisateur
          s&apos;engage a fournir des informations exactes et a jour lors de
          l&apos;inscription et a les maintenir actualisees. Il est responsable de
          la confidentialite de ses identifiants et de toute activite effectuee
          depuis son compte.
        </p>
      </section>

      {/* --- 4. Donnees Personnelles (RGPD) --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          4. Donnees Personnelles et RGPD
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          EraLocal collecte et traite des donnees personnelles dans le cadre de
          l&apos;utilisation de la plateforme, conformement au Reglement General
          sur la Protection des Donnees (RGPD) et a la loi Informatique et
          Libertes.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          Conformement aux articles 15 a 21 du RGPD, vous disposez des droits
          suivants sur vos donnees personnelles :
        </p>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-sm leading-relaxed text-[var(--text2)]">
          <li>Droit d&apos;acces a vos donnees</li>
          <li>Droit de rectification des donnees inexactes</li>
          <li>Droit a l&apos;effacement (&laquo;&nbsp;droit a l&apos;oubli&nbsp;&raquo;)</li>
          <li>Droit a la portabilite de vos donnees</li>
          <li>Droit d&apos;opposition au traitement</li>
          <li>Droit a la limitation du traitement</li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          Pour exercer ces droits, contactez notre Delegue a la Protection des
          Donnees (DPO) a l&apos;adresse :{" "}
          <a
            href="mailto:dpo@eralocal.fr"
            className="text-[var(--terra)] underline hover:text-[var(--terra-mid)] transition-colors"
          >
            dpo@eralocal.fr
          </a>
          . Pour plus de details, consultez notre{" "}
          <a
            href="/confidentialite"
            className="text-[var(--terra)] underline hover:text-[var(--terra-mid)] transition-colors"
          >
            Politique de Confidentialite
          </a>
          .
        </p>
      </section>

      {/* --- 5. Responsabilite --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          5. Responsabilite
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          EraLocal met en oeuvre les moyens raisonnables pour assurer la
          disponibilite et le bon fonctionnement de la plateforme, sans garantie
          d&apos;absence d&apos;interruption ou d&apos;erreur. EraLocal ne saurait
          etre tenue responsable des contenus publies par les utilisateurs, ni
          des dommages directs ou indirects resultant de l&apos;utilisation de la
          plateforme.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          Chaque commercant est seul responsable de la conformite de ses offres,
          de la qualite de ses produits et du respect de la reglementation
          applicable. EraLocal agit en qualite d&apos;intermediaire technique et ne
          participe pas aux transactions entre commercants et consommateurs.
        </p>
      </section>

      {/* --- 6. Contact --- */}
      <section className="mt-10">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[var(--text)]">
          6. Contact
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--text2)]">
          Pour toute question relative aux presentes CGU, vous pouvez nous
          contacter :
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
