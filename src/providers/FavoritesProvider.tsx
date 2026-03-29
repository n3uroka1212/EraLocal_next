"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { addFavorite, removeFavorite } from "@/actions/favorites";

type FavoriteType = "shop" | "product" | "event" | "activity";

type FavoriteItem = {
  id: number;
  itemType: FavoriteType;
  itemId: number;
};

type FavoritesContextType = {
  favorites: FavoriteItem[];
  isFavorite: (type: FavoriteType, itemId: number) => boolean;
  toggleFavorite: (type: FavoriteType, itemId: number) => Promise<void>;
  getFavoritesByType: (type: FavoriteType) => FavoriteItem[];
  loading: boolean;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function FavoritesProvider({
  children,
  initialFavorites = [],
}: {
  children: ReactNode;
  initialFavorites?: FavoriteItem[];
}) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(initialFavorites);
  const [loading, setLoading] = useState(false);

  const isFavorite = useCallback(
    (type: FavoriteType, itemId: number) => {
      return favorites.some((f) => f.itemType === type && f.itemId === itemId);
    },
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (type: FavoriteType, itemId: number) => {
      const existing = favorites.find(
        (f) => f.itemType === type && f.itemId === itemId,
      );

      // Optimistic update
      if (existing) {
        setFavorites((prev) => prev.filter((f) => f.id !== existing.id));
        const result = await removeFavorite(type, itemId);
        if (result.error) {
          setFavorites((prev) => [...prev, existing]);
        }
      } else {
        const tempId = -Date.now();
        const tempFav = { id: tempId, itemType: type, itemId };
        setFavorites((prev) => [...prev, tempFav]);
        const result = await addFavorite(type, itemId);
        if (result.error) {
          setFavorites((prev) => prev.filter((f) => f.id !== tempId));
        } else if (result.id) {
          setFavorites((prev) =>
            prev.map((f) => (f.id === tempId ? { ...f, id: result.id! } : f)),
          );
        }
      }
    },
    [favorites],
  );

  const getFavoritesByType = useCallback(
    (type: FavoriteType) => {
      return favorites.filter((f) => f.itemType === type);
    },
    [favorites],
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, isFavorite, toggleFavorite, getFavoritesByType, loading }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextType {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
