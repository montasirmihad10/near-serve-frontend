"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Briefcase, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  ArrowRight, 
  Table as TableIcon, 
  LayoutGrid 
} from "lucide-react";
import JobCard from "@/components/customer/JobCard";
import type { Job, JobStatus } from "@/types/job";
import { JOB_STATUS_LABELS, formatCurrency, formatRelativeTime } from "@/lib/customer/format";
import { ROUTES } from "@/utils/navigation";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/app/PageHeader";
import EmptyState from "@/components/shared/app/EmptyState";
import ApiState from "@/components/shared/app/ApiState";
import DashStat from "@/components/shared/app/DashStat";
import DashPanel from "@/components/shared/app/DashPanel";
import UseTable from "@/components/ui/UseTable";
import StatusChip from "@/components/customer/StatusChip";
import { useGetMyJobsQuery } from "@/redux/api/jobApi";
import { useGetCustomerAnalyticsQuery } from "@/redux/api/analyticsApi";
import { useDemoAuth } from "@/components/providers/DemoAuthProvider";
import LeaderboardPulse from "@/components/shared/app/LeaderboardPulse";
import { unwrapList } from "@/lib/api/rows";

const FILTERS: Array<"all" | JobStatus> = [
  "all",
  "open",
  "bidding",
  "booked",
  "in_progress",
  "completed",
  "disputed",
];

const mapBackendJob = (item: any): Job => ({
  id: item._id || item.id,
  title: item.title || "Untitled Job",
  description: item.description || "",
  category: item.category || "service",
  budget: item.budget || 0,
  status: item.status || "open",
  location: {
    address: item.location?.address || "Service Location",
    lat: item.location?.coordinates?.[1] || 37.7649,
    lng: item.location?.coordinates?.[0] || -122.4214,
  },
  photos: item.photos || [],
  createdAt: item.createdAt || new Date().toISOString(),
  updatedAt: item.updatedAt || new Date().toISOString(),
  providerName: item.selectedProvider?.userId?.name || item.providerName,
  providerId: item.selectedProvider?._id || item.selectedProvider,
  acceptedBidId: item.selectedBid?._id || item.selectedBid,
  bidCount: item.bidCount || 0,
});

