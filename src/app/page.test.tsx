import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("renders without error", () => {
    render(<Home />);
    expect(screen.getByText("EraLocal")).toBeInTheDocument();
  });
});
