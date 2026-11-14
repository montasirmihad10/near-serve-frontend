"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AdminBadge from "@/components/admin/AdminBadge";
import { ROUTES } from "@/utils/navigation";
import { formatCurrency, formatDate } from "@/lib/customer/format";
import Avatar from "@/components/shared/app/Avatar";
import {
  mapAdminProvider,
  unwrapAdminData,
} from "@/lib/admin/mappers";
import {
  useGetProviderDetailsQuery,
  useToggleProviderApprovalMutation,
} from "@/redux/api/adminApi";

/* eslint-disable @typescript-eslint/no-explicit-any */

type PageProps = { params: Promise<{ id: string }> };

export default function AdminProviderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data, isLoading, isError, refetch } = useGetProviderDetailsQuery(id);
  const [toggleApproval, { isLoading: saving }] =
    useToggleProviderApprovalMutation();

  const payload = unwrapAdminData(data);
  const providerRaw = payload?.provider ?? payload;
  const provider = providerRaw?._id || providerRaw?.id
    ? mapAdminProvider(providerRaw)
    : null;
  const recentJobs: any[] = Array.isArray(payload?.recentJobs)
    ? payload.recentJobs
    : [];
  const reviews: any[] = Array.isArray(payload?.reviews) ? payload.reviews : [];

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted">
        Loading provider…
      </div>
    );
  }

  if (isError || !provider) {
    return (
      <div className="py-16 text-center">
        <p className="font-fraunces text-xl text-ink mb-2">Provider not found</p>
        <Link href={ROUTES.ADMIN_PROVIDERS} className="text-brand text-sm">
          Back to providers
        </Link>
      </div>
    );
  }

  const setApproval = async (approve: boolean) => {
    try {
      await toggleApproval({
        providerId: provider.id,
        type: approve ? "approve" : "reject",
        reason: approve ? undefined : "Revoked by admin",
      }).unwrap();
      toast.success(
        approve ? "Provider approved" : "Provider approval revoked",
      );
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update provider");
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        href={ROUTES.ADMIN_PROVIDERS}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Providers
      </Link>

      <div className="app-surface rounded-2xl p-6 animate-fade-up">
        <div className="flex items-start gap-4 mb-6">
          <Avatar name={provider.name} size="md" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-fraunces text-2xl font-semibold text-ink">
                {provider.name}
              </h1>
              {provider.isApproved ? (
                <AdminBadge label="Approved" tone="success" />
              ) : (
                <AdminBadge label="Pending" tone="warning" />
              )}
            </div>
            <p className="text-sm text-muted">{provider.email}</p>
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Phone
            </dt>
            <dd className="font-medium text-ink">{provider.phone}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              City
            </dt>
            <dd className="font-medium text-ink">{provider.city}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Categories
            </dt>
            <dd className="font-medium text-ink">
              {provider.categories.join(", ")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Member since
            </dt>
            <dd className="font-medium text-ink">
              {formatDate(provider.memberSince)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Rating
            </dt>
            <dd className="font-medium text-ink">
              {provider.isApproved ? provider.rating.toFixed(1) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Jobs completed
            </dt>
            <dd className="font-medium text-ink">{provider.jobsCompleted}</dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          {!provider.isApproved ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => void setApproval(true)}
              className="app-btn rounded-xl bg-brand text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
            >
              Approve provider
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void setApproval(false)}
              className="app-btn rounded-xl border border-border text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
            >
              Revoke approval
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="app-surface rounded-2xl p-5">
          <h2 className="font-fraunces text-lg font-semibold text-ink mb-3">
            Recent jobs
          </h2>
          <div className="space-y-2">
            {recentJobs.slice(0, 5).map((job) => (
              <Link
                key={job._id || job.id}
                href={ROUTES.ADMIN_JOB(String(job._id || job.id))}
                className="block rounded-xl bg-cream/70 px-3 py-2.5 hover:bg-cream"
              >
                <p className="text-sm font-semibold text-ink">{job.title}</p>
                <p className="text-xs text-muted">
                  {job.status} · {formatCurrency(Number(job.budget) || 0)}
                </p>
              </Link>
            ))}
            {recentJobs.length === 0 && (
              <p className="text-sm text-muted py-4 text-center">No jobs yet.</p>
            )}
          </div>
        </div>

        <div className="app-surface rounded-2xl p-5">
          <h2 className="font-fraunces text-lg font-semibold text-ink mb-3">
            Recent reviews
          </h2>
          <div className="space-y-2">
            {reviews.slice(0, 5).map((review) => (
              <div
                key={review._id || review.id}
                className="rounded-xl bg-cream/70 px-3 py-2.5"
              >
                <p className="text-sm font-semibold text-ink">
                  {review.rating}/5 · {review.customerId?.name || "Customer"}
                </p>
                <p className="text-xs text-muted line-clamp-2">
                  {review.comment || "No comment"}
                </p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-muted py-4 text-center">
                No reviews yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
