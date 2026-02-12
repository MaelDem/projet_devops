import { createContext, type ReactNode, useEffect, useState } from "react";
import * as authApi from "../api/auth";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (password: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "club_poisson_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const res = await authApi.checkAuth(stored);
        if (res.authenticated) {
          setToken(stored);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setLoading(false);
    }
    verify();
  }, []);

  async function login(password: string): Promise<string | null> {
    const res = await authApi.login(password);
    if ("error" in res) return res.error;
    setToken(res.token);
    localStorage.setItem(STORAGE_KEY, res.token);
    return null;
  }

  async function logout() {
    if (token) await authApi.logout(token);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: token !== null, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Re-export the context for the useAuth hook
export { AuthContext };
export type { AuthContextValue };
