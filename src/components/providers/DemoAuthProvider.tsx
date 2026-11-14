"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  DEMO_USERS,
  type DemoRole,
  type DemoUser,
  readDemoAuth,
  writeDemoAuth,
} from "@/lib/auth/demoAuth";
import { handleLogout, handleLoginSuccess } from "@/lib/auth/auth.handlers";
import { extractAccessToken, getApiErrorMessage } from "@/lib/auth/auth.utils";
import { ROUTES } from "@/utils/navigation";
import { envConfig } from "@/config/envConfig";
import { getClientToken } from "@/lib/auth/cookies.client";
import { resetSocket, getSocket } from "@/lib/socket";
import { baseApi } from "@/redux/api/baseApi";
import { useDispatch } from "react-redux";
import { decodeJwt } from "@/utils/jwt";
import { normalizeAuthRole, roleHome } from "@/lib/auth/flow";

type DemoAuthContextValue = {
  role: DemoRole;
  user: DemoUser | null;
  isLoggedIn: boolean;
  isSyncing: boolean;
  /** Preview + API login for seeded demo accounts */
  setDemoRole: (role: DemoRole) => Promise<void>;
  /** Set UI role after a real login without re-authenticating */
  applyRole: (role: DemoRole) => void;
  logout: () => void;
  homePath: string;
};

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null);

async function loginDemoAccount(email: string, password: string) {
  const { getFcmToken } = await import("@/hooks/useFcmToken");
  const fcmToken = await getFcmToken();
  const res = await fetch(`${envConfig.baseApi}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
      ...(fcmToken ? { fcmToken } : {}),
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || "Demo login failed");
  }
  const token = extractAccessToken(json);
  if (!token) throw new Error("No access token returned");
  return token;
}

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useDispatch();
  const [role, setRole] = useState<DemoRole>("guest");
  const [hydrated, setHydrated] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = getClientToken();
    if (token) {
      const payload = decodeJwt(token);
      const normalized = normalizeAuthRole(payload?.role);
      if (normalized) {
        writeDemoAuth(normalized);
        setRole(normalized);
        setSessionEmail(
          typeof (payload as { email?: string })?.email === "string"
            ? (payload as { email?: string }).email || null
            : null,
        );
        setHydrated(true);
        return;
      }
    }

    const stored = readDemoAuth();
    if (!token && stored !== "guest") {
      writeDemoAuth("guest");
      setRole("guest");
    } else {
      setRole(stored);
    }
    setHydrated(true);
  }, []);

  const logout = useCallback(() => {
    handleLogout();
    writeDemoAuth("guest");
    setRole("guest");
    setSessionName(null);
    setSessionEmail(null);
    resetSocket();
    dispatch(baseApi.util.resetApiState());
  }, [dispatch]);

  const applyRole = useCallback((next: DemoRole) => {
    writeDemoAuth(next);
    setRole(next);
  }, []);

  const setDemoRole = useCallback(
    async (next: DemoRole) => {
      if (next === "guest") {
        logout();
        if (typeof window !== "undefined") {
          window.location.assign(ROUTES.HOME);
        }
        return;
      }

      const demo = DEMO_USERS[next];
      setIsSyncing(true);
      try {
        const token = await loginDemoAccount(demo.email, demo.password);
        handleLoginSuccess(token);
        writeDemoAuth(next);
        setRole(next);
        setSessionName(demo.name);
        setSessionEmail(demo.email);
        dispatch(baseApi.util.resetApiState());

        resetSocket();
        const socket = getSocket();
        socket.auth = { token };
        socket.connect();

        toast.success(`Signed in as ${demo.name}`, {
          description: `${demo.email} · live API session`,
        });

        // Land in the role workspace (website for customer/provider, control for admin)
        if (typeof window !== "undefined") {
          window.location.assign(roleHome(next));
        }
      } catch (err) {
        toast.error(getApiErrorMessage(err, "Could not sync demo login"), {
          description:
            "Stay on public pages, or fix backend seeds / API login.",
        });
      } finally {
        setIsSyncing(false);
      }
    },
    [dispatch, logout],
  );

  const user: DemoUser | null =
    role === "guest"
      ? null
      : {
          ...(DEMO_USERS[role] || {
            role,
            name: "User",
            email: "",
            password: "",
          }),
          name: sessionName || DEMO_USERS[role]?.name || "User",
          email: sessionEmail || DEMO_USERS[role]?.email || "",
        };

  const homePath = roleHome(role) || ROUTES.HOME;

  const value = useMemo(
    () => ({
      role,
      user,
      isLoggedIn: role !== "guest" && Boolean(getClientToken()),
      isSyncing,
      setDemoRole,
      applyRole,
      logout,
      homePath,
    }),
    [role, user, isSyncing, setDemoRole, applyRole, logout, homePath],
  );

  if (!hydrated) {
    return (
      <DemoAuthContext.Provider
        value={{
          role: "guest",
          user: null,
          isLoggedIn: false,
          isSyncing: false,
          setDemoRole: async () => undefined,
          applyRole: () => undefined,
          logout: () => undefined,
          homePath: ROUTES.HOME,
        }}
      >
        {children}
      </DemoAuthContext.Provider>
    );
  }

  return (
    <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>
  );
}

export function useDemoAuth() {
  const ctx = useContext(DemoAuthContext);
  if (!ctx) {
    throw new Error("useDemoAuth must be used within DemoAuthProvider");
  }
  return ctx;
}
