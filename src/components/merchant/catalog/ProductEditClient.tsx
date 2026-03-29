"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductForm } from "./ProductForm";

interface ProductEditClientProps {
  product: {
    id: number;
    name: string;
    description: string | null;
    price: number | null;
    priceUnit: string | null;
    category: string | null;
    image: string | null;
    available: boolean;
    variants: { id: number; name: string; price: number | null; available: boolean; sortOrder: number }[];
  };
}

export function ProductEditClient({ product }: ProductEditClientProps) {
  const router = useRouter();

  return (
    <>
      <div className="flex items-center gap-3">
        <Link
          href="/catalogue"
          className="text-sm text-text2 hover:text-terra transition-colors"
        >
          &larr; Catalogue
        </Link>
        <h1 className="text-2xl font-bold text-text">
          Modifier : {product.name}
        </h1>
      </div>
      <div className="bg-bg2 border border-border rounded-card p-4">
        <ProductForm
          product={product}
          onSuccess={() => router.push("/catalogue")}
        />
      </div>
    </>
  );
}
