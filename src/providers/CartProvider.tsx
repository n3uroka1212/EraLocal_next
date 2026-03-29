"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type CartItem = {
  productId: number;
  variantId?: number;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  image?: string | null;
};

type CartContextType = {
  items: CartItem[];
  shopId: number | null;
  shopName: string | null;
  total: number;
  itemCount: number;
  addItem: (shopId: number, shopName: string, item: Omit<CartItem, "quantity">) => boolean;
  removeItem: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
  wouldSwitchShop: (newShopId: number) => boolean;
  confirmSwitchShop: (newShopId: number, newShopName: string) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shopId, setShopId] = useState<number | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const wouldSwitchShop = useCallback(
    (newShopId: number) => {
      return shopId !== null && shopId !== newShopId && items.length > 0;
    },
    [shopId, items.length],
  );

  const confirmSwitchShop = useCallback(
    (newShopId: number, newShopName: string) => {
      setItems([]);
      setShopId(newShopId);
      setShopName(newShopName);
    },
    [],
  );

  const addItem = useCallback(
    (newShopId: number, newShopName: string, item: Omit<CartItem, "quantity">): boolean => {
      // Cannot add from different shop without explicit confirmation
      if (shopId !== null && shopId !== newShopId && items.length > 0) {
        return false;
      }

      if (shopId !== newShopId) {
        setShopId(newShopId);
        setShopName(newShopName);
      }

      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.productId === item.productId && i.variantId === item.variantId,
        );

        if (existingIndex >= 0) {
          return prev.map((i, idx) =>
            idx === existingIndex ? { ...i, quantity: i.quantity + 1 } : i,
          );
        }

        return [...prev, { ...item, quantity: 1 }];
      });

      return true;
    },
    [shopId, items.length],
  );

  const removeItem = useCallback(
    (productId: number, variantId?: number) => {
      setItems((prev) => {
        const filtered = prev.filter(
          (i) => !(i.productId === productId && i.variantId === variantId),
        );
        if (filtered.length === 0) {
          setShopId(null);
          setShopName(null);
        }
        return filtered;
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number, variantId?: number) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }

      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.variantId === variantId
            ? { ...i, quantity }
            : i,
        ),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setShopId(null);
    setShopName(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        shopId,
        shopName,
        total,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        wouldSwitchShop,
        confirmSwitchShop,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
