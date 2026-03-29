import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CatalogProductCard } from "../CatalogProductCard";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const defaultProduct = {
  id: 1,
  name: "Pain complet",
  description: "Un bon pain",
  price: 3.5,
  priceUnit: "piece",
  category: "Pain",
  image: null,
  available: true,
  sortOrder: 0,
  variantSourceName: null,
  variants: [],
};

describe("CatalogProductCard", () => {
  it("renders product name and price", () => {
    render(
      <CatalogProductCard
        product={defaultProduct}
        onToggleVisibility={vi.fn()}
        onDelete={vi.fn()}
        isPending={false}
      />,
    );
    expect(screen.getByText("Pain complet")).toBeInTheDocument();
  });

  it("shows category badge", () => {
    render(
      <CatalogProductCard
        product={defaultProduct}
        onToggleVisibility={vi.fn()}
        onDelete={vi.fn()}
        isPending={false}
      />,
    );
    expect(screen.getByText("Pain")).toBeInTheDocument();
  });

  it("shows variant count badge when variants exist", () => {
    render(
      <CatalogProductCard
        product={{
          ...defaultProduct,
          variants: [
            { id: 1, name: "250g", price: 3.5, available: true, sortOrder: 0 },
            { id: 2, name: "500g", price: 6.0, available: true, sortOrder: 1 },
          ],
        }}
        onToggleVisibility={vi.fn()}
        onDelete={vi.fn()}
        isPending={false}
      />,
    );
    expect(screen.getByText("2 variante(s)")).toBeInTheDocument();
  });

  it("calls onToggleVisibility when toggle is clicked", () => {
    const onToggle = vi.fn();
    render(
      <CatalogProductCard
        product={defaultProduct}
        onToggleVisibility={onToggle}
        onDelete={vi.fn()}
        isPending={false}
      />,
    );
    const toggle = screen.getByRole("switch");
    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("shows Split button when onSplit is provided", () => {
    render(
      <CatalogProductCard
        product={{
          ...defaultProduct,
          variants: [
            { id: 1, name: "250g", price: 3.5, available: true, sortOrder: 0 },
          ],
        }}
        onToggleVisibility={vi.fn()}
        onDelete={vi.fn()}
        onSplit={vi.fn()}
        isPending={false}
      />,
    );
    expect(screen.getByText("Split")).toBeInTheDocument();
  });

  it("shows Merge button when onMerge is provided", () => {
    render(
      <CatalogProductCard
        product={defaultProduct}
        onToggleVisibility={vi.fn()}
        onDelete={vi.fn()}
        onMerge={vi.fn()}
        isPending={false}
      />,
    );
    expect(screen.getByText("Merge")).toBeInTheDocument();
  });

  it("links to product edit page", () => {
    render(
      <CatalogProductCard
        product={defaultProduct}
        onToggleVisibility={vi.fn()}
        onDelete={vi.fn()}
        isPending={false}
      />,
    );
    const link = screen.getByText("Pain complet");
    expect(link.closest("a")?.getAttribute("href")).toBe("/catalogue/1");
  });
});
