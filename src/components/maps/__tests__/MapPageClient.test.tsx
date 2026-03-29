import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MapPageClient } from "../MapPageClient";

// Mock dynamic import of MapView
vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => {
    const MockMap = () => <div data-testid="mock-map">Map</div>;
    MockMap.displayName = "MockMap";
    return MockMap;
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/carte",
}));

const mockMarkers = [
  {
    id: 1,
    lat: 48.8566,
    lng: 2.3522,
    label: "Boulangerie Martin",
    emoji: "🥖",
    href: "/boutiques/boulangerie-martin",
    type: "commercant",
  },
];

describe("MapPageClient", () => {
  it("renders header and filters", () => {
    render(<MapPageClient markers={mockMarkers} />);
    expect(screen.getByText("Carte")).toBeInTheDocument();
    expect(screen.getByText("Tous")).toBeInTheDocument();
    expect(screen.getByText("Commercant")).toBeInTheDocument();
  });

  it("renders map component", () => {
    render(<MapPageClient markers={mockMarkers} />);
    expect(screen.getByTestId("mock-map")).toBeInTheDocument();
  });

  it("renders location button", () => {
    render(<MapPageClient markers={mockMarkers} />);
    expect(screen.getByText(/Ma position/)).toBeInTheDocument();
  });
});