export default function CustomerJobsPage() {
  const router = useRouter();
  const { user } = useDemoAuth();
  const [filter, setFilter] = useState<"all" | JobStatus>("all");
  // Cards first — table is desktop-friendly; auto-prefer grid on small screens via CSS hide
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");

  const { data: analyticsResponse } = useGetCustomerAnalyticsQuery({});
  const {
    data: jobsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetMyJobsQuery(filter !== "all" ? { status: filter } : {});

  const jobs: Job[] = unwrapList(jobsResponse).map(mapBackendJob);

  const filtered =
    filter === "all"
      ? jobs
      : jobs.filter((j) => j.status === filter);

  const customerStats = analyticsResponse?.data;
  const activeCount = customerStats?.activeJobs ?? jobs.filter((j) => j.status === "open" || j.status === "bidding" || j.status === "in_progress").length;
  const inProgressCount = jobs.filter((j) => j.status === "in_progress" || j.status === "booked").length;
  const completedCount = customerStats?.completedJobs ?? jobs.filter((j) => j.status === "completed").length;
  const totalSpent = Number(customerStats?.totalSpent) || 0;
  const needsBidReview = jobs.filter((j) => j.status === "bidding" || j.status === "open");
  const needsApproval = jobs.filter((j) => j.status === "in_progress");
  const readyToReview = jobs.filter((j) => j.status === "completed").slice(0, 3);
  const firstName = (user?.name ?? "there").split(" ")[0];

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Hire with confidence"
        title="My jobs"
        description="Compare bids, chat with pros, and release payment only when you’re happy."
        action={
          <Link
            href={ROUTES.CUSTOMER_POST_JOB}
            className="app-btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(199,10,36,0.25)] hover:bg-brand-dark sm:w-auto"
          >
            <Plus className="size-4" />
            Post a job
          </Link>
        }
      />

      <DashPanel tone="ink" className="animate-fade-up !p-5 sm:!p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/55 sm:text-xs">
              Welcome back, {firstName}
            </p>
            <h2 className="mt-1 font-fraunces text-xl font-semibold leading-snug sm:text-2xl md:text-3xl">
              {needsApproval.length > 0
                ? `${needsApproval.length} job${needsApproval.length === 1 ? "" : "s"} waiting for your approval`
                : needsBidReview.length > 0
                  ? `${needsBidReview.length} request${needsBidReview.length === 1 ? "" : "s"} collecting bids`
                  : activeCount > 0
                    ? `${activeCount} job${activeCount === 1 ? "" : "s"} need your attention`
                    : "Ready to get something fixed?"}
            </h2>
            <p className="mt-2 max-w-lg text-[13px] text-white/65 sm:text-sm">
              Post in plain words, compare verified bids, and pay only after you approve the work.
              {totalSpent > 0 ? ` You've released ${formatCurrency(totalSpent)} safely so far.` : ""}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-stretch">
            <Link
              href={
                needsApproval[0]
                  ? ROUTES.CUSTOMER_JOB(needsApproval[0].id)
                  : needsBidReview[0]
                    ? ROUTES.CUSTOMER_JOB(needsBidReview[0].id)
                    : ROUTES.CUSTOMER_POST_JOB
              }
              className="app-btn inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-bold text-ink hover:bg-cream"
            >
              {needsApproval[0]
                ? "Review completion"
                : needsBidReview[0]
                  ? "Compare bids"
                  : "New request"}
              <ArrowRight className="size-4" />
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={ROUTES.CUSTOMER_MESSAGES}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/16"
              >
                <MessageSquare className="size-3.5" />
                Messages
              </Link>
              <Link
                href={ROUTES.CUSTOMER_PAYMENTS}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/16"
              >
                Payments
              </Link>
            </div>
          </div>
        </div>
      </DashPanel>

      {(needsApproval.length > 0 ||
        needsBidReview.length > 0 ||
        readyToReview.length > 0) && (
        <div className="chip-rail md:grid md:grid-cols-3 md:gap-3 md:overflow-visible">
          {needsApproval.slice(0, 2).map((job) => (
            <Link
              key={`approve-${job.id}`}
              href={ROUTES.CUSTOMER_JOB(job.id)}
              className="min-w-[78%] shrink-0 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 transition-colors hover:bg-emerald-100 active:scale-[0.99] sm:min-w-[240px] md:min-w-0"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Approve & release
              </p>
              <p className="mt-1 text-sm font-bold text-ink line-clamp-1">
                {job.title}
              </p>
            </Link>
          ))}
          {needsBidReview.slice(0, 2).map((job) => (
            <Link
              key={`bids-${job.id}`}
              href={ROUTES.CUSTOMER_JOB(job.id)}
              className="min-w-[78%] shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 transition-colors hover:bg-amber-100 active:scale-[0.99] sm:min-w-[240px] md:min-w-0"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Bids waiting
              </p>
              <p className="mt-1 text-sm font-bold text-ink line-clamp-1">
                {job.title}
              </p>
            </Link>
          ))}
          {readyToReview.slice(0, 1).map((job) => (
            <Link
              key={`review-${job.id}`}
              href={ROUTES.CUSTOMER_JOB(job.id)}
              className="min-w-[78%] shrink-0 rounded-2xl border border-border bg-white px-4 py-3.5 transition-colors hover:bg-cream active:scale-[0.99] sm:min-w-[240px] md:min-w-0"
            >
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                Leave a review
              </p>
              <p className="mt-1 text-sm font-bold text-ink line-clamp-1">
                {job.title}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3 sm:gap-4">
        <DashStat
          index={0}
          label="Active requests"
          value={activeCount}
          icon={<Briefcase className="h-5 w-5" />}
          tone="brand"
        />
        <DashStat
          index={1}
          label="In progress"
          value={inProgressCount}
          icon={<Clock className="h-5 w-5" />}
          tone="amber"
        />
        <DashStat
          index={2}
          label="Completed"
          value={completedCount}
          hint={totalSpent > 0 ? `Spent ${formatCurrency(totalSpent)}` : undefined}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="emerald"
        />
      </div>

      <LeaderboardPulse title="Trusted pros near you" />

      <div className="flex flex-col gap-3 animate-fade-up hero-delay-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="chip-rail scrollbar-none flex-1">
          {FILTERS.map((f) => {
            const count = f === "all" ? jobs.length : jobs.filter((j) => j.status === f).length;
            const active = filter === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "app-chip touch-target shrink-0 rounded-full px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 border",
                  active
                    ? "bg-ink text-white border-ink shadow-sm"
                    : "bg-white/70 text-warm border-border/80 hover:bg-white",
                )}
              >
                <span>{f === "all" ? "All" : JOB_STATUS_LABELS[f]}</span>
                <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full", active ? "bg-white/20 text-white" : "bg-cream text-muted")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden shrink-0 rounded-full border border-border/80 bg-white p-1 shadow-sm md:flex">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all",
              viewMode === "grid"
                ? "bg-ink text-white shadow-sm"
                : "text-stone-600 hover:text-ink",
            )}
            title="Card View"
          >
            <LayoutGrid className="size-3.5" />
            Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all",
              viewMode === "table"
                ? "bg-ink text-white shadow-sm"
                : "text-stone-600 hover:text-ink",
            )}
            title="Table View"
          >
            <TableIcon className="size-3.5" />
            Table
          </button>
        </div>
      </div>

      <ApiState
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && filtered.length === 0}
        onRetry={() => void refetch()}
        emptyIcon={<Briefcase className="size-6 text-brand" />}
        emptyTitle="No jobs found"
        emptyDescription="You don't have any jobs matching this filter. Post a new request to get competitive bids from local pros."
        emptyAction={
          <Link
            href={ROUTES.CUSTOMER_POST_JOB}
            className="app-btn inline-flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-dark"
          >
            <Plus className="size-4" />
            Post your first job
          </Link>
        }
      >
      {viewMode === "table" ? (
        <DashPanel className="animate-fade-up !p-0 overflow-hidden">
          <UseTable<Job>
            data={filtered}
            hover
            striped
            onRowClick={(row) => router.push(ROUTES.CUSTOMER_JOB(row.id))}
            columns={[
              {
                key: "title",
                title: "Job Details",
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
                title: "Location",
                render: (row) => (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700">
                    <MapPin className="size-3.5 shrink-0 text-brand" />
                    <span className="max-w-[160px] truncate">{row.location.address}</span>
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
                key: "bids",
                title: "Bids",
                render: (row) =>
                  row.bidCount > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                      <MessageSquare className="size-3 text-emerald-600" />
                      {row.bidCount} bid{row.bidCount === 1 ? "" : "s"}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">Awaiting bids</span>
                  ),
              },
              {
                key: "status",
                title: "Status",
                render: (row) => <StatusChip status={row.status} />,
              },
              {
                key: "updatedAt",
                title: "Activity",
                align: "right",
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
                    View <ArrowRight className="size-3.5" />
                  </span>
                ),
              },
            ]}
          />
        </DashPanel>
      ) : (
        <div className="grid gap-4 md:gap-5">
          {filtered.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} />
          ))}
        </div>
      )}
      </ApiState>
    </div>
  );
}
