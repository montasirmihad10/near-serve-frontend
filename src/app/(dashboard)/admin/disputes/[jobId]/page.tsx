"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import AdminBadge from "@/components/admin/AdminBadge";
import { ROUTES } from "@/utils/navigation";
import { formatCurrency, formatDateTime } from "@/lib/customer/format";
import {
  mapAdminDispute,
  mapAdminPayment,
  unwrapAdminData,
} from "@/lib/admin/mappers";
import {
  useGetDisputeDetailsQuery,
  useResolveDisputeMutation,
} from "@/redux/api/adminApi";
import { useGetAIDisputeRecommendationQuery } from "@/redux/api/aiApi";

/* eslint-disable @typescript-eslint/no-explicit-any */

type PageProps = { params: Promise<{ jobId: string }> };

export default function AdminDisputeDetailPage({ params }: PageProps) {
  const { jobId } = use(params);
  const [adminNote, setAdminNote] = useState("");
  const [splitPercent, setSplitPercent] = useState(50);
  const [showAi, setShowAi] = useState(false);

  const { data, isLoading, isError, refetch } =
    useGetDisputeDetailsQuery(jobId);
  const [resolveDispute, { isLoading: resolving }] =
    useResolveDisputeMutation();
  const {
    data: aiData,
    isFetching: aiLoading,
    isError: aiError,
  } = useGetAIDisputeRecommendationQuery(jobId, { skip: !showAi });

  const payload = unwrapAdminData(data);
  const job = payload?.job;
  const paymentRaw = payload?.payment;
  const messages: any[] = Array.isArray(payload?.messages)
    ? payload.messages
    : [];

  const dispute =
    job?._id || job?.id
      ? mapAdminDispute({
          ...job,
          jobId: job,
          paymentId: paymentRaw,
          amount: paymentRaw?.amount ?? job?.budget,
          status: "open",
        })
      : null;
  const payment =
    paymentRaw?._id || paymentRaw?.id ? mapAdminPayment(paymentRaw) : null;
  const aiRecommendation = unwrapAdminData(aiData);

  if (isLoading) {
    return (
      <div className="py-16 text-center text-sm text-muted">
        Loading dispute…
      </div>
    );
  }

  if (isError || !dispute) {
    return (
      <div className="py-16 text-center">
        <p className="font-fraunces text-xl text-ink mb-2">Dispute not found</p>
        <p className="text-sm text-muted mb-3">
          Only jobs currently marked disputed appear here.
        </p>
        <Link href={ROUTES.ADMIN_DISPUTES} className="text-brand text-sm">
          Back to disputes
        </Link>
      </div>
    );
  }

  const resolve = async (
    resolution: "refund_customer" | "release_to_provider" | "partial_refund",
    label: string,
  ) => {
    try {
      await resolveDispute({
        jobId,
        resolution,
        refundPercent:
          resolution === "partial_refund" ? splitPercent : undefined,
        adminNote: adminNote.trim() || undefined,
      }).unwrap();
      toast.success(`Dispute resolved — ${label}`);
      void refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not resolve dispute");
    }
  };

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        href={ROUTES.ADMIN_DISPUTES}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Disputes
      </Link>

      <div className="app-surface rounded-2xl p-6 animate-fade-up">
        <AdminBadge label="Open" tone="warning" />
        <h1 className="font-fraunces text-2xl font-semibold text-ink mt-3 mb-1">
          {dispute.jobTitle}
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-6 rounded-xl bg-cream/80 border border-border p-4">
          {dispute.reason}
        </p>

        <dl className="grid sm:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Customer
            </dt>
            <dd className="font-medium text-ink">{dispute.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Provider
            </dt>
            <dd className="font-medium text-ink">{dispute.providerName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Amount held
            </dt>
            <dd className="font-medium text-ink">
              {formatCurrency(payment?.amount ?? dispute.amount)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted mb-1">
              Opened
            </dt>
            <dd className="font-medium text-ink">
              {formatDateTime(dispute.openedAt)}
            </dd>
          </div>
        </dl>

        <label className="block text-sm mb-4">
          <span className="text-xs uppercase tracking-wider text-muted">
            Admin note
          </span>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
            placeholder="Optional note sent with notifications…"
            className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
        </label>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-ink">Resolve escrow as</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={resolving}
              onClick={() =>
                void resolve("refund_customer", "full refund to customer")
              }
              className="app-btn rounded-xl bg-brand text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
            >
              Refund customer
            </button>
            <button
              type="button"
              disabled={resolving}
              onClick={() =>
                void resolve("release_to_provider", "pay provider")
              }
              className="app-btn rounded-xl bg-ink text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
            >
              Pay provider
            </button>
          </div>

          <div className="rounded-xl border border-border bg-cream/60 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-ink">
                Partial refund ({splitPercent}% to customer)
              </p>
              <input
                type="range"
                min={1}
                max={99}
                value={splitPercent}
                onChange={(e) => setSplitPercent(Number(e.target.value))}
                className="w-40 accent-[#c45c4a]"
              />
            </div>
            <button
              type="button"
              disabled={resolving}
              onClick={() =>
                void resolve(
                  "partial_refund",
                  `${splitPercent}% refund to customer`,
                )
              }
              className="app-btn rounded-xl border border-border text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
            >
              Apply split
            </button>
          </div>
        </div>
      </div>

      <div className="app-surface rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="font-fraunces text-lg font-semibold text-ink">
            Chat evidence
          </h2>
          <button
            type="button"
            onClick={() => setShowAi(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-ink hover:bg-cream"
          >
            <Sparkles className="size-3.5 text-brand" />
            AI suggestion
          </button>
        </div>

        {showAi && (
          <div className="mb-4 rounded-xl border border-border bg-cream/70 px-4 py-3 text-sm">
            {aiLoading && <p className="text-muted">Generating recommendation…</p>}
            {aiError && (
              <p className="text-[#8b1a1a]">
                AI recommendation unavailable right now.
              </p>
            )}
            {!aiLoading && !aiError && (
              <p className="text-ink whitespace-pre-wrap">
                {typeof aiRecommendation === "string"
                  ? aiRecommendation
                  : aiRecommendation?.recommendation ||
                    aiRecommendation?.message ||
                    JSON.stringify(aiRecommendation, null, 2)}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {messages.map((message) => {
            const sender = message.senderId || {};
            return (
              <div
                key={message._id || message.id}
                className="rounded-xl bg-cream/70 px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-bold text-ink">
                    {sender.name || "System"}{" "}
                    <span className="font-medium text-muted">
                      · {sender.role || message.messageType || "message"}
                    </span>
                  </p>
                  <p className="text-[11px] text-muted">
                    {formatDateTime(message.createdAt)}
                  </p>
                </div>
                <p className="text-sm text-warm whitespace-pre-wrap">
                  {message.content || message.text || "[attachment]"}
                </p>
              </div>
            );
          })}
          {messages.length === 0 && (
            <p className="text-sm text-muted py-6 text-center">
              No chat messages attached to this dispute.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
