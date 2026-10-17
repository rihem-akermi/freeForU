"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "@/lib/api/auth";

interface AuthUser {
  id: number;
  role: "CLIENT" | "AGENT" | "ADMIN";
  name: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null)) // visiteur non connecté → pas une erreur à afficher
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);