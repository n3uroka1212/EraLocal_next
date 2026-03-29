import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PriceDisplay } from "../PriceDisplay";

describe("PriceDisplay", () => {
  it("formats price in EUR", () => {
    render(<PriceDisplay price={12.5} />);
    // French locale formats as "12,50 €" (with non-breaking spaces)
    const el = screen.getByText(/12,50/);
    expect(el).toBeInTheDocument();
  });

  it("shows unit", () => {
    render(<PriceDisplay price={3} unit="kg" />);
    expect(screen.getByText("/ kg")).toBeInTheDocument();
  });

  it("formats zero correctly", () => {
    render(<PriceDisplay price={0} />);
    expect(screen.getByText(/0,00/)).toBeInTheDocument();
  });
});
