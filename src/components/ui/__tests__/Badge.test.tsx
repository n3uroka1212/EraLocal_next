import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge", () => {
  it("renders with children", () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders green variant", () => {
    render(<Badge variant="green">OK</Badge>);
    expect(screen.getByText("OK").className).toContain("text-green");
  });

  it("renders red variant", () => {
    render(<Badge variant="red">Error</Badge>);
    expect(screen.getByText("Error").className).toContain("text-red");
  });

  it("renders orange variant", () => {
    render(<Badge variant="orange">Warn</Badge>);
    expect(screen.getByText("Warn").className).toContain("text-[#92400E]");
  });

  it("renders default variant", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default").className).toContain("bg-bg3");
  });
});
