import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-5 animate-fade-up",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2.5 inline-flex max-w-full items-center gap-2 truncate rounded-full border border-brand/12 bg-brand/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand sm:mb-3 sm:text-[11px] sm:tracking-[0.16em]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-fraunces text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-ink sm:text-3xl md:text-[2.55rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-muted sm:mt-2.5 sm:text-sm md:text-[15px]">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          {action}
        </div>
      )}
    </div>
  );
}
