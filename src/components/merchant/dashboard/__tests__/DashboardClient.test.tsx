import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardClient } from "../DashboardClient";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const defaultProps = {
  shop: {
    name: "Boulangerie Martin",
    slug: "SS-ABC12",
    verificationStatus: "verified",
    planType: "free",
  },
  metrics: {
    productCount: 15,
    pendingOrderCount: 3,
    pendingPingCount: 2,
  },
};

describe("DashboardClient", () => {
  it("renders shop name and code", () => {
    render(<DashboardClient {...defaultProps} />);
    expect(screen.getByText("Boulangerie Martin")).toBeInTheDocument();
    expect(screen.getByText("SS-ABC12")).toBeInTheDocument();
  });

  it("displays correct metric counters", () => {
    render(<DashboardClient {...defaultProps} />);
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows verification status badge", () => {
    render(<DashboardClient {...defaultProps} />);
    expect(screen.getByText("Verifie")).toBeInTheDocument();
  });

  it("shows pending verification badge", () => {
    render(
      <DashboardClient
        {...defaultProps}
        shop={{ ...defaultProps.shop, verificationStatus: "pending" }}
      />,
    );
    expect(screen.getByText("En attente")).toBeInTheDocument();
  });

  it("shows Premium badge for premium plan", () => {
    render(
      <DashboardClient
        {...defaultProps}
        shop={{ ...defaultProps.shop, planType: "premium" }}
      />,
    );
    expect(screen.getByText("Premium")).toBeInTheDocument();
  });

  it("renders quick access links", () => {
    render(<DashboardClient {...defaultProps} />);
    expect(screen.getByText("Ma Vitrine")).toBeInTheDocument();
    expect(screen.getByText("Catalogue")).toBeInTheDocument();
    expect(screen.getByText("Commandes")).toBeInTheDocument();
  });
});
