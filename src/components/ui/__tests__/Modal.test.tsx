import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} onClose={vi.fn()}>
        <p>Content</p>
      </Modal>,
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders content when open", () => {
    render(
      <Modal open={true} onClose={vi.fn()} title="Test Modal">
        <p>Modal body</p>
      </Modal>,
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal body")).toBeInTheDocument();
  });

  it("closes on ESC key", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on overlay click", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose}>
        <p>Content</p>
      </Modal>,
    );
    // Click the outer overlay div (first fixed div)
    const overlay = document.querySelector(".fixed.inset-0");
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it("has close button", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Title">
        <p>Content</p>
      </Modal>,
    );
    fireEvent.click(screen.getByLabelText("Fermer"));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
