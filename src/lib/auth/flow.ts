import { ROUTES, ROLE_REDIRECT } from "@/utils/navigation";
import type { DemoRole } from "@/lib/auth/demoAuth";

/** Safe relative return path only (no open redirects). */
export function sanitizeReturnUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  if (raw.startsWith("/login") || raw.startsWith("/register")) return null;
  return raw;
}

export function withReturnUrl(path: string, returnUrl?: string | null) {
  const safe = sanitizeReturnUrl(returnUrl);
  if (!safe) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}returnUrl=${encodeURIComponent(safe)}`;
}

export function loginHref(returnUrl?: string | null) {
  return withReturnUrl(ROUTES.LOGIN, returnUrl);
}

export function registerHref(opts?: {
  role?: "customer" | "provider";
  returnUrl?: string | null;
  intent?: "hire" | "offer";
}) {
  const params = new URLSearchParams();
  if (opts?.role) params.set("role", opts.role);
  if (opts?.intent) params.set("intent", opts.intent);
  const safe = sanitizeReturnUrl(opts?.returnUrl);
  if (safe) params.set("returnUrl", safe);
  const q = params.toString();
  return q ? `${ROUTES.REGISTER}?${q}` : ROUTES.REGISTER;
}

/** Guest → register/login into post-job; customer → post-job; others → their home. */
export function hireFlowHref(role: DemoRole) {
  if (role === "customer") return ROUTES.CUSTOMER_POST_JOB;
  if (role === "provider") return ROUTES.PROVIDER_HOME;
  if (role === "admin") return ROUTES.ADMIN_HOME;
  return registerHref({
    role: "customer",
    intent: "hire",
    returnUrl: ROUTES.CUSTOMER_POST_JOB,
  });
}

/** Guest → provider register; provider → feed; others → for-providers or home. */
export function providerJoinHref(role: DemoRole) {
  if (role === "provider") return ROUTES.PROVIDER_HOME;
  if (role === "customer") return ROUTES.FOR_PROVIDERS;
  if (role === "admin") return ROUTES.ADMIN_HOME;
  return registerHref({
    role: "provider",
    intent: "offer",
    returnUrl: ROUTES.PROVIDER_ONBOARDING,
  });
}

export function roleHome(role: string | undefined | null): string {
  if (role === "customer") return ROLE_REDIRECT.customer;
  if (role === "provider") return ROLE_REDIRECT.provider;
  if (role === "admin" || role === "super_admin") return ROLE_REDIRECT.admin;
  return ROUTES.HOME;
}

export function normalizeAuthRole(
  role: string | undefined | null,
): Exclude<DemoRole, "guest"> | null {
  if (role === "user" || role === "customer") return "customer";
  if (role === "provider") return "provider";
  if (role === "admin" || role === "super_admin") return "admin";
  return null;
}
