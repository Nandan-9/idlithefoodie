"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { fetchMe, logoutRequest } from "@/lib/api";

export type User = { id: number; username: string; phone_number: string };

type Status = "loading" | "authenticated" | "unauthenticated";

type SessionContextType = {
  status: Status;
  user: User | null;
  refetch: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const mounted = useRef(true);

  const refetch = useCallback(async () => {
    try {
      const me = await fetchMe();
      if (!mounted.current) return;
      setUser(me);
      setStatus("authenticated");
    } catch {
      if (!mounted.current) return;
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    // Hydrate the session from the auth cookie on first load.
    fetchMe()
      .then((me) => {
        if (mounted.current) {
          setUser(me);
          setStatus("authenticated");
        }
      })
      .catch(() => {
        if (mounted.current) {
          setUser(null);
          setStatus("unauthenticated");
        }
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  const logout = useCallback(() => {
    logoutRequest().finally(() => {
      setUser(null);
      setStatus("unauthenticated");
      router.push("/login");
    });
  }, [router]);

  return (
    <SessionContext.Provider value={{ status, user, refetch, logout }}>
      {children}
    </SessionContext.Provider>
  );
}
