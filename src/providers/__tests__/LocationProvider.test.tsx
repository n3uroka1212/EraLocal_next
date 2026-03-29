import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { LocationProvider, useLocation } from "../LocationProvider";

function wrapper({ children }: { children: React.ReactNode }) {
  return <LocationProvider>{children}</LocationProvider>;
}

describe("LocationProvider", () => {
  it("starts with null position", () => {
    const { result } = renderHook(() => useLocation(), { wrapper });
    expect(result.current.latitude).toBeNull();
    expect(result.current.longitude).toBeNull();
    expect(result.current.radius).toBe(20);
    expect(result.current.loading).toBe(false);
  });

  it("sets manual position", () => {
    const { result } = renderHook(() => useLocation(), { wrapper });

    act(() => {
      result.current.setManualPosition(48.8566, 2.3522);
    });

    expect(result.current.latitude).toBe(48.8566);
    expect(result.current.longitude).toBe(2.3522);
  });

  it("sets radius within bounds", () => {
    const { result } = renderHook(() => useLocation(), { wrapper });

    act(() => {
      result.current.setRadius(50);
    });
    expect(result.current.radius).toBe(50);

    act(() => {
      result.current.setRadius(0);
    });
    expect(result.current.radius).toBe(1);

    act(() => {
      result.current.setRadius(200);
    });
    expect(result.current.radius).toBe(100);
  });

  it("shows error when geolocation not supported", () => {
    const originalGeolocation = navigator.geolocation;
    Object.defineProperty(navigator, "geolocation", { value: undefined, configurable: true });

    const { result } = renderHook(() => useLocation(), { wrapper });

    act(() => {
      result.current.requestLocation();
    });

    expect(result.current.error).toBe("Geolocalisation non supportee");

    Object.defineProperty(navigator, "geolocation", { value: originalGeolocation, configurable: true });
  });
});
