import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ToastProvider, useToast } from "../ToastProvider";

function wrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe("ToastProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("starts with no toasts", () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current.toasts).toEqual([]);
  });

  it("adds a toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("Hello", "success");
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("Hello");
    expect(result.current.toasts[0].type).toBe("success");
  });

  it("dismisses a toast", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("Toast 1", "info");
    });

    const id = result.current.toasts[0].id;

    act(() => {
      result.current.dismissToast(id);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("clears all toasts", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("A", "info");
      result.current.addToast("B", "error");
    });

    expect(result.current.toasts).toHaveLength(2);

    act(() => {
      result.current.clearToasts();
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("auto-dismisses after duration", () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.addToast("Temporary", "info", 3000);
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useToast());
    }).toThrow("useToast must be used within a ToastProvider");
  });
});
