"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getToken, setSession, clearSession } from "@/lib/auth";
import { fetchFeed } from "@/lib/api";

type Status = "loading" | "authenticated" | "unauthenticated";

type SessionContextType = {
  status: Status;
  login: (access: string, refresh?: string | null) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession(): SessionContextType {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within an AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let cancelled = false;

    if (!getToken()) {
      setStatus("unauthenticated");
      return;
    }

    // Validate the access token by hitting an authenticated endpoint.
    // apiFetch transparently refreshes; a rejection means the session is dead.
    fetchFeed()
      .then(() => {
        if (!cancelled) setStatus("authenticated");
      })
      .catch(() => {
        if (!cancelled) setStatus("unauthenticated");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    (access: string, refresh?: string | null) => {
      setSession(access, refresh);
      setStatus("authenticated");
    },
    []
  );

  const logout = useCallback(() => {
    clearSession();
    setStatus("unauthenticated");
    router.push("/login");
  }, [router]);

  return (
    <SessionContext.Provider value={{ status, login, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
