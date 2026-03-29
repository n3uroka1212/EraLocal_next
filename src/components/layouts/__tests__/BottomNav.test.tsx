import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "../BottomNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

const items = [
  { href: "/", label: "Explorer", icon: "🔍" },
  { href: "/evenements", label: "Evenements", icon: "📅" },
  { href: "/activites", label: "Activites", icon: "🎯" },
  { href: "/soutien", label: "Soutien", icon: "❤️" },
];

describe("BottomNav", () => {
  it("renders all nav items", () => {
    render(<BottomNav items={items} />);
    expect(screen.getByText("Explorer")).toBeInTheDocument();
    expect(screen.getByText("Evenements")).toBeInTheDocument();
    expect(screen.getByText("Activites")).toBeInTheDocument();
    expect(screen.getByText("Soutien")).toBeInTheDocument();
  });

  it("highlights active item", () => {
    render(<BottomNav items={items} />);
    const explorerLink = screen.getByText("Explorer").closest("a");
    expect(explorerLink?.className).toContain("text-terra");
  });

  it("renders links with correct href", () => {
    render(<BottomNav items={items} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[1]).toHaveAttribute("href", "/evenements");
  });
});
