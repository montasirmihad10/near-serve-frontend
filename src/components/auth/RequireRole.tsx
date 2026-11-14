"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDemoAuth } from "@/components/providers/DemoAuthProvider";
import { getClientToken } from "@/lib/auth/cookies.client";
import { loginHref, roleHome } from "@/lib/auth/flow";
import type { DemoRole } from "@/lib/auth/demoAuth";

/**
 * Client gate for role workspaces.
 * Middleware already checks JWT; this keeps UI session aligned and
 * stops the old auto-demo-login behavior.
 */
export default function RequireRole({
  allow,
  children,
}: {
  allow: Array<Exclude<DemoRole, "guest">>;
  children: React.ReactNode;
}) {
  const { role, isSyncing } = useDemoAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowKey = allow.join(",");

  useEffect(() => {
    if (isSyncing) return;
    const token = getClientToken();
    if (!token || role === "guest") {
      router.replace(loginHref(pathname));
      return;
    }
    if (!allow.includes(role as Exclude<DemoRole, "guest">)) {
      router.replace(roleHome(role));
    }
    // allowKey keeps the allow list stable without identity churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowKey, isSyncing, pathname, role, router]);

  const token = typeof window !== "undefined" ? getClientToken() : null;
  const ok =
    Boolean(token) &&
    role !== "guest" &&
    allow.includes(role as Exclude<DemoRole, "guest">);

  if (!ok) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-muted">
        Checking access…
      </div>
    );
  }

  return <>{children}</>;
}
