import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicHeader } from "../PublicHeader";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe("PublicHeader", () => {
  it("renders EraLocal brand", () => {
    render(<PublicHeader />);
    expect(screen.getByText("EraLocal")).toBeInTheDocument();
  });

  it("renders desktop navigation links", () => {
    render(<PublicHeader />);
    expect(screen.getByText("Explorer")).toBeInTheDocument();
    expect(screen.getByText("Evenements")).toBeInTheDocument();
    expect(screen.getByText("Activites")).toBeInTheDocument();
    expect(screen.getByText("Soutien")).toBeInTheDocument();
  });

  it("renders theme toggle", () => {
    render(<PublicHeader />);
    const toggleBtn = screen.getByLabelText(/mode/i);
    expect(toggleBtn).toBeInTheDocument();
  });
});
