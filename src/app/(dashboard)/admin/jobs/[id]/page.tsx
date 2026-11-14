"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AdminBadge from "@/components/admin/AdminBadge";
import { ROUTES } from "@/utils/navigation";
import {
  formatCurrency,
  formatDate,
  JOB_STATUS_LABELS,
} from "@/lib/customer/format";
import type { JobStatus } from "@/types/job";
import {
  mapAdminJob,
  mapAdminPayment,
  unwrapAdminData,
} from "@/lib/admin/mappers";
import {
  useAdminCancelJobMutation,
  useAdminGetJobDetailsQuery,
} from "@/redux/api/adminApi";

/* eslint-disable @typescript-eslint/no-explicit-any */

type PageProps = { params: Promise<{ id: string }> };

export default function AdminJobDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data, isLoading, isError, refetch } = useAdminGetJobDetailsQuery(id);
  const [cancelJobMutation, { isLoading: cancelling }] =
    useAdminCancelJobMutation();

  const payload = unwrapAdminData(data);
  const jobRaw = payload?.job ?? payload;
  const job = jobRaw?._id || jobRaw?.id ? mapAdminJob(jobRaw) : null;
  const bids: any[] = Array.isArray(payload?.bids) ? payload.bids : [];
  const paymentRaw = payload?.payment;
  const payment = paymentRaw?._id || paymentRaw?.id
    ? mapAdminPayment(paymentRaw)
    : null;

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted">Loading job…</div>
    );
  }

  if (isError || !job) {
    return (
      <div className="py-16 text-center">
        <p className="font-fraunces text-xl text-ink mb-2">Job not found</p>
        <Link href={ROUTES.ADMIN_JOBS} className="text-brand text-sm">
          Back to jobs
        </Link>
      </div>
    );
  }

  const cancel = async () => {
    try {
      await cancelJobMutation({
        jobId: job.id,
        reason: "Cancelled by admin from job detail",
      }).unwrap();
      toast.success("Job cancelled by admin");
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not cancel job");
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        href={ROUTES.ADMIN_JOBS}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Jobs
      </Link>

      <div className="app-surface rounded-2xl p-6 animate-fade-up">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <AdminBadge
            label={
              job.status === "cancelled"
                ? "Cancelled"
                : JOB_STATUS_LABELS[job.status as JobStatus] || job.status
            }
            tone={
              job.status === "cancelled" || job.status === "disputed"
                ? "danger"
                : job.status === "completed"
                  ? "success"
                  : "info"
            }
          />
          <span className="text-xs text-muted">{job.category}</span>
        </div>
        <h1 className="font-fraunces text-2xl font-semibold text-ink mb-6">
          {job.title}
        </h1>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Customer
            </dt>
            <dd className="font-medium text-ink">{job.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Provider
            </dt>
            <dd className="font-medium text-ink">
              {job.providerName ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Budget
            </dt>
            <dd className="font-medium text-ink">
              {formatCurrency(job.budget)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Posted
            </dt>
            <dd className="font-medium text-ink">
              {formatDate(job.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              City
            </dt>
            <dd className="font-medium text-ink">{job.city}</dd>
          </div>
          {payment && (
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted mb-1">
                Escrow
              </dt>
              <dd className="font-medium text-ink">
                {formatCurrency(payment.amount)} · {payment.status}
              </dd>
            </div>
          )}
        </dl>

        <div className="flex flex-wrap items-center gap-3">
          {job.status !== "cancelled" && job.status !== "completed" && (
            <button
              type="button"
              disabled={cancelling}
              onClick={() => void cancel()}
              className="app-btn rounded-xl bg-[#8b1a1a] text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
            >
              Cancel job
            </button>
          )}

          {job.status === "disputed" && (
            <Link
              href={ROUTES.ADMIN_DISPUTE(job.id)}
              className="text-sm font-semibold text-brand"
            >
              Open dispute →
            </Link>
          )}

          {payment && (
            <Link
              href={ROUTES.ADMIN_PAYMENT(payment.id)}
              className="text-sm font-semibold text-brand"
            >
              View payment →
            </Link>
          )}
        </div>
      </div>

      <div className="app-surface rounded-2xl p-5">
        <h2 className="font-fraunces text-lg font-semibold text-ink mb-3">
          Bids ({bids.length})
        </h2>
        <div className="space-y-2">
          {bids.map((bid) => {
            const providerName =
              bid.providerId?.userId?.name ||
              bid.providerId?.name ||
              "Provider";
            return (
              <div
                key={bid._id || bid.id}
                className="rounded-xl bg-cream/70 px-3 py-2.5 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{providerName}</p>
                  <p className="text-xs text-muted line-clamp-1">
                    {bid.message || "No message"}
                  </p>
                </div>
                <p className="text-sm font-bold tabular-nums text-ink">
                  {formatCurrency(Number(bid.price) || 0)}
                </p>
              </div>
            );
          })}
          {bids.length === 0 && (
            <p className="text-sm text-muted py-4 text-center">No bids yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
