"use client";

import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { useGetOverallLeaderboardQuery } from "@/redux/api/leaderboardApi";
import { ROUTES } from "@/utils/navigation";

/* eslint-disable @typescript-eslint/no-explicit-any */

function extractRows(data: unknown): any[] {
  const raw = (data as any)?.data?.result || (data as any)?.data || data;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.providers)) return raw.providers;
  if (Array.isArray(raw?.leaderboard)) return raw.leaderboard;
  return [];
}

export default function LeaderboardPulse({
  title = "Neighborhood leaders",
  ctaHref = ROUTES.LEADERBOARD,
}: {
  title?: string;
  ctaHref?: string;
}) {
  const { data, isError } = useGetOverallLeaderboardQuery({ limit: 5 });
  const rows = extractRows(data).slice(0, 5);

  if (isError || rows.length === 0) return null;

  return (
    <div className="app-surface rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="size-4 text-amber-600" />
          <h2 className="font-fraunces text-lg font-semibold text-ink">
            {title}
          </h2>
        </div>
        <Link
          href={ctaHref}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline"
        >
          Full board
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="space-y-2">
        {rows.map((row, index) => {
          const name =
            row.userId?.name ||
            row.provider?.userId?.name ||
            row.name ||
            "Provider";
          const trust = Number(row.trustScore ?? row.score ?? 0);
          const jobs = Number(row.totalJobs ?? row.jobs ?? 0);
          const category = row.category || row.topCategory || "Pro";
          return (
            <div
              key={row._id || row.id || `${name}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-cream/70 px-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {name}
                  </p>
                  <p className="text-[11px] text-muted">
                    {category}
                    {jobs ? ` · ${jobs} jobs` : ""}
                  </p>
                </div>
              </div>
              {trust > 0 && (
                <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                  Trust {Math.round(trust)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
