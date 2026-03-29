import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShopHours } from "../ShopHours";

describe("ShopHours", () => {
  beforeEach(() => {
    // Mock: Wednesday 10:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-25T10:00:00")); // Wednesday
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows Ouvert when within hours", () => {
    render(
      <ShopHours
        openingHours={{
          lundi: { open: "09:00", close: "18:00" },
          mardi: { open: "09:00", close: "18:00" },
          mercredi: { open: "09:00", close: "18:00" },
          jeudi: { open: "09:00", close: "18:00" },
          vendredi: { open: "09:00", close: "18:00" },
          samedi: { open: "09:00", close: "13:00" },
          dimanche: { open: "00:00", close: "00:00", closed: true },
        }}
      />,
    );
    expect(screen.getByText("Ouvert")).toBeInTheDocument();
  });

  it("shows Ferme when outside hours", () => {
    vi.setSystemTime(new Date("2026-03-29T10:00:00")); // Sunday
    render(
      <ShopHours
        openingHours={{
          lundi: { open: "09:00", close: "18:00" },
          mardi: { open: "09:00", close: "18:00" },
          mercredi: { open: "09:00", close: "18:00" },
          jeudi: { open: "09:00", close: "18:00" },
          vendredi: { open: "09:00", close: "18:00" },
          samedi: { open: "09:00", close: "13:00" },
          dimanche: { open: "00:00", close: "00:00", closed: true },
        }}
      />,
    );
    // Status indicator "Ferme" + Sunday "Ferme" row
    const fermeElements = screen.getAllByText("Ferme");
    expect(fermeElements.length).toBeGreaterThanOrEqual(1);
    // The status badge should say Ferme
    expect(fermeElements[0].className).toContain("text-[#9B3A25]");
  });

  it("shows day labels", () => {
    render(
      <ShopHours
        openingHours={{
          lundi: { open: "09:00", close: "18:00" },
          mardi: { open: "09:00", close: "18:00" },
          mercredi: { open: "09:00", close: "18:00" },
          jeudi: { open: "09:00", close: "18:00" },
          vendredi: { open: "09:00", close: "18:00" },
          samedi: { open: "09:00", close: "13:00" },
          dimanche: { open: "00:00", close: "00:00", closed: true },
        }}
      />,
    );
    expect(screen.getByText("Lundi")).toBeInTheDocument();
    expect(screen.getByText("Dimanche")).toBeInTheDocument();
  });

  it("shows Ferme when no hours", () => {
    render(<ShopHours openingHours={null} />);
    expect(screen.getByText("Ferme")).toBeInTheDocument();
  });
});
