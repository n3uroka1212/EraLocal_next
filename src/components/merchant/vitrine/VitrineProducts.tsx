"use client";

interface VitrineProduct {
  id: number;
  name: string;
  price: number | null;
  priceUnit: string | null;
  category: string | null;
  image: string | null;
  variants: { id: number; name: string; price: number | null }[];
}

interface VitrineProductsProps {
  products: VitrineProduct[];
}

export function VitrineProducts({ products }: VitrineProductsProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text3">Aucun produit visible</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="bg-bg2 border border-border rounded-card overflow-hidden hover:border-terra/50 transition-colors"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-32 object-cover"
            />
          ) : (
            <div className="w-full h-32 bg-bg3 flex items-center justify-center text-3xl text-text3">
              📦
            </div>
          )}
          <div className="p-3">
            <p className="text-sm font-medium text-text line-clamp-2">
              {product.name}
            </p>
            {product.price != null && (
              <p className="text-sm text-terra font-semibold mt-1">
                {product.price.toFixed(2)} &euro;
                {product.priceUnit ? `/${product.priceUnit}` : ""}
              </p>
            )}
            {product.variants.length > 0 && (
              <p className="text-xs text-text3 mt-1">
                {product.variants.length} variante(s)
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
