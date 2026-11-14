"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Table as TableIcon,
  LayoutGrid,
  Map as MapIcon,
  MapPin,
  Zap,
  ArrowRight,
  TrendingUp,
  Navigation,
  Users,
} from "lucide-react";
import {
  JOB_CATEGORIES,
  formatDistance,
} from "@/lib/marketplace/constants";
import { useGetMeQuery } from "@/redux/api/userApi";
import { unwrapOne } from "@/lib/api/rows";
import FeedJobCard from "@/components/provider/FeedJobCard";
import FeedMap from "@/components/provider/FeedMap";
import PendingApproval from "@/components/provider/PendingApproval";
import { ROUTES } from "@/utils/navigation";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/app/PageHeader";
import EmptyState from "@/components/shared/app/EmptyState";
import ApiState from "@/components/shared/app/ApiState";
import DashStat from "@/components/shared/app/DashStat";
import DashPanel from "@/components/shared/app/DashPanel";
import UseTable from "@/components/ui/UseTable";
import StatusChip from "@/components/customer/StatusChip";
import { formatCurrency, formatRelativeTime } from "@/lib/customer/format";
import type { FeedJob } from "@/types/job";
import { useGetJobFeedQuery } from "@/redux/api/jobApi";
import { useGetMyBidsQuery } from "@/redux/api/bidApi";
import { useGetProviderAnalyticsQuery } from "@/redux/api/analyticsApi";
import LeaderboardPulse from "@/components/shared/app/LeaderboardPulse";
import { unwrapList } from "@/lib/api/rows";
import { useDemoAuth } from "@/components/providers/DemoAuthProvider";

type ViewMode = "table" | "cards" | "map";

const mapBackendFeedJob = (j: any): FeedJob => ({
  id: j._id || j.id,
  title: j.title || "Service Job",
  description: j.description || "",
  category: j.category || "General",
  budget: j.budget || 0,
  distanceKm: j.distanceKm || 3.2,
  customerName: j.customerId?.name || "Verified Customer",
  status: j.status || "open",
  location: {
    address: j.location?.address || "Nearby Service Area",
    lat: j.location?.coordinates?.[1] || 23.8103,
    lng: j.location?.coordinates?.[0] || 90.4125,
  },
  photos: j.photos || [],
  createdAt: j.createdAt || new Date().toISOString(),
  updatedAt: j.updatedAt || new Date().toISOString(),
  bidCount: j.bidCount || 0,
});

function ProviderFeedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useDemoAuth();
  const { data: meRes } = useGetMeQuery(undefined);
  const me = unwrapOne<any>(meRes) || (meRes as any)?.data;
  const pendingOverride =
    searchParams.get("pending") === "1" || searchParams.get("pending") === "true";
  const approved = pendingOverride
    ? false
    : me?.isApproved !== undefined
      ? !!me.isApproved
      : true;
  const [view, setView] = useState<ViewMode>("cards");
  const [category, setCategory] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data: feedResponse,
    isLoading: feedLoading,
    isError: feedError,
    refetch: refetchFeed,
  } = useGetJobFeedQuery({
    radius: maxDistance,
    category: category !== "all" ? category.toLowerCase() : undefined,
  });
  const { data: bidsResponse } = useGetMyBidsQuery({ status: "accepted" });
  const { data: analyticsResponse } = useGetProviderAnalyticsQuery({});
  const analytics = analyticsResponse?.data as
    | {
        earnings?: { thisMonth?: number; total?: number; growthPercent?: number };
        bids?: { winRate?: number; pending?: number; accepted?: number };
        profile?: {
          trustScore?: number;
          avgResponseTime?: number;
          completionRate?: number;
        };
        reviews?: { average?: number; total?: number };
        jobs?: { completed?: number; inProgress?: number };
      }
    | undefined;

  const feedJobs: FeedJob[] = unwrapList(feedResponse).map(mapBackendFeedJob);

  const activeJobs = unwrapList(bidsResponse).map((b: any) => ({
    id: String(b.jobId?._id || b.jobId || b._id),
    title: b.jobId?.title || "Active job",
  }));

  const filtered = useMemo(() => {
    return feedJobs
      .filter((j) =>
        category === "all"
          ? true
          : j.category.toLowerCase() === category.toLowerCase(),
      )
      .filter((j) => (j.distanceKm || 0) <= maxDistance)
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [category, maxDistance, feedJobs]);

  const mapCenter = {
    lat: feedJobs[0]?.location?.lat || 23.7937,
    lng: feedJobs[0]?.location?.lng || 90.4043,
  };

  if (!approved) {
    return <PendingApproval />;
  }

  const pipeline = filtered.reduce((acc, j) => acc + j.budget, 0);
  const winRate = Number(analytics?.bids?.winRate) || 0;
  const monthEarnings = Number(analytics?.earnings?.thisMonth) || 0;
  const trustScore = Number(analytics?.profile?.trustScore) || 0;
  const avgResponse = Number(analytics?.profile?.avgResponseTime) || 0;
  const reviewAvg = Number(analytics?.reviews?.average) || 0;

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow={`${maxDistance} km search radius · ${user?.name?.split(" ")[0] || "Pro"}`}
        title="Nearby jobs"
        description="Fresh requests in your area. Bid fast, chat when accepted, get paid after approval."
        action={
          <div className="flex w-full shrink-0 rounded-full border border-border/80 bg-white p-1 shadow-sm sm:w-auto">
            {(
              [
                { id: "cards" as const, icon: LayoutGrid, label: "Cards" },
                { id: "map" as const, icon: MapIcon, label: "Map" },
                { id: "table" as const, icon: TableIcon, label: "Table" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setView(opt.id)}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-bold transition-all sm:flex-none sm:px-3.5",
                  view === opt.id
                    ? "bg-ink text-white shadow-sm"
                    : "text-stone-600 hover:text-ink",
                  opt.id === "table" && "hidden sm:inline-flex",
                )}
              >
                <opt.icon className="size-3.5" />
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
        <DashPanel tone="ink" className="md:col-span-2 animate-fade-up !p-5 sm:!p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/70 sm:text-xs">
                <span className="live-dot" />
                Active work
              </div>
              <h2 className="font-fraunces text-xl font-semibold sm:text-2xl md:text-3xl">
                {activeJobs.length} ongoing job
                {activeJobs.length === 1 ? "" : "s"}
              </h2>
              <p className="mt-1 text-[12px] text-white/65 sm:text-xs">
                {winRate > 0
                  ? `${winRate}% bid win rate · `
                  : ""}
                Funds are secured. Finish tasks and request sign-off for payouts.
              </p>
            </div>
            <div className="chip-rail scrollbar-none sm:flex sm:flex-wrap sm:overflow-visible">
              {activeJobs.slice(0, 4).map((job: { id: string; title: string }) => (
                <Link
                  key={job.id}
                  href={ROUTES.PROVIDER_ACTIVE(job.id)}
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-white/16"
                >
                  <span>
                    {job.title.length > 22
                      ? `${job.title.slice(0, 22)}…`
                      : job.title}
                  </span>
                  <ArrowRight className="size-3.5 text-brand" />
                </Link>
              ))}
              <Link
                href={ROUTES.PROVIDER_MESSAGES}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/12 bg-brand/90 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-brand"
              >
                Open chats
                <ArrowRight className="size-3.5" />
              </Link>
              <Link
                href={ROUTES.PROVIDER_MY_BIDS}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-white/16"
              >
                My bids
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </DashPanel>

        <DashStat
          index={1}
          label="This month earned"
          value={
            monthEarnings > 0
              ? formatCurrency(monthEarnings)
              : `${filtered.length} nearby`
          }
          hint={
            trustScore > 0
              ? `Trust ${Math.round(trustScore)}${reviewAvg ? ` · ★ ${reviewAvg.toFixed(1)}` : ""}`
              : `Pipeline ${formatCurrency(pipeline)}`
          }
          icon={<TrendingUp className="h-5 w-5" />}
          tone="emerald"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashStat
          index={0}
          label="Win rate"
          value={winRate > 0 ? `${winRate}%` : "—"}
          hint={`${analytics?.bids?.pending ?? 0} pending bids`}
          icon={<Zap className="h-5 w-5" />}
          tone="sky"
        />
        <DashStat
          index={1}
          label="Avg response"
          value={avgResponse > 0 ? `${avgResponse}m` : "—"}
          hint="Faster replies win more jobs"
          icon={<Navigation className="h-5 w-5" />}
          tone="amber"
        />
        <DashStat
          index={2}
          label="Completed jobs"
          value={analytics?.jobs?.completed ?? "—"}
          hint={
            analytics?.profile?.completionRate
              ? `${Math.round(Number(analytics.profile.completionRate))}% completion rate`
              : analytics?.jobs?.inProgress
                ? `${analytics.jobs.inProgress} in progress`
                : "Keep completion high"
          }
          icon={<Users className="h-5 w-5" />}
          tone="rose"
        />
      </div>

      <LeaderboardPulse title="Top pros this period" />

      <div className="flex flex-col gap-3 animate-fade-up hero-delay-1 md:flex-row md:items-center">
        <div className="chip-rail scrollbar-none flex-1">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={cn(
              "app-chip touch-target shrink-0 rounded-full px-4 py-2.5 text-xs font-bold border",
              category === "all"
                ? "bg-ink text-white border-ink shadow-sm"
                : "bg-white/70 text-warm border-border/80 hover:bg-white",
            )}
          >
            All ({feedJobs.length})
          </button>
          {JOB_CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "app-chip touch-target shrink-0 rounded-full px-4 py-2.5 text-xs font-bold border",
                category === c
                  ? "bg-brand text-white border-brand shadow-sm"
                  : "bg-white/70 text-warm border-border/80 hover:bg-white",
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="flex w-full shrink-0 items-center justify-between gap-2 rounded-full border border-border/80 bg-white px-4 py-3 text-xs font-bold text-warm shadow-sm md:w-auto md:justify-start md:py-2.5">
          <span className="whitespace-nowrap text-muted">Within</span>
          <select
            value={maxDistance}
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            className="cursor-pointer bg-transparent font-bold text-ink focus:outline-none"
          >
            <option value={2}>Within 2 km</option>
            <option value={5}>Within 5 km</option>
            <option value={10}>Within 10 km</option>
            <option value={15}>Within 15 km</option>
          </select>
        </label>
      </div>

      <ApiState
        isLoading={feedLoading}
        isError={feedError}
        isEmpty={!feedLoading && !feedError && filtered.length === 0 && view !== "map"}
        onRetry={() => void refetchFeed()}
        emptyIcon={<MapPin className="size-6 text-brand" />}
        emptyTitle="No jobs found within this range"
        emptyDescription="Try increasing your distance radius or switching categories to discover more jobs."
      >
      {view === "map" ? (
        <div className="animate-fade-up hero-delay-2 space-y-4">
          <FeedMap
            jobs={filtered}
            center={mapCenter}
            className="h-[440px] rounded-3xl overflow-hidden shadow-xs"
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          {selectedId && (
            <div>
              {filtered
                .filter((j) => j.id === selectedId)
                .map((job) => (
                  <FeedJobCard key={job.id} job={job} />
                ))}
            </div>
          )}
          {filtered.length === 0 && (
            <EmptyState
              icon={<MapPin className="size-6 text-brand" />}
              title="No jobs on the map"
              description="Widen your radius or change category."
            />
          )}
        </div>
      ) : view === "table" ? (
        <DashPanel className="animate-fade-up !p-0 overflow-hidden">
          <UseTable<FeedJob>
            data={filtered}
            hover
            striped
            onRowClick={(row) => router.push(ROUTES.PROVIDER_JOB(row.id))}
            columns={[
              {
                key: "title",
                title: "Job Title",
                render: (row) => (
                  <div className="py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-ink transition-colors hover:text-brand">
                        {row.title}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                        {row.category}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-muted">
                      {row.description}
                    </p>
                  </div>
                ),
              },
              {
                key: "location",
                title: "Location & Distance",
                render: (row) => (
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700">
                      <MapPin className="size-3 shrink-0 text-brand" />
                      <span className="max-w-[140px] truncate">{row.location.address}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-stone-500">
                      <Navigation className="size-2.5 text-brand" />
                      {formatDistance(row.distanceKm)} away
                    </span>
                  </div>
                ),
              },
              {
                key: "budget",
                title: "Budget",
                render: (row) => (
                  <span className="font-fraunces text-sm font-bold tabular-nums text-ink">
                    {formatCurrency(row.budget)}
                  </span>
                ),
              },
              {
                key: "bidCount",
                title: "Competition",
                render: (row) =>
                  row.bidCount > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
                      <Users className="size-3 text-amber-700" />
                      {row.bidCount} bid{row.bidCount === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                      <Zap className="size-3" />
                      Be 1st
                    </span>
                  ),
              },
              {
                key: "posted",
                title: "Posted",
                render: (row) => (
                  <span className="text-xs tabular-nums text-muted">
                    {formatRelativeTime(row.updatedAt)}
                  </span>
                ),
              },
              {
                key: "action",
                title: "",
                align: "right",
                render: () => (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:underline">
                    Submit Bid <ArrowRight className="size-3.5" />
                  </span>
                ),
              },
            ]}
          />
        </DashPanel>
      ) : (
        <div className="grid gap-4 md:gap-5 animate-fade-up">
          {filtered.map((job, i) => (
            <FeedJobCard key={job.id} job={job} index={i} />
          ))}
        </div>
      )}
      </ApiState>
    </div>
  );
}

export default function ProviderFeedPage() {
  return (
    <Suspense
      fallback={
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-3xl bg-stone-100" />
          <div className="h-48 rounded-3xl bg-stone-100" />
        </div>
      }
    >
      <ProviderFeedContent />
    </Suspense>
  );
}
