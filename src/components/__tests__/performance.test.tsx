import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <img data-nextimage="true" {...props} />
  ),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a {...props}>{children}</a>,
}));

vi.mock("@/components/ui/PriceDisplay", () => ({
  PriceDisplay: () => <span>price</span>,
}));

// Test that key components use next/image instead of raw <img>
describe("Image optimization", () => {
  it("ShopCard uses Next.js Image for banner", async () => {
    const { ShopCard } = await import("@/components/cards/ShopCard");
    const { container } = render(
      <ShopCard
        slug="test"
        name="Test Shop"
        businessType="commercant"
        banner="https://example.com/img.jpg"
      />,
    );
    const img = container.querySelector('img[data-nextimage="true"]');
    expect(img).toBeTruthy();
  });

  it("ProductCard uses Next.js Image for product image", async () => {
    const { ProductCard } = await import("@/components/cards/ProductCard");
    const { container } = render(
      <ProductCard
        id={1}
        shopSlug="test"
        name="Produit"
        image="https://example.com/product.jpg"
      />,
    );
    const img = container.querySelector('img[data-nextimage="true"]');
    expect(img).toBeTruthy();
  });
});

// Test lazy loading of Leaflet
describe("Lazy loading", () => {
  it("LazyMapView uses next/dynamic (not loaded at import time)", async () => {
    const mod = await import("@/components/maps/LazyMapView");
    expect(mod.LazyMapView).toBeDefined();
    expect(typeof mod.LazyMapView).toBe("object");
  });
});
