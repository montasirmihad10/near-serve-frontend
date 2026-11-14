"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  MessageSquare,
  Navigation,
  Check,
  Play,
  ArrowRight,
  Flag,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistance } from "@/lib/marketplace/constants";
import JobMap from "@/components/customer/JobMap";
import StatusChip from "@/components/customer/StatusChip";
import {
  formatCurrency,
  formatDateTime,
  JOB_STATUS_LABELS,
} from "@/lib/customer/format";
import type { JobStatus } from "@/types/job";
import { ROUTES } from "@/utils/navigation";
import { cn } from "@/lib/utils";
import Avatar from "@/components/shared/app/Avatar";
import ApiState from "@/components/shared/app/ApiState";
import { useGetJobByIdQuery, useUpdateJobStatusMutation } from "@/redux/api/jobApi";
import { useGetConversationByJobIdQuery } from "@/redux/api/conversationApi";
import { mapConversation, unwrapOne } from "@/lib/chat/mappers";
import { useGetMeQuery } from "@/redux/api/userApi";
import { useSocket } from "@/components/providers/SocketProvider";

const TIMELINE: JobStatus[] = ["booked", "in_progress", "completed"];

type PageProps = {
  params: Promise<{ jobId: string }>;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapJob(item: any) {
  return {
    id: item._id || item.id,
    title: item.title || "Untitled Job",
    description: item.description || "",
    category: item.category || "service",
    budget: item.budget || 0,
    status: (item.status || "booked") as JobStatus,
    location: {
      address: item.location?.address || "Service Location",
      lat: item.location?.coordinates?.[1] || 23.81,
      lng: item.location?.coordinates?.[0] || 90.41,
    },
    distanceKm: item.distanceKm || 2.4,
    customerName: item.customerId?.name || "Customer",
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || new Date().toISOString(),
  };
}

export default function ActiveJobPage({ params }: PageProps) {
  const { jobId } = use(params);
  const { socket } = useSocket();
  const {
    data: jobRes,
    isLoading,
    isError,
    refetch,
  } = useGetJobByIdQuery(jobId);
  const { data: meRes } = useGetMeQuery(undefined);
  const me = unwrapOne(meRes) || meRes?.data || meRes;
  const myUserId = String(me?._id || me?.id || "");
  const { data: convRes } = useGetConversationByJobIdQuery(jobId);
  const [updateStatus] = useUpdateJobStatusMutation();

  const rawJob = unwrapOne(jobRes) || jobRes?.data || jobRes;
  const job = rawJob?._id || rawJob?.id ? mapJob(rawJob) : null;
  const rawConv = unwrapOne(convRes);
  const conversation = rawConv
    ? mapConversation(rawConv, myUserId, "provider")
    : null;

  const [status, setStatus] = useState<JobStatus | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (job?.status) setStatus(job.status);
  }, [job?.status]);

  useEffect(() => {
    if (!socket || !sharing || !jobId) return;
    const id = window.setInterval(() => {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition((pos) => {
        socket.emit("provider_location_update", {
          jobId,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      });
    }, 8000);
    return () => {
      window.clearInterval(id);
      socket.emit("provider_location_stop", { jobId });
    };
  }, [socket, sharing, jobId]);

  if (isLoading || isError || !job) {
    return (
      <div className="py-10">
        <ApiState
          isLoading={isLoading}
          isError={isError || (!isLoading && !job)}
          onRetry={() => void refetch()}
          errorMessage="Could not load this active job."
          emptyTitle="Active job not found"
          emptyDescription="It may have been cancelled or completed."
          isEmpty={!isLoading && !isError && !job}
        >
          <Link href={ROUTES.PROVIDER_HOME} className="text-sm font-medium text-brand">
            Back to feed
          </Link>
        </ApiState>
      </div>
    );
  }

  const currentStatus = status ?? job.status;
  const statusIndex = Math.max(
    0,
    TIMELINE.indexOf(currentStatus as (typeof TIMELINE)[number]),
  );

  const chatHref = conversation
    ? `${ROUTES.PROVIDER_MESSAGES}?id=${conversation.id}`
    : ROUTES.PROVIDER_MESSAGES;

  const startJob = async () => {
    try {
      await updateStatus({ jobId, status: "in_progress" }).unwrap();
      setStatus("in_progress");
      setSharing(true);
      toast.success("Job marked in progress", {
        description: "Live location sharing is on for the customer.",
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update status");
    }
  };

  const completeJob = async () => {
    try {
      await updateStatus({ jobId, status: "completed" }).unwrap();
      setStatus("completed");
      setSharing(false);
      toast.success("Marked complete", {
        description:
          "Customer was notified — they review the work, then release protected payment.",
        action: {
          label: "Open chat",
          onClick: () => {
            window.location.href = chatHref;
          },
        },
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not complete job");
    }
  };

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <Link
          href={ROUTES.PROVIDER_HOME}
          className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Job feed
        </Link>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusChip status={currentStatus} />
          <span className="rounded-full border border-border bg-white/70 px-2.5 py-0.5 text-xs text-muted">
            {job.category}
          </span>
        </div>
        <h1 className="max-w-xl font-fraunces text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
          {job.title}
        </h1>
        <p className="mt-3 max-w-xl leading-relaxed text-muted">
          {job.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-warm">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-brand" />
            {job.location.address}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Navigation className="size-3.5 text-brand" />
            {formatDistance(job.distanceKm)} away
          </span>
          <span className="font-semibold tabular-nums text-ink">
            {formatCurrency(job.budget)}
          </span>
        </div>
      </div>

      <section className="animate-fade-up rounded-2xl border border-brand/20 bg-gradient-to-br from-white to-brand/[0.04] p-5 shadow-[0_8px_32px_rgba(199,10,36,0.08)] md:p-6">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
          Active job controls
        </p>
        <h2 className="mb-4 font-fraunces text-xl font-semibold text-ink">
          Keep the customer updated
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {currentStatus === "booked" && (
            <button
              type="button"
              onClick={() => void startJob()}
              className="app-btn flex items-center justify-between gap-3 rounded-xl bg-brand px-4 py-3.5 text-left text-sm font-semibold text-white shadow-[0_4px_16px_rgba(199,10,36,0.25)] hover:bg-brand-dark"
            >
              <span className="inline-flex items-center gap-2">
                <Play className="size-4" />
                Start job & share location
              </span>
              <ArrowRight className="size-4 shrink-0" />
            </button>
          )}
          {currentStatus === "in_progress" && (
            <button
              type="button"
              onClick={() => void completeJob()}
              className="app-btn flex items-center justify-between gap-3 rounded-xl bg-ink px-4 py-3.5 text-left text-sm font-semibold text-white hover:bg-ink/90"
            >
              <span className="inline-flex items-center gap-2">
                <Flag className="size-4" />
                Mark complete — request approval
              </span>
              <ArrowRight className="size-4 shrink-0" />
            </button>
          )}
          <Link
            href={chatHref}
            className="app-btn flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-ink ring-1 ring-border hover:bg-cream"
          >
            <span className="inline-flex items-center gap-2">
              <MessageSquare className="size-4 text-brand" />
              Open job chat
            </span>
            <ArrowRight className="size-4 shrink-0" />
          </Link>
        </div>
        {sharing && (
          <p className="mt-3 text-xs font-medium text-emerald-800">
            Live location is sharing to the customer every few seconds.
          </p>
        )}
      </section>

      <section className="app-surface animate-fade-up rounded-2xl p-5 md:p-6">
        <h2 className="mb-5 font-fraunces text-lg font-semibold text-ink">
          Job progress
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
          {TIMELINE.map((step, i) => {
            const done = i <= statusIndex;
            const current = i === statusIndex;
            return (
              <div
                key={step}
                className="flex items-center gap-3 sm:flex-1 sm:gap-0"
              >
                <div className="flex items-center gap-2 sm:flex-1 sm:flex-col sm:gap-1.5">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                      done
                        ? "border-brand bg-brand text-white"
                        : "border-border bg-cream text-muted",
                      current && "ring-4 ring-brand/15",
                    )}
                  >
                    {done ? <Check className="size-3.5" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium sm:text-center",
                      done ? "text-ink" : "text-muted",
                    )}
                  >
                    {JOB_STATUS_LABELS[step]}
                  </span>
                </div>
                {i < TIMELINE.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 hidden h-0.5 flex-1 rounded-full sm:block",
                      i < statusIndex ? "bg-brand" : "bg-border",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="animate-fade-up space-y-6 lg:col-span-3">
          <section>
            <h2 className="mb-3 font-fraunces text-lg font-semibold text-ink">
              Job location
            </h2>
            <JobMap
              lat={job.location.lat}
              lng={job.location.lng}
              label={job.location.address}
              className="h-[280px]"
              showProviderEnRoute={currentStatus === "in_progress"}
            />
          </section>
        </div>

        <aside className="animate-fade-up space-y-4 lg:col-span-2">
          <div className="app-surface flex items-center gap-3 rounded-2xl p-4">
            <Avatar name={job.customerName} size="sm" />
            <div>
              <p className="mb-0.5 text-xs uppercase tracking-wider text-muted">
                Customer
              </p>
              <p className="font-semibold text-ink">{job.customerName}</p>
            </div>
          </div>

          <Link
            href={chatHref}
            className="app-surface app-surface-hover flex items-center gap-3 rounded-2xl p-4"
          >
            <div className="flex size-10 items-center justify-center rounded-full border border-border bg-cream text-brand">
              <MessageSquare className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">
                Chat with {conversation?.participant.name || job.customerName}
              </p>
              <p className="truncate text-xs text-muted">
                {conversation?.lastMessage ||
                  "Coordinate access, timing, and completion photos."}
              </p>
            </div>
          </Link>

          <div className="rounded-2xl bg-cream/70 px-4 py-3 text-xs text-muted">
            Updated {formatDateTime(job.updatedAt)}
          </div>
        </aside>
      </div>
    </div>
  );
}
