import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { CartProvider, useCart } from "../CartProvider";

function wrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}

describe("CartProvider", () => {
  it("starts with empty cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.items).toHaveLength(0);
    expect(result.current.shopId).toBeNull();
    expect(result.current.total).toBe(0);
    expect(result.current.itemCount).toBe(0);
  });

  it("addItem: adds product correctly", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(1, "Boulangerie", {
        productId: 10,
        name: "Pain",
        price: 1.5,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe("Pain");
    expect(result.current.items[0].quantity).toBe(1);
    expect(result.current.shopId).toBe(1);
    expect(result.current.total).toBe(1.5);
    expect(result.current.itemCount).toBe(1);
  });

  it("addItem: same product increments quantity", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(1, "Boulangerie", {
        productId: 10,
        name: "Pain",
        price: 1.5,
      });
    });

    act(() => {
      result.current.addItem(1, "Boulangerie", {
        productId: 10,
        name: "Pain",
        price: 1.5,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.total).toBe(3.0);
    expect(result.current.itemCount).toBe(2);
  });

  it("removeItem: removes product", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(1, "Boulangerie", {
        productId: 10,
        name: "Pain",
        price: 1.5,
      });
    });

    act(() => {
      result.current.removeItem(10);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.shopId).toBeNull();
  });

  it("updateQuantity: updates quantity", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(1, "Boulangerie", {
        productId: 10,
        name: "Pain",
        price: 1.5,
      });
    });

    act(() => {
      result.current.updateQuantity(10, 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.total).toBe(7.5);
  });

  it("updateQuantity: quantity 0 removes item", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(1, "Boulangerie", {
        productId: 10,
        name: "Pain",
        price: 1.5,
      });
    });

    act(() => {
      result.current.updateQuantity(10, 0);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("clearCart: empties cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(1, "Boulangerie", {
        productId: 10,
        name: "Pain",
        price: 1.5,
      });
      result.current.addItem(1, "Boulangerie", {
        productId: 11,
        name: "Croissant",
        price: 1.2,
      });
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.shopId).toBeNull();
    expect(result.current.shopName).toBeNull();
  });

  it("mono-boutique: rejects add from different shop", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(1, "Boulangerie", {
        productId: 10,
        name: "Pain",
        price: 1.5,
      });
    });

    let added: boolean;
    act(() => {
      added = result.current.addItem(2, "Fromagerie", {
        productId: 20,
        name: "Fromage",
        price: 5.0,
      });
    });

    expect(added!).toBe(false);
    expect(result.current.items).toHaveLength(1);
    expect(result.current.shopId).toBe(1);
  });

  it("wouldSwitchShop: detects shop switch", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(1, "Boulangerie", {
        productId: 10,
        name: "Pain",
        price: 1.5,
      });
    });

    expect(result.current.wouldSwitchShop(2)).toBe(true);
    expect(result.current.wouldSwitchShop(1)).toBe(false);
  });

  it("confirmSwitchShop: clears and switches", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addItem(1, "Boulangerie", {
        productId: 10,
        name: "Pain",
        price: 1.5,
      });
    });

    act(() => {
      result.current.confirmSwitchShop(2, "Fromagerie");
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.shopId).toBe(2);
    expect(result.current.shopName).toBe("Fromagerie");
  });
});
