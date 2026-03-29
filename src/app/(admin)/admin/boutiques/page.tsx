import { prisma } from "@/lib/db/client";
import { ShopVerificationClient } from "@/components/admin/ShopVerificationClient";

export const metadata = { title: "Admin — Verification boutiques" };

export default async function AdminBoutiquesPage() {
  const shops = await prisma.shop.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      slug: true,
      siret: true,
      category: true,
      city: true,
      verificationStatus: true,
      verificationDate: true,
      verificationReason: true,
      docIdRecto: true,
      docIdVerso: true,
      docJustificatif: true,
      docKbis: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = shops.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    verificationDate: s.verificationDate?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-serif font-bold text-text">
          Verification des boutiques
        </h1>
        <p className="text-sm text-text2 mt-1">
          Validez ou rejetez les inscriptions commercant
        </p>
      </div>
      <ShopVerificationClient shops={serialized} />
    </div>
  );
}
