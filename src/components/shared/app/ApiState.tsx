"use client";

import type { ReactNode } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import EmptyState from "@/components/shared/app/EmptyState";

type ApiStateProps = {
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  emptyAction?: ReactNode;
  onRetry?: () => void;
  children: ReactNode;
};

/** Consistent loading / error / empty wrappers for API-driven pages. */
export default function ApiState({
  isLoading,
  isError,
  isEmpty,
  errorMessage = "Something went wrong loading this data. Check your connection and try again.",
  emptyTitle = "Nothing here yet",
  emptyDescription = "When there is activity, it will show up here.",
  emptyIcon,
  emptyAction,
  onRetry,
  children,
}: ApiStateProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-border bg-white/70 px-6 py-16 text-sm text-muted">
        <Loader2 className="size-6 animate-spin text-brand" />
        Loading…
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[1.75rem] border border-red-200 bg-red-50/80 px-6 py-12 text-center">
        <AlertCircle className="mx-auto mb-3 size-8 text-red-600" />
        <p className="font-fraunces text-lg font-semibold text-ink">
          Couldn’t load data
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">{errorMessage}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="app-btn mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white"
          >
            <RefreshCw className="size-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return <>{children}</>;
}
