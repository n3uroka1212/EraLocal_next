import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { Badge } from "@/components/ui/Badge";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const city = await prisma.cityAccount.findUnique({
    where: { id: Number(id) },
    select: { name: true, description: true },
  });
  if (!city) return { title: "Ville introuvable" };
  return {
    title: `${city.name ?? "Ville"} — EraLocal`,
    description: city.description ?? `Decouvrez ${city.name}`,
  };
}

export default async function CityPage({ params }: PageProps) {
  const { id } = await params;
  const city = await prisma.cityAccount.findUnique({
    where: { id: Number(id) },
    include: {
      points: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!city) notFound();

  return (
    <div className="px-4 md:px-6 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {city.logoEmoji && <span className="text-4xl">{city.logoEmoji}</span>}
        <div>
          <h1 className="text-[1.8rem] font-semibold font-serif text-text">
            {city.name ?? "Ville"}
          </h1>
          <div className="flex gap-2 mt-1">
            {city.department && (
              <Badge variant="cyan">{city.department}</Badge>
            )}
            {city.region && <Badge variant="purple">{city.region}</Badge>}
          </div>
        </div>
      </div>

      {city.slogan && (
        <p className="text-base italic text-text2 mb-4">&laquo; {city.slogan} &raquo;</p>
      )}

      {city.description && (
        <p className="text-sm text-text2 leading-relaxed mb-6">
          {city.description}
        </p>
      )}

      {/* Points d'interet */}
      {city.points.length > 0 && (
        <section>
          <h2 className="font-serif font-semibold text-[1.15rem] text-text mb-4">
            Points d&apos;interet ({city.points.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {city.points.map((point) => (
              <div
                key={point.id}
                className="p-4 bg-white rounded-card border-[1.5px] border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">
                    {point.category === "monument"
                      ? "🏛️"
                      : point.category === "parc"
                        ? "🌳"
                        : point.category === "eglise"
                          ? "⛪"
                          : "📍"}
                  </span>
                  <h3 className="font-semibold text-sm text-text">
                    {point.name}
                  </h3>
                </div>
                {point.description && (
                  <p className="text-[0.8rem] text-text2">
                    {point.description}
                  </p>
                )}
                {point.category && (
                  <Badge variant="cyan" className="mt-2">
                    {point.category}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
