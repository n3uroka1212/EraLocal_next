import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthProvider";

describe("AuthProvider", () => {
  it("shows unauthenticated state when no session", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider session={null}>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.userId).toBeNull();
    expect(result.current.userType).toBeNull();
  });

  it("shows authenticated state with session", () => {
    const session = { userId: 1, userType: "consumer" };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider session={session}>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.userId).toBe(1);
    expect(result.current.userType).toBe("consumer");
  });

  it("includes shopId for merchant", () => {
    const session = { userId: 1, userType: "merchant", shopId: 42 };
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider session={session}>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.shopId).toBe(42);
    expect(result.current.userType).toBe("merchant");
  });
});
