"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AdminBadge from "@/components/admin/AdminBadge";
import { ROUTES } from "@/utils/navigation";
import { formatCurrency, formatDate } from "@/lib/customer/format";
import Avatar from "@/components/shared/app/Avatar";
import { mapAdminUser, unwrapAdminData } from "@/lib/admin/mappers";
import {
  useGetUserDetailsQuery,
  useToggleUserBlockStatusMutation,
} from "@/redux/api/adminApi";

/* eslint-disable @typescript-eslint/no-explicit-any */

type PageProps = { params: Promise<{ id: string }> };

export default function AdminUserDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data, isLoading, isError, refetch } = useGetUserDetailsQuery(id);
  const [toggleBlock, { isLoading: saving }] =
    useToggleUserBlockStatusMutation();

  const payload = unwrapAdminData(data);
  const userRaw = payload?.user ?? payload;
  const user =
    userRaw?._id || userRaw?.id ? mapAdminUser(userRaw) : null;
  const recentJobs: any[] = Array.isArray(payload?.recentJobs)
    ? payload.recentJobs
    : [];
  const recentPayments: any[] = Array.isArray(payload?.recentPayments)
    ? payload.recentPayments
    : [];

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted">Loading user…</div>
    );
  }

  if (isError || !user) {
    return (
      <div className="py-16 text-center">
        <p className="font-fraunces text-xl text-ink mb-2">User not found</p>
        <Link href={ROUTES.ADMIN_USERS} className="text-brand text-sm">
          Back to users
        </Link>
      </div>
    );
  }

  const toggle = async () => {
    try {
      await toggleBlock({
        userId: user.id,
        type: user.isBlocked ? "unblock" : "block",
        reason: user.isBlocked ? undefined : "Blocked by admin",
      }).unwrap();
      toast.success(user.isBlocked ? "User unblocked" : "User blocked");
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not update user");
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        href={ROUTES.ADMIN_USERS}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Users
      </Link>

      <div className="app-surface rounded-2xl p-6 animate-fade-up">
        <div className="flex items-start gap-4 mb-6">
          <Avatar name={user.name} size="md" />
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-fraunces text-2xl font-semibold text-ink">
                {user.name}
              </h1>
              <AdminBadge label={user.role} tone="info" />
              {user.isBlocked ? (
                <AdminBadge label="Blocked" tone="danger" />
              ) : (
                <AdminBadge label="Active" tone="success" />
              )}
            </div>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Recent jobs
            </dt>
            <dd className="font-medium text-ink">{recentJobs.length}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Joined
            </dt>
            <dd className="font-medium text-ink">
              {formatDate(user.createdAt)}
            </dd>
          </div>
        </dl>

        {user.role !== "admin" && (
          <button
            type="button"
            disabled={saving}
            onClick={() => void toggle()}
            className="app-btn rounded-xl bg-ink text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
          >
            {user.isBlocked ? "Unblock user" : "Block user"}
          </button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="app-surface rounded-2xl p-5">
          <h2 className="font-fraunces text-lg font-semibold text-ink mb-3">
            Recent jobs
          </h2>
          <div className="space-y-2">
            {recentJobs.map((job) => (
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
            Recent payments
          </h2>
          <div className="space-y-2">
            {recentPayments.map((payment) => (
              <div
                key={payment._id || payment.id}
                className="rounded-xl bg-cream/70 px-3 py-2.5"
              >
                <p className="text-sm font-semibold text-ink">
                  {formatCurrency(Number(payment.amount) || 0)}
                </p>
                <p className="text-xs text-muted">{payment.status}</p>
              </div>
            ))}
            {recentPayments.length === 0 && (
              <p className="text-sm text-muted py-4 text-center">
                No payments yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
