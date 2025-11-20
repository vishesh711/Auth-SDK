"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authStorage } from "@/lib/auth-storage";
import type { Developer } from "@/lib/types";

interface AuthContextValue {
  developer: Developer | null;
  token: string | null;
  loading: boolean;
  setAuth: (token: string, developer: Developer) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = authStorage.getToken();
    const storedDeveloper = authStorage.getDeveloper();
    setToken(storedToken);
    setDeveloper(storedDeveloper);
    setLoading(false);
  }, []);

  const setAuth = (nextToken: string, nextDeveloper: Developer) => {
    authStorage.setToken(nextToken);
    authStorage.setDeveloper(nextDeveloper);
    setToken(nextToken);
    setDeveloper(nextDeveloper);
  };

  const logout = () => {
    authStorage.clearAll();
    setDeveloper(null);
    setToken(null);
    if (pathname !== "/login") {
      router.replace("/login");
    }
  };

  const value = useMemo(
    () => ({
      developer,
      token,
      loading,
      setAuth,
      logout,
    }),
    [developer, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

