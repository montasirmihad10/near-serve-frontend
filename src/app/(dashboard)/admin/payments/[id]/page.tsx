"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import StatusChip from "@/components/customer/StatusChip";
import { ROUTES } from "@/utils/navigation";
import { formatCurrency, formatDateTime } from "@/lib/customer/format";
import {
  mapAdminPayment,
  unwrapAdminData,
} from "@/lib/admin/mappers";
import { useAdminGetPaymentDetailsQuery } from "@/redux/api/adminApi";
import {
  useCancelPaymentMutation,
  useRefundPaymentMutation,
} from "@/redux/api/paymentApi";

/* eslint-disable @typescript-eslint/no-explicit-any */

type PageProps = { params: Promise<{ id: string }> };

export default function AdminPaymentDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data, isLoading, isError, refetch } =
    useAdminGetPaymentDetailsQuery(id);
  const [cancelPayment, { isLoading: cancelling }] =
    useCancelPaymentMutation();
  const [refundPayment, { isLoading: refunding }] = useRefundPaymentMutation();

  const paymentRaw = unwrapAdminData(data);
  const payment =
    paymentRaw?._id || paymentRaw?.id ? mapAdminPayment(paymentRaw) : null;
  const stripeIntent =
    paymentRaw?.paymentIntentId ||
    paymentRaw?.stripePaymentIntentId ||
    paymentRaw?.stripeSessionId ||
    null;
  const commission = Number(
    paymentRaw?.actualCommission ?? paymentRaw?.commissionAmount ?? 0,
  );
  const providerPayout = Number(paymentRaw?.providerPayout ?? 0);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted">
        Loading payment…
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="py-16 text-center">
        <p className="font-fraunces text-xl text-ink mb-2">Payment not found</p>
        <Link href={ROUTES.ADMIN_PAYMENTS} className="text-brand text-sm">
          Back to payments
        </Link>
      </div>
    );
  }

  const canCancel = payment.status === "held" || payment.status === "pending";
  const canRefund = payment.status === "released";

  const cancelHold = async () => {
    if (!payment.jobId) {
      toast.error("Missing job id for this payment");
      return;
    }
    try {
      await cancelPayment({
        jobId: payment.jobId,
        reason: "Cancelled by admin from payment detail",
      }).unwrap();
      toast.success("Escrow hold cancelled");
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not cancel payment");
    }
  };

  const refund = async () => {
    if (!payment.jobId) {
      toast.error("Missing job id for this payment");
      return;
    }
    try {
      await refundPayment({
        jobId: payment.jobId,
        reverseProviderTransfer: true,
        refundReason: "Refunded by admin",
      }).unwrap();
      toast.success("Payment refunded");
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not refund payment");
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <Link
        href={ROUTES.ADMIN_PAYMENTS}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Payments
      </Link>

      <div className="app-surface rounded-2xl p-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-3">
          <StatusChip status={payment.status} kind="payment" />
        </div>
        <h1 className="font-fraunces text-2xl font-semibold text-ink mb-1">
          {payment.jobTitle}
        </h1>
        <p className="font-fraunces text-3xl font-bold text-ink tabular-nums mb-6">
          {formatCurrency(payment.amount)}
        </p>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Customer
            </dt>
            <dd className="font-medium text-ink">{payment.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Provider
            </dt>
            <dd className="font-medium text-ink">{payment.providerName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Method
            </dt>
            <dd className="font-medium text-ink">{payment.method}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Created
            </dt>
            <dd className="font-medium text-ink">
              {formatDateTime(payment.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Platform commission
            </dt>
            <dd className="font-medium text-ink">
              {formatCurrency(commission)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Provider payout
            </dt>
            <dd className="font-medium text-ink">
              {formatCurrency(providerPayout)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Stripe reference
            </dt>
            <dd className="font-medium text-ink break-all">
              {stripeIntent || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Job
            </dt>
            <dd>
              <Link
                href={ROUTES.ADMIN_JOB(payment.jobId)}
                className="font-medium text-brand"
              >
                Open job
              </Link>
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          {canCancel && (
            <button
              type="button"
              disabled={cancelling}
              onClick={() => void cancelHold()}
              className="app-btn rounded-xl border border-border text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
            >
              Cancel escrow hold
            </button>
          )}
          {canRefund && (
            <button
              type="button"
              disabled={refunding}
              onClick={() => void refund()}
              className="app-btn rounded-xl bg-[#8b1a1a] text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
            >
              Refund payment
            </button>
          )}
          {payment.status === "disputed" && (
            <Link
              href={ROUTES.ADMIN_DISPUTE(payment.jobId)}
              className="inline-flex items-center text-sm font-semibold text-brand px-2"
            >
              Open related dispute →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
