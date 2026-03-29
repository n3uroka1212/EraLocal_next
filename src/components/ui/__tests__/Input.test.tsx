import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "../Input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("renders with placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("shows error message", () => {
    render(<Input label="Name" error="Required field" />);
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("applies error styling", () => {
    render(<Input error="Err" />);
    const input = screen.getByRole("textbox");
    expect(input.className).toContain("border-red");
  });
});
