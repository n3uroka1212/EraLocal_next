import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LandingClient } from "../LandingClient";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const mockShops = [
  {
    slug: "boulangerie-martin",
    name: "Boulangerie Martin",
    category: "Boulangerie",
    businessType: "commercant",
    logoEmoji: "🥖",
    banner: null,
  },
  {
    slug: "ferme-bio",
    name: "Ferme Bio",
    category: "Produits bio",
    businessType: "producteur",
    logoEmoji: "🌾",
    banner: null,
  },
];

const mockProducts = [
  {
    id: 1,
    name: "Pain de campagne",
    price: 3.5,
    priceUnit: null,
    category: "Pains",
    image: null,
    shopSlug: "boulangerie-martin",
  },
];

describe("LandingClient", () => {
  it("renders shops and products", () => {
    render(<LandingClient shops={mockShops} products={mockProducts} />);
    expect(screen.getByText("Boulangerie Martin")).toBeInTheDocument();
    expect(screen.getByText("Ferme Bio")).toBeInTheDocument();
    expect(screen.getByText("Pain de campagne")).toBeInTheDocument();
  });

  it("shows only verified shops (all passed are verified)", () => {
    render(<LandingClient shops={mockShops} products={[]} />);
    expect(screen.getByText("2 boutiques")).toBeInTheDocument();
  });

  it("filters by type", () => {
    render(<LandingClient shops={mockShops} products={[]} />);
    fireEvent.click(screen.getByText("Producteur"));
    expect(screen.getByText("Ferme Bio")).toBeInTheDocument();
    expect(screen.queryByText("Boulangerie Martin")).not.toBeInTheDocument();
  });

  it("renders map link", () => {
    render(<LandingClient shops={mockShops} products={[]} />);
    expect(screen.getByText(/Voir sur la carte/)).toBeInTheDocument();
  });
});
