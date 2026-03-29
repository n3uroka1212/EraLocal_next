import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventsPageClient } from "../EventsPageClient";

vi.mock("next/navigation", () => ({
  usePathname: () => "/evenements",
}));

const mockEvents = [
  {
    id: 1,
    title: "Marche bio",
    eventType: "Marche",
    eventDate: new Date(Date.now() + 86400000).toISOString(),
    eventTime: "09:00",
    shopName: "Ferme Bio",
    isRecurring: true,
    isPrivate: false,
    privateCode: null,
    active: true,
  },
  {
    id: 2,
    title: "Degustation privee",
    eventType: "Degustation",
    eventDate: new Date(Date.now() + 86400000).toISOString(),
    eventTime: "19:00",
    shopName: "Cave Vins",
    isRecurring: false,
    isPrivate: true,
    privateCode: "ABC123",
    active: true,
  },
];

describe("EventsPageClient", () => {
  it("renders public events", () => {
    render(<EventsPageClient events={mockEvents} />);
    expect(screen.getByText("Marche bio")).toBeInTheDocument();
  });

  it("hides private events by default", () => {
    render(<EventsPageClient events={mockEvents} />);
    expect(screen.queryByText("Degustation privee")).not.toBeInTheDocument();
  });

  it("filters by type", () => {
    render(<EventsPageClient events={mockEvents} />);
    fireEvent.click(screen.getByText("Degustation"));
    // Public degustation events = 0 (it's private)
    expect(screen.queryByText("Marche bio")).not.toBeInTheDocument();
  });

  it("shows private code button", () => {
    render(<EventsPageClient events={mockEvents} />);
    expect(screen.getByText(/Code prive/)).toBeInTheDocument();
  });

  it("opens private code sheet", () => {
    render(<EventsPageClient events={mockEvents} />);
    fireEvent.click(screen.getByText(/Code prive/));
    expect(screen.getByText(/6 caracteres/)).toBeInTheDocument();
  });
});
