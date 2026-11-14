"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  MessageSquare,
  Check,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import JobMap from "@/components/customer/JobMap";
import StatusChip from "@/components/customer/StatusChip";
import JobBidsPanel from "@/components/customer/JobBidsPanel";
import SecurePaymentCard from "@/components/customer/SecurePaymentCard";
import PaymentHowItWorks from "@/components/customer/PaymentHowItWorks";
import {
  formatCurrency,
  formatDate,
  JOB_STATUS_LABELS,
} from "@/lib/customer/format";
import type { Job, JobStatus } from "@/types/job";
import { ROUTES } from "@/utils/navigation";
import { cn } from "@/lib/utils";
import Avatar from "@/components/shared/app/Avatar";
import ReviewPrompt from "@/components/shared/reviews/ReviewPrompt";
import ApiState from "@/components/shared/app/ApiState";
import {
  useGetJobByIdQuery,
  useUpdateJobStatusMutation,
} from "@/redux/api/jobApi";
import { useGetBidsForJobQuery, useAcceptBidMutation } from "@/redux/api/bidApi";
import {
  useCapturePaymentMutation,
  useCreatePaymentIntentMutation,
  useGetPaymentHistoryQuery,
} from "@/redux/api/paymentApi";
import { useGetConversationByJobIdQuery } from "@/redux/api/conversationApi";
import { mapConversation, unwrapOne } from "@/lib/chat/mappers";
import { useGetMeQuery } from "@/redux/api/userApi";
import { unwrapList } from "@/lib/api/rows";

const TIMELINE: JobStatus[] = [
  "open",
  "bidding",
  "booked",
  "in_progress",
  "completed",
];

type PageProps = {
  params: Promise<{ id: string }>;
};

