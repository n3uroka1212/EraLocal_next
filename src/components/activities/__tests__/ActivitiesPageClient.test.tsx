import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActivitiesPageClient } from "../ActivitiesPageClient";

vi.mock("next/navigation", () => ({
  usePathname: () => "/activites",
}));

const mockActivities = [
  {
    id: 1,
    name: "Yoga en plein air",
    category: "Sport",
    mainImage: null,
    priceInfo: "15 EUR",
    shopName: "Studio Zen",
    isPrivate: false,
    folderCode: null,
  },
  {
    id: 2,
    name: "Atelier prive",
    category: "Culture",
    mainImage: null,
    priceInfo: null,
    shopName: "Musee Local",
    isPrivate: true,
    folderCode: "XYZ789",
  },
];

const mockCities = [
  { id: 1, name: "Lyon", department: "69", logoEmoji: "🦁" },
];

describe("ActivitiesPageClient", () => {
  it("renders public activities", () => {
    render(
      <ActivitiesPageClient
        activities={mockActivities}
        cities={mockCities}
      />,
    );
    expect(screen.getByText("Yoga en plein air")).toBeInTheDocument();
  });

  it("renders cities section", () => {
    render(
      <ActivitiesPageClient
        activities={mockActivities}
        cities={mockCities}
      />,
    );
    expect(screen.getByText("Lyon")).toBeInTheDocument();
  });

  it("hides private activities", () => {
    render(
      <ActivitiesPageClient
        activities={mockActivities}
        cities={[]}
      />,
    );
    expect(screen.queryByText("Atelier prive")).not.toBeInTheDocument();
  });

  it("filters by category", () => {
    render(
      <ActivitiesPageClient
        activities={mockActivities}
        cities={[]}
      />,
    );
    fireEvent.click(screen.getByText("Culture"));
    // "Culture" public activities = 0 (it's private)
    expect(screen.queryByText("Yoga en plein air")).not.toBeInTheDocument();
  });
});
