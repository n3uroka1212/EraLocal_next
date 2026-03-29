import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "../SearchBar";

describe("SearchBar", () => {
  it("renders input", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(
      screen.getByPlaceholderText(/Rechercher/),
    ).toBeInTheDocument();
  });

  it("debounces search by 250ms", async () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByPlaceholderText(/Rechercher/), {
      target: { value: "pain" },
    });

    // Not called yet
    expect(onSearch).not.toHaveBeenCalledWith("pain");

    // After 250ms
    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(onSearch).toHaveBeenCalledWith("pain");
    vi.useRealTimers();
  });

  it("shows clear button when has value", () => {
    render(<SearchBar onSearch={vi.fn()} />);
    fireEvent.change(screen.getByPlaceholderText(/Rechercher/), {
      target: { value: "test" },
    });
    expect(screen.getByLabelText("Effacer")).toBeInTheDocument();
  });
});
