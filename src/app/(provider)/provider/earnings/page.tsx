"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, Landmark, Clock, DollarSign } from "lucide-react";
import { EarningStatusChip } from "@/components/provider/ProviderChips";
import UseTable from "@/components/ui/UseTable";
import { formatCurrency, formatDate } from "@/lib/customer/format";
import PageHeader from "@/components/shared/app/PageHeader";
import ApiState from "@/components/shared/app/ApiState";
import { ROUTES } from "@/utils/navigation";
import type { Earning } from "@/types/job";
import { useGetPaymentHistoryQuery } from "@/redux/api/paymentApi";
import { useGetMeQuery } from "@/redux/api/userApi";
import { unwrapList, unwrapOne } from "@/lib/api/rows";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapEarning(raw: any): Earning {
  const job = raw.jobId;
  const status =
    raw.status === "captured"
      ? "paid"
      : raw.status === "authorized"
        ? "held"
        : raw.status === "pending"
          ? "pending"
          : "pending";
  return {
    id: String(raw._id || raw.id),
    jobId: String(job?._id || job || raw.jobId || ""),
    jobTitle: job?.title || raw.jobTitle || "Service job",
    customerName:
      job?.customerId?.name || raw.customerName || "Customer",
    amount: Number(raw.providerPayout ?? raw.amount) || 0,
    status: status as Earning["status"],
    completedAt:
      raw.capturedAt || raw.updatedAt || raw.createdAt || new Date().toISOString(),
  };
}

export default function ProviderEarningsPage() {
  const router = useRouter();
  const { data: meRes } = useGetMeQuery(undefined);
  const me = unwrapOne<any>(meRes) || (meRes as any)?.data;
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useGetPaymentHistoryQuery({ sort: "-createdAt", limit: 50 });

  const earnings = unwrapList(data).map(mapEarning);
  const ready =
    me?.stripeAccountStatus === "active" ||
    me?.localPayout?.acceptsBkash ||
    me?.localPayout?.acceptsNagad ||
    me?.localPayout?.acceptsCod;

  const paid = earnings
    .filter((e) => e.status === "paid")
    .reduce((sum, e) => sum + e.amount, 0);
  const waiting = earnings
    .filter((e) => e.status === "held" || e.status === "pending")
    .reduce((sum, e) => sum + e.amount, 0);

  const payoutLabel = me?.localPayout?.bkashNumber
    ? `bKash ···· ${String(me.localPayout.bkashNumber).slice(-4)}`
    : me?.stripeAccountId
      ? "Stripe Connect"
      : "Local payout methods";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Financial Overview"
        title="My earnings"
        description="Track your completed payouts and pre-funded job earnings."
        action={
          <Link
            href={ROUTES.PROVIDER_PAYOUTS}
            className="inline-flex items-center gap-2 rounded-2xl bg-stone-100 hover:bg-stone-200 px-5 py-3 text-xs font-bold text-ink transition-all shadow-xs shrink-0"
          >
            <Landmark className="size-4 text-brand" />
            <span>Payout Settings</span>
          </Link>
        }
      />

      {!ready && (
        <div className="rounded-3xl bg-amber-50 border border-amber-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up shadow-xs">
          <div>
            <p className="font-bold text-ink text-sm">
              Connect Your Bank or Mobile Wallet for Payouts
            </p>
            <p className="text-xs text-muted mt-0.5 font-medium">
              Link your payout account so funds transfer directly when jobs are approved.
            </p>
          </div>
          <Link
            href={`${ROUTES.PROVIDER_PAYOUTS}?stripe=setup`}
            className="rounded-2xl bg-brand text-white text-xs font-bold px-5 py-3 hover:bg-brand-dark transition-all shadow-xs shrink-0"
          >
            Configure Payouts →
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4 animate-fade-up hero-delay-1">
        <div className="rounded-3xl bg-ink text-white p-6 relative overflow-hidden shadow-lg flex flex-col justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(199,10,36,0.45)_0%,transparent_60%)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-wider mb-2">
              <Wallet className="size-3.5 text-emerald-400" />
              <span>Total Paid Out</span>
            </div>
            <p className="font-fraunces text-3xl md:text-4xl font-bold tabular-nums">
              {formatCurrency(paid)}
            </p>
            <p className="text-xs text-white/60 mt-2 font-medium">
              Transferred to: {payoutLabel}
            </p>
          </div>
        </div>

        <div className="bg-stone-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase tracking-wider mb-2">
              <Clock className="size-3.5 text-amber-600" />
              <span>Pending Customer Approval</span>
            </div>
            <p className="font-fraunces text-3xl md:text-4xl font-bold text-ink tabular-nums">
              {formatCurrency(waiting)}
            </p>
          </div>
          <p className="text-xs text-muted font-medium mt-2">
            Protected in safe hold. Releases automatically once customer approves completion.
          </p>
        </div>
      </div>

      <div className="bg-stone-100 rounded-3xl p-6 shadow-xs animate-fade-up hero-delay-2">
        <div className="mb-4">
          <h2 className="font-fraunces text-xl font-bold text-ink">
            Payout History
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Click any row to inspect active job progress or chat with the customer.
          </p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-xs">
          <ApiState
            isLoading={isLoading}
            isError={isError}
            onRetry={() => void refetch()}
            isEmpty={!earnings.length}
            emptyTitle="No earnings yet"
            emptyDescription="Accepted jobs with payments will show here."
            emptyIcon={<DollarSign className="size-8 text-muted" />}
          >
            <UseTable<Earning>
              data={earnings}
              emptyText="No completed earnings yet. Bid on available jobs to get started."
              hover
              striped
              onRowClick={(row) => router.push(ROUTES.PROVIDER_ACTIVE(row.jobId))}
              columns={[
                {
                  key: "jobTitle",
                  title: "Job",
                  render: (row) => (
                    <div>
                      <p className="font-bold text-ink text-sm">{row.jobTitle}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {row.customerName} · {formatDate(row.completedAt)}
                      </p>
                    </div>
                  ),
                },
                {
                  key: "status",
                  title: "Status",
                  render: (row) => <EarningStatusChip status={row.status} />,
                },
                {
                  key: "amount",
                  title: "Earned",
                  align: "right",
                  render: (row) => (
                    <span className="font-fraunces font-bold text-ink text-base tabular-nums">
                      {formatCurrency(row.amount)}
                    </span>
                  ),
                },
              ]}
            />
          </ApiState>
        </div>
      </div>
    </div>
  );
}