const mapBackendJobDetail = (item: any): Job => ({
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

const mapBackendBid = (b: any): any => ({
  id: b._id || b.id,
  jobId: b.jobId,
  providerId: b.providerId?._id || b.providerId,
  providerName: b.providerId?.userId?.name || "Provider",
  providerRating: b.providerId?.trustScore
    ? Number((b.providerId.trustScore / 20).toFixed(1))
    : 5,
  providerJobsCompleted: b.providerId?.totalJobs || 0,
  trustScore: Number(b.providerId?.trustScore) || undefined,
  completionRate: Number(b.providerId?.completionRate) || undefined,
  amount: b.price || 0,
  message: b.message || "",
  eta: b.etaMinutes ? `${b.etaMinutes} mins` : "1 hour",
  createdAt: b.createdAt,
  status: b.status,
});

export default function JobDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const {
    data: liveJobData,
    isLoading: jobLoading,
    isError: jobError,
    refetch: refetchJob,
  } = useGetJobByIdQuery(id);
  const { data: liveBidsData } = useGetBidsForJobQuery(id);
  const { data: meRes } = useGetMeQuery(undefined);
  const me = unwrapOne(meRes) || meRes?.data || meRes;
  const myUserId = String(me?._id || me?.id || "");
  const { data: liveConvData } = useGetConversationByJobIdQuery(id, {
    skip: !id,
  });
  const { data: paymentsRes } = useGetPaymentHistoryQuery({
    sort: "-createdAt",
    limit: 50,
  });
  const [acceptBidMutation] = useAcceptBidMutation();
  const [createPaymentIntentMutation] = useCreatePaymentIntentMutation();
  const [capturePaymentMutation] = useCapturePaymentMutation();
  const [updateJobStatus] = useUpdateJobStatusMutation();

  const rawJob = unwrapOne(liveJobData) || liveJobData?.data || liveJobData;
  const bids = unwrapList(liveBidsData).map(mapBackendBid);

  const job =
    rawJob && (rawJob._id || rawJob.id)
      ? mapBackendJobDetail(rawJob)
      : null;
  const rawConv = unwrapOne(liveConvData);
  const conversation = rawConv
    ? mapConversation(rawConv, myUserId, "customer")
    : null;
  const paymentRaw = unwrapList(paymentsRes).find((p: any) => {
    const jobRef = p.jobId?._id || p.jobId;
    return String(jobRef) === String(id);
  }) as any;
  const payment = paymentRaw
    ? {
        id: String(paymentRaw._id || paymentRaw.id),
        amount: Number(paymentRaw.amount) || 0,
        status: String(paymentRaw.status || ""),
      }
    : null;

  const [acceptedBid, setAcceptedBid] = useState<string | null>(null);
  const [paymentHeld, setPaymentHeld] = useState(false);
  const [localStatus, setLocalStatus] = useState<JobStatus | null>(null);

  useEffect(() => {
    if (job?.acceptedBidId) setAcceptedBid(job.acceptedBidId);
  }, [job?.acceptedBidId]);

  useEffect(() => {
    if (payment && (payment.status === "authorized" || payment.status === "captured")) {
      setPaymentHeld(true);
    }
  }, [payment]);

  if (jobLoading || jobError || !job) {
    return (
      <div className="py-10">
        <ApiState
          isLoading={jobLoading}
          isError={jobError || (!jobLoading && !job)}
          onRetry={() => void refetchJob()}
          errorMessage="Could not load this job from the API."
          isEmpty={!jobLoading && !jobError && !job}
          emptyTitle="Job not found"
          emptyDescription="It may have been removed or you don’t have access."
        >
          <Link href={ROUTES.CUSTOMER_HOME} className="text-brand font-medium text-sm">
            Back to my jobs
          </Link>
        </ApiState>
      </div>
    );
  }

  const status: JobStatus = localStatus ?? job.status;
  const statusIndex =
    status === "disputed"
      ? TIMELINE.indexOf("in_progress")
      : TIMELINE.indexOf(status);

  const acceptedBidData = bids.find((b: any) => b.id === acceptedBid);
  const canAccept =
    (status === "bidding" || status === "open") && !acceptedBid;
  const showAfterAccept = !!acceptedBid;

  const chatHref = conversation?.id
    ? `${ROUTES.CUSTOMER_MESSAGES}?id=${conversation.id}`
    : ROUTES.CUSTOMER_MESSAGES;

  const payAmount = acceptedBidData?.amount ?? payment?.amount ?? job.budget;
  const providerFirst =
    acceptedBidData?.providerName?.split(" ")[0] ??
    job.providerName?.split(" ")[0] ?? "Provider";

  const handleAccept = async (bidId: string, providerName: string) => {
    try {
      const res: any = await acceptBidMutation(bidId).unwrap();
      const payload = res?.data || res;
      const conversationId =
        payload?.conversationId?._id ||
        payload?.conversationId ||
        payload?.data?.conversationId;
      setAcceptedBid(bidId);
      setLocalStatus("booked");
      toast.success(`You chose ${providerName}`, {
        description: conversationId
          ? "Chat is open — pay to confirm the booking."
          : "Next: pay to confirm the booking.",
        action: conversationId
          ? {
              label: "Open chat",
              onClick: () => {
                window.location.href = `${ROUTES.CUSTOMER_MESSAGES}?id=${conversationId}`;
              },
            }
          : undefined,
      });
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to accept bid");
    }
  };

  const handlePay = async (opts: {
    method: "stripe" | "cod" | "bkash" | "nagad";
    payerWallet?: string;
  }) => {
    try {
      const res: any = await createPaymentIntentMutation({
        jobId: id,
        method: opts.method,
        payerWallet: opts.payerWallet,
      }).unwrap();
      const payload = res?.data || res;
      const checkoutUrl = payload?.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }
      setPaymentHeld(true);
      toast.success(
        opts.method === "stripe"
          ? "Payment authorized safely"
          : opts.method === "cod"
            ? "Cash on delivery confirmed"
            : `${opts.method === "bkash" ? "bKash" : "Nagad"} payment reserved`,
        {
          description:
            payload?.message ||
            "Booking is secured. Settlement completes after you approve the work.",
        },
      );
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to initiate payment",
      );
    }
  };

  const handleComplete = async () => {
    try {
      await updateJobStatus({ jobId: id, status: "completed" }).unwrap();
      setLocalStatus("completed");
      try {
        await capturePaymentMutation({ jobId: id }).unwrap();
        setPaymentHeld(false);
        toast.success("Job approved — payment released");
      } catch {
        toast.success("Job marked complete", {
          description: "Release payment from the Payments page if needed.",
        });
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not complete job");
    }
  };

  const handleDispute = async () => {
    try {
      await updateJobStatus({ jobId: id, status: "disputed" }).unwrap();
      setLocalStatus("disputed");
      toast.success("Dispute opened", {
        description: "NearServe will review chat + payment evidence.",
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not open dispute");
    }
  };

  if (jobLoading || jobError || !job) {
    return (
      <div className="space-y-6">
        <Link
          href={ROUTES.CUSTOMER_HOME}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="size-4" />
          Back to my jobs
        </Link>
        <ApiState
          isLoading={jobLoading}
          isError={jobError || (!jobLoading && !job)}
          errorMessage="This job could not be loaded from the server."
          onRetry={() => void refetchJob()}
          isEmpty={false}
        >
          {null}
        </ApiState>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="animate-fade-up">
        <Link
          href={ROUTES.CUSTOMER_HOME}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-5 transition-colors"
        >
          <ArrowLeft className="size-4" />
          My jobs
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusChip status={status} />
          <span className="text-xs text-muted rounded-full bg-white/70 border border-border px-2.5 py-0.5">
            {job.category}
          </span>
        </div>
        <h1 className="font-fraunces text-3xl md:text-4xl font-semibold text-ink leading-tight max-w-xl tracking-tight">
          {job.title}
        </h1>
        <p className="mt-3 text-muted leading-relaxed max-w-xl">
          {job.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-warm">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-3.5 text-brand" />
            {job.location.address}
          </span>
          <span className="font-semibold text-ink tabular-nums">
            Budget {formatCurrency(job.budget)}
          </span>
          <span className="text-muted">Posted {formatDate(job.createdAt)}</span>
        </div>
      </div>

      {showAfterAccept && (
        <section className="animate-fade-up rounded-2xl border border-brand/20 bg-gradient-to-br from-white to-brand/[0.04] p-5 shadow-[0_8px_32px_rgba(199,10,36,0.08)] md:p-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
            Next steps
          </p>
          <h2 className="mb-4 font-fraunces text-xl font-semibold text-ink">
            {status === "completed"
              ? "Job finished"
              : status === "in_progress" || status === "disputed"
                ? "Work in progress"
                : paymentHeld
                  ? "You’re booked — stay in touch"
                  : "Provider chosen — pay to confirm"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {status !== "completed" && status !== "disputed" && (
              <button
                type="button"
                onClick={() => {
                  if (paymentHeld || status === "in_progress") return;
                  document
                    .getElementById("secure-payment")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                disabled={paymentHeld || status === "in_progress"}
                className={cn(
                  "app-btn flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-sm font-semibold transition-all",
                  paymentHeld || status === "in_progress"
                    ? "cursor-default bg-[#e8f5e9] text-[#1b5e20]"
                    : "bg-brand text-white shadow-[0_4px_16px_rgba(199,10,36,0.25)] hover:bg-brand-dark",
                )}
              >
                <span>
                  {paymentHeld || status === "in_progress"
                    ? "Payment held safely"
                    : `Pay ${formatCurrency(payAmount)} to confirm`}
                </span>
                {!paymentHeld && status !== "in_progress" && (
                  <ArrowRight className="size-4 shrink-0" />
                )}
              </button>
            )}
            <Link
              href={chatHref}
              className="app-btn flex items-center justify-between gap-3 rounded-xl bg-ink px-4 py-3.5 text-sm font-semibold text-white hover:bg-ink/90"
            >
              <span className="inline-flex items-center gap-2">
                <MessageSquare className="size-4" />
                Open chat{providerFirst ? ` with ${providerFirst}` : ""}
              </span>
              <ArrowRight className="size-4 shrink-0" />
            </Link>
            {(status === "in_progress" || status === "completed") && (
                <button
                  type="button"
                  onClick={() => void handleComplete()}
                  disabled={status === "completed"}
                  className="app-btn flex items-center justify-between gap-3 rounded-xl bg-emerald-700 px-4 py-3.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                >
                  <span>
                    {status === "completed"
                      ? "Approved"
                      : "Approve & release payment"}
                  </span>
                  <Check className="size-4 shrink-0" />
                </button>
              )}
            {status === "in_progress" && (
              <button
                type="button"
                onClick={() => void handleDispute()}
                className="app-btn rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-semibold text-red-800 hover:bg-red-100"
              >
                Raise dispute
              </button>
            )}
          </div>
          {status === "completed" && (
            <div className="mt-4">
              <ReviewPrompt
                jobId={job.id}
                providerName={job.providerName}
              />
            </div>
          )}
        </section>
      )}

      <section className="app-surface rounded-2xl p-5 md:p-6 animate-fade-up hero-delay-1">
        <h2 className="font-fraunces text-lg font-semibold text-ink mb-5">
          Job progress
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
          {TIMELINE.map((step, i) => {
            const done = i <= statusIndex;
            const current = i === statusIndex && status !== "disputed";
            return (
              <div key={step} className="flex sm:flex-1 items-center gap-3 sm:gap-0">
                <div className="flex sm:flex-col items-center gap-2 sm:gap-1.5 sm:flex-1">
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0",
                      done
                        ? "bg-brand border-brand text-white"
                        : "bg-cream border-border text-muted",
                      current && "ring-4 ring-brand/15 animate-status-glow",
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
                      "hidden sm:block h-0.5 flex-1 mx-1 rounded-full",
                      i < statusIndex ? "bg-brand" : "bg-border",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        {status === "disputed" && (
          <p className="mt-4 text-sm text-[#8b1a1a] bg-[#f5e6e6] rounded-xl px-4 py-3 border border-[#e8c8c8]/60">
            This job is under review. Payment stays held until NearServe
            resolves it.
          </p>
        )}
      </section>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <section className="animate-fade-up hero-delay-2">
            <h2 className="font-fraunces text-lg font-semibold text-ink mb-3">
              {status === "in_progress" ? "Live location" : "Job location"}
            </h2>
            <JobMap
              lat={job.location.lat}
              lng={job.location.lng}
              label={job.location.address}
              className="h-[280px]"
              showProviderEnRoute={status === "in_progress"}
            />
          </section>

          <section className="animate-fade-up hero-delay-3">
            <JobBidsPanel
              bids={bids}
              acceptedBidId={acceptedBid}
              canAccept={canAccept}
              onAccept={handleAccept}
            />
          </section>
        </div>

        <aside
          id="secure-payment"
          className="lg:col-span-2 space-y-4 animate-fade-up hero-delay-2"
        >
          <SecurePaymentCard
            amount={payAmount}
            paid={paymentHeld || !!payment}
            hasChosenProvider={!!acceptedBid}
            providerFirstName={providerFirst}
            defaultMethod={
              (me?.paymentPreferences?.preferredMethod as
                | "stripe"
                | "cod"
                | "bkash"
                | "nagad"
                | undefined) || "stripe"
            }
            savedBkash={me?.paymentPreferences?.bkashNumber}
            savedNagad={me?.paymentPreferences?.nagadNumber}
            onPay={handlePay}
          />

          <PaymentHowItWorks compact />

          {(conversation || acceptedBid) && (
            <Link
              href={chatHref}
              className="app-surface app-surface-hover flex items-center gap-3 rounded-2xl p-4"
            >
              <div className="size-10 rounded-full bg-cream flex items-center justify-center text-brand border border-border">
                <MessageSquare className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  Chat with{" "}
                  {conversation?.participant.name ??
                    acceptedBidData?.providerName ??
                    "provider"}
                </p>
                <p className="text-xs text-muted truncate">
                  {conversation?.lastMessage ??
                    "Chat opens after you choose a provider."}
                </p>
              </div>
            </Link>
          )}

          {(job.providerName || acceptedBidData) && (
            <div className="app-surface rounded-2xl p-4 flex items-center gap-3">
              <Avatar
                name={acceptedBidData?.providerName ?? job.providerName ?? "P"}
                size="sm"
              />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted mb-0.5">
                  Provider
                </p>
                <p className="font-semibold text-ink">
                  {acceptedBidData?.providerName ?? job.providerName}
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
