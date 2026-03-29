import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders primary variant by default", () => {
    render(<Button>Primary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-terra");
  });

  it("renders secondary variant", () => {
    render(<Button variant="secondary">Sec</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("border-border");
  });

  it("renders danger variant", () => {
    render(<Button variant="danger">Del</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-red");
  });

  it("renders ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-transparent");
  });

  it("shows spinner and disables when loading", () => {
    render(<Button loading>Loading</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.querySelector(".animate-spin")).toBeTruthy();
  });

  it("calls onClick", () => {
    const fn = vi.fn();
    render(<Button onClick={fn}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(fn).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", () => {
    const fn = vi.fn();
    render(
      <Button onClick={fn} disabled>
        Click
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(fn).not.toHaveBeenCalled();
  });
});
