import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Soutien — EraLocal",
  description: "Decouvrez la mission et l'histoire d'EraLocal, la plateforme pour le commerce local",
};

export default function SoutienPage() {
  return (
    <div className="px-4 md:px-6 py-8 max-w-2xl mx-auto">
      {/* Hero */}
      <section className="text-center mb-12">
        <span className="inline-block text-5xl mb-4 animate-[heartbeat_2s_ease-in-out_infinite]">
          ❤️
        </span>
        <h1 className="text-[1.8rem] font-semibold font-serif text-text mb-4">
          Soutenez le commerce local
        </h1>
        <p className="text-base text-text2 leading-relaxed">
          EraLocal est une plateforme dediee aux commercants, artisans et
          producteurs locaux. Notre mission : rendre le commerce de proximite
          accessible et visible a tous.
        </p>
      </section>

      {/* Mission */}
      <section className="mb-10">
        <h2 className="font-serif font-semibold text-[1.15rem] text-text mb-3">
          🎯 Notre mission
        </h2>
        <p className="text-sm text-text2 leading-relaxed">
          Nous croyons que le commerce local est essentiel pour la vitalite de
          nos territoires. EraLocal offre aux commercants une vitrine numerique
          moderne, un catalogue en ligne, et des outils de gestion adaptes a
          leurs besoins.
        </p>
      </section>

      {/* Histoire */}
      <section className="mb-10">
        <h2 className="font-serif font-semibold text-[1.15rem] text-text mb-3">
          📖 Notre histoire
        </h2>
        <p className="text-sm text-text2 leading-relaxed">
          Ne du constat que de nombreux commercants locaux manquent de visibilite
          en ligne, EraLocal a ete cree pour combler ce fossé. Depuis nos
          debuts, nous accompagnons les commercants dans leur transition
          numerique, tout en preservant l&apos;authenticite du commerce de proximite.
        </p>
      </section>

      {/* Vision */}
      <section className="mb-10">
        <h2 className="font-serif font-semibold text-[1.15rem] text-text mb-3">
          🔭 Notre vision
        </h2>
        <p className="text-sm text-text2 leading-relaxed">
          Un futur ou chaque commerce local dispose d&apos;outils numeriques
          puissants et accessibles, ou les consommateurs privilegient les achats
          de proximite, et ou les territoires se developpent grace a une
          economie locale dynamique.
        </p>
      </section>

      {/* CTA */}
      <section className="text-center">
        <a
          href="https://www.buymeacoffee.com/eralocal"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-[30px] bg-gradient-to-r from-[#e74c3c] to-[#c0392b] text-white text-lg font-semibold shadow-[0_4px_20px_rgba(231,76,60,.35)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(231,76,60,.45)] transition-all duration-200"
        >
          ☕ Nous soutenir
        </a>
      </section>
    </div>
  );
}
