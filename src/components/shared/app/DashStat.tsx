import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashStatProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "brand" | "amber" | "emerald" | "rose" | "sky" | "ink";
  className?: string;
  index?: number;
};

const TONE: Record<NonNullable<DashStatProps["tone"]>, string> = {
  brand: "bg-brand/10 text-brand",
  amber: "bg-amber-50 text-amber-700",
  emerald: "bg-emerald-50 text-emerald-700",
  rose: "bg-rose-50 text-rose-700",
  sky: "bg-sky-50 text-sky-700",
  ink: "bg-ink/5 text-ink",
};

export default function DashStat({
  label,
  value,
  hint,
  icon,
  tone = "brand",
  className,
  index = 0,
}: DashStatProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-[1.5rem] bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(26,18,8,0.06),0_12px_32px_-18px_rgba(26,18,8,0.14)] transition-transform duration-400 hover:-translate-y-0.5",
        "animate-fade-up",
        className,
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(199,10,36,0.06),transparent_70%)]" />
      <div className="relative flex items-start gap-4">
        {icon && (
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105",
              TONE[tone],
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
            {label}
          </div>
          <div className="mt-1 font-fraunces text-2xl font-semibold tabular-nums text-ink md:text-[1.75rem]">
            {value}
          </div>
          {hint && (
            <div className="mt-1 text-xs font-medium text-muted/90">{hint}</div>
          )}
        </div>
      </div>
    </div>
  );
}
