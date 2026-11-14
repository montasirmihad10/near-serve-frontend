import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashPanelProps = {
  children: ReactNode;
  className?: string;
  tone?: "light" | "ink";
  padding?: "md" | "lg";
};

export default function DashPanel({
  children,
  className,
  tone = "light",
  padding = "md",
}: DashPanelProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem]",
        padding === "md" ? "p-5 md:p-6" : "p-6 md:p-8",
        tone === "light"
          ? "bg-white shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(26,18,8,0.06),0_16px_40px_-24px_rgba(26,18,8,0.14)]"
          : "bg-ink text-white shadow-[0_24px_50px_-24px_rgba(26,18,8,0.45)]",
        className,
      )}
    >
      {tone === "ink" && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(199,10,36,0.42),transparent_58%)]" />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
