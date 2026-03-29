"use client";

import { createContext, useContext, type ReactNode } from "react";

type UserRole = "merchant" | "consumer" | "admin" | "city" | null;

type AuthContextType = {
  userId: number | null;
  userType: UserRole;
  shopId: number | null;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  userId: null,
  userType: null,
  shopId: null,
  isAuthenticated: false,
});

export function AuthProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: { userId: number; userType: string; shopId?: number } | null;
}) {
  const value: AuthContextType = {
    userId: session?.userId ?? null,
    userType: (session?.userType as UserRole) ?? null,
    shopId: session?.shopId ?? null,
    isAuthenticated: session !== null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
