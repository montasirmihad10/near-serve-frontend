"use client";

import { useDemoAuth } from "@/components/providers/DemoAuthProvider";
import {
  hireFlowHref,
  loginHref,
  providerJoinHref,
  registerHref,
} from "@/lib/auth/flow";
import { ROUTES } from "@/utils/navigation";

/**
 * Public CTA targets for login-gated product flows.
 * Guests never jump straight into /customer or /provider.
 */
export function useAuthCta() {
  const { role, isLoggedIn } = useDemoAuth();

  if (role === "customer") {
    return {
      isLoggedIn,
      role,
      primary: { href: ROUTES.CUSTOMER_POST_JOB, label: "Post a job" },
      secondary: { href: ROUTES.CUSTOMER_HOME, label: "My jobs" },
      providerJoin: { href: ROUTES.FOR_PROVIDERS, label: "For providers" },
      hire: { href: ROUTES.CUSTOMER_POST_JOB, label: "Post a job" },
    };
  }

  if (role === "provider") {
    return {
      isLoggedIn,
      role,
      primary: { href: ROUTES.PROVIDER_HOME, label: "Browse job feed" },
      secondary: { href: ROUTES.PROVIDER_MY_BIDS, label: "My bids" },
      providerJoin: { href: ROUTES.PROVIDER_HOME, label: "Open job feed" },
      hire: { href: ROUTES.PROVIDER_HOME, label: "Open job feed" },
    };
  }

  if (role === "admin") {
    return {
      isLoggedIn,
      role,
      primary: { href: ROUTES.ADMIN_HOME, label: "Open admin" },
      secondary: { href: ROUTES.ADMIN_PROVIDERS, label: "Providers" },
      providerJoin: { href: ROUTES.ADMIN_HOME, label: "Admin" },
      hire: { href: ROUTES.ADMIN_HOME, label: "Admin" },
    };
  }

  return {
    isLoggedIn,
    role,
    primary: {
      href: registerHref({
        role: "customer",
        intent: "hire",
        returnUrl: ROUTES.CUSTOMER_POST_JOB,
      }),
      label: "Get started",
    },
    secondary: {
      href: loginHref(ROUTES.CUSTOMER_POST_JOB),
      label: "Log in",
    },
    providerJoin: {
      href: providerJoinHref("guest"),
      label: "Join as a provider",
    },
    hire: {
      href: hireFlowHref("guest"),
      label: "Post a job",
    },
  };
}
