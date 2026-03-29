import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductVariants } from "@/components/product/ProductVariants";
import { ProductShopInfo } from "@/components/product/ProductShopInfo";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { PingButton } from "@/components/product/PingButton";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string; id: string }>;
}

async function getProduct(slug: string, id: number) {
  const product = await prisma.catalogProduct.findUnique({
    where: { id },
    include: {
      shop: {
        select: {
          id: true,
          slug: true,
          name: true,
          city: true,
          logoEmoji: true,
          verificationStatus: true,
          clickCollectEnabled: true,
        },
      },
      variants: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (
    !product ||
    product.shop.slug !== slug ||
    product.shop.verificationStatus !== "verified"
  ) {
    return null;
  }

  return product;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug, id } = await params;
  const product = await getProduct(slug, Number(id));

  if (!product) {
    return { title: "Produit introuvable — EraLocal" };
  }

  return {
    title: `${product.name} — ${product.shop.name} — EraLocal`,
    description: product.description ?? `${product.name} chez ${product.shop.name}`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug, id } = await params;
  const product = await getProduct(slug, Number(id));

  if (!product) notFound();

  return (
    <div>
      {/* Image */}
      <div className="relative w-full aspect-square md:aspect-video md:max-h-96 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-terra-light to-bg3 flex items-center justify-center">
            <span className="text-5xl text-text3">📦</span>
          </div>
        )}
      </div>

      <div className="px-4 md:px-6 py-4 space-y-6">
        <ProductInfo
          name={product.name}
          description={product.description}
          price={product.price}
          priceUnit={product.priceUnit}
          category={product.category}
        />

        {/* Disponibilite */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${product.available ? "bg-green" : "bg-red"}`}
          />
          <span
            className={`text-sm font-medium ${product.available ? "text-green" : "text-red"}`}
          >
            {product.available ? "En stock" : "Rupture de stock"}
          </span>
        </div>

        <ProductVariants variants={product.variants} />

        <ProductShopInfo
          shopSlug={product.shop.slug}
          shopName={product.shop.name}
          shopCity={product.shop.city}
          shopLogoEmoji={product.shop.logoEmoji}
        />

        <div className="space-y-3 pb-4">
          <AddToCartButton
            productId={product.id}
            available={product.available}
            clickCollectEnabled={product.shop.clickCollectEnabled}
            shopId={product.shop.id}
            shopName={product.shop.name}
            productName={product.name}
            price={Number(product.price)}
            image={product.image}
          />
          <PingButton productId={product.id} />
        </div>
      </div>
    </div>
  );
}
