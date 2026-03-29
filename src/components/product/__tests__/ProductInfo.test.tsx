import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductInfo } from "../ProductInfo";

describe("ProductInfo", () => {
  it("renders name and price", () => {
    render(<ProductInfo name="Pain" price={3.5} />);
    expect(screen.getByText("Pain")).toBeInTheDocument();
    expect(screen.getByText(/3,50/)).toBeInTheDocument();
  });

  it("renders category badge", () => {
    render(<ProductInfo name="Pain" category="Boulangerie" />);
    expect(screen.getByText("Boulangerie")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<ProductInfo name="Pain" description="Pain frais du jour" />);
    expect(screen.getByText("Pain frais du jour")).toBeInTheDocument();
  });
});
