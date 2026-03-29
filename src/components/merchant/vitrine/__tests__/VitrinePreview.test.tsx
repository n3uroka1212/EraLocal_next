import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VitrinePreview } from "../VitrinePreview";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const defaultShop = {
  name: "Boulangerie Martin",
  description: "La meilleure boulangerie",
  category: "Boulangerie",
  address: "12 rue de la Paix",
  postalCode: "75001",
  city: "Paris",
  phone: "0612345678",
  email: "contact@boulangerie.fr",
  website: "https://boulangerie.fr",
  openingHours: null,
  logo: null,
  logoEmoji: "🥖",
  banner: null,
};

const defaultProducts = [
  {
    id: 1,
    name: "Pain complet",
    price: 3.5,
    priceUnit: "piece",
    category: "Pain",
    image: null,
    variants: [],
  },
  {
    id: 2,
    name: "Croissant",
    price: 1.2,
    priceUnit: "piece",
    category: "Viennoiserie",
    image: null,
    variants: [{ id: 1, name: "Beurre", price: 1.2 }],
  },
];

describe("VitrinePreview", () => {
  it("renders shop name", () => {
    render(
      <VitrinePreview
        shop={defaultShop}
        products={defaultProducts}
        categories={["Pain", "Viennoiserie"]}
      />,
    );
    expect(screen.getByText("Boulangerie Martin")).toBeInTheDocument();
  });

  it("renders products", () => {
    render(
      <VitrinePreview
        shop={defaultShop}
        products={defaultProducts}
        categories={["Pain", "Viennoiserie"]}
      />,
    );
    expect(screen.getByText("Pain complet")).toBeInTheDocument();
    expect(screen.getByText("Croissant")).toBeInTheDocument();
  });

  it("filters by category", () => {
    render(
      <VitrinePreview
        shop={defaultShop}
        products={defaultProducts}
        categories={["Pain", "Viennoiserie"]}
      />,
    );

    fireEvent.click(screen.getByText("Pain"));
    expect(screen.getByText("Pain complet")).toBeInTheDocument();
    expect(screen.queryByText("Croissant")).not.toBeInTheDocument();
  });

  it("shows category manager on Gerer click", () => {
    render(
      <VitrinePreview
        shop={defaultShop}
        products={defaultProducts}
        categories={["Pain", "Viennoiserie"]}
      />,
    );

    fireEvent.click(screen.getByText("Gerer"));
    expect(screen.getByText("Gerer les categories")).toBeInTheDocument();
  });

  it("toggles featured category star", () => {
    render(
      <VitrinePreview
        shop={defaultShop}
        products={defaultProducts}
        categories={["Pain", "Viennoiserie"]}
      />,
    );

    fireEvent.click(screen.getByText("Gerer"));
    const stars = screen.getAllByText("☆");
    fireEvent.click(stars[0]);
    expect(screen.getByText("★")).toBeInTheDocument();
  });
});
