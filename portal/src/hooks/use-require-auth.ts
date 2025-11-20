"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

export function useRequireAuth(redirectTo = "/login") {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.replace(redirectTo);
    }
  }, [loading, token, router, redirectTo]);

  return { token, loading };
}

