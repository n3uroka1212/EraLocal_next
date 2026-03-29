import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SoutienPage from "../page";

describe("SoutienPage", () => {
  it("renders the page content", () => {
    render(<SoutienPage />);
    expect(
      screen.getByText("Soutenez le commerce local"),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Notre mission/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Notre histoire/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Notre vision/ })).toBeInTheDocument();
    expect(screen.getByText(/Nous soutenir/)).toBeInTheDocument();
  });
});
