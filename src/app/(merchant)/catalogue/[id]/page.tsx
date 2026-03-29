import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/client";
import { ProductForm } from "@/components/merchant/catalog/ProductForm";
import { ProductEditClient } from "@/components/merchant/catalog/ProductEditClient";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.userType !== "merchant" || !session.shopId) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const productId = parseInt(id, 10);
  if (isNaN(productId)) notFound();

  const product = await prisma.catalogProduct.findUnique({
    where: { id: productId },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product || product.shopId !== session.shopId) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ProductEditClient
        product={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          priceUnit: product.priceUnit,
          category: product.category,
          image: product.image,
          available: product.available,
          variants: product.variants.map((v) => ({
            id: v.id,
            name: v.name,
            price: v.price,
            available: v.available,
            sortOrder: v.sortOrder,
          })),
        }}
      />
    </div>
  );
}
