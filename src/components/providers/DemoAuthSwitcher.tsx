"use client";

import { useDemoAuth } from "@/components/providers/DemoAuthProvider";
import type { DemoRole } from "@/lib/auth/demoAuth";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const OPTIONS: { role: DemoRole; label: string }[] = [
  { role: "guest", label: "Guest" },
  { role: "customer", label: "Customer" },
  { role: "provider", label: "Provider" },
  { role: "admin", label: "Admin" },
];

/**
 * Preview + live API sync via seeded demo accounts.
 * Remove or hide before production.
 */
export default function DemoAuthSwitcher() {
  const { role, setDemoRole, isSyncing } = useDemoAuth();

  return (
    <div className="fixed bottom-4 left-4 z-[90] flex max-w-[220px] flex-col gap-1.5 rounded-2xl border border-border bg-cream/95 p-2 shadow-[0_8px_32px_rgba(26,18,8,0.14)] backdrop-blur-md">
      <p className="flex items-center gap-1.5 px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
        Preview as
        {isSyncing && <Loader2 className="size-3 animate-spin text-brand" />}
      </p>
      <div className="flex flex-col gap-1">
        {OPTIONS.map((opt) => (
          <button
            key={opt.role}
            type="button"
            disabled={isSyncing}
            onClick={() => void setDemoRole(opt.role)}
            className={cn(
              "rounded-xl px-3 py-2 text-left text-xs font-semibold transition-all duration-300 disabled:opacity-60",
              role === opt.role
                ? "bg-ink text-white shadow-sm"
                : "text-warm hover:bg-white hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <p className="px-2 pb-1 text-[9px] leading-snug text-muted">
        Logs into seeded users with JWT. Guest = public website.
      </p>
    </div>
  );
}
