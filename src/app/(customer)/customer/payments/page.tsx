"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ArrowRight, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import StatusChip from "@/components/customer/StatusChip";
import PaymentHowItWorks from "@/components/customer/PaymentHowItWorks";
import UseTable from "@/components/ui/UseTable";
import { formatCurrency, formatDate } from "@/lib/customer/format";
import { ROUTES } from "@/utils/navigation";
import PageHeader from "@/components/shared/app/PageHeader";
import DashPanel from "@/components/shared/app/DashPanel";
import DashStat from "@/components/shared/app/DashStat";
import ApiState from "@/components/shared/app/ApiState";
import type { Payment, PaymentStatus } from "@/types/job";
import {
  useCapturePaymentMutation,
  useGetPaymentHistoryQuery,
} from "@/redux/api/paymentApi";
import { unwrapList } from "@/lib/api/rows";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapPayment(raw: any): Payment {
  const job = raw.jobId;
  return {
    id: raw._id || raw.id,
    jobId: job?._id || job || raw.jobId,
    jobTitle: job?.title || raw.jobTitle || "Service job",
    amount: raw.amount || 0,
    status: (raw.status === "authorized"
      ? "held"
      : raw.status === "captured"
        ? "released"
        : raw.status) as PaymentStatus,
    createdAt: raw.createdAt || new Date().toISOString(),
    providerName:
      job?.selectedProvider?.userId?.name || raw.providerName || "Provider",
    method: raw.method || "card",
  };
}

export default function PaymentsPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetPaymentHistoryQuery({
    sort: "-createdAt",
    limit: 50,
  });
  const [capturePayment, { isLoading: capturing }] = useCapturePaymentMutation();

  const payments: Payment[] = unwrapList(data).map(mapPayment);

  const held = payments
    .filter((p) => p.status === "held" || p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);
  const released = payments
    .filter((p) => p.status === "released")
    .reduce((sum, p) => sum + p.amount, 0);

  const releasePayment = async (id: string, title: string) => {
    try {
      await capturePayment({ paymentId: id }).unwrap();
      toast.success("Payment released to provider", {
        description: `“${title}” — funds transferred after your approval.`,
      });
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not release payment");
    }
  };

  const rows = useMemo(() => payments, [payments]);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Protected checkout"
        title="Payments & receipts"
        description="Funds stay held until you inspect and approve the completed job."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DashPanel tone="ink" className="animate-fade-up">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
            <Lock className="size-3.5 text-emerald-400" />
            Held in safe protection
          </div>
          <p className="mt-3 font-fraunces text-3xl font-semibold tabular-nums md:text-4xl">
            {formatCurrency(held)}
          </p>
          <p className="mt-2 text-xs text-white/60">
            Waiting for your approval on completion
          </p>
        </DashPanel>
        <DashStat
          index={1}
          label="Completed & paid out"
          value={formatCurrency(released)}
          icon={<DollarSign className="h-5 w-5" />}
          tone="emerald"
        />
        <DashStat
          index={2}
          label="Protected transactions"
          value={rows.length}
          hint="Tied to job records"
          icon={<ShieldCheck className="h-5 w-5" />}
          tone="brand"
        />
      </div>

      <PaymentHowItWorks />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" />
          Loading payments…
        </div>
      ) : (
        <DashPanel className="animate-fade-up !p-0 overflow-hidden">
          <UseTable<Payment>
            data={rows}
            hover
            striped
            onRowClick={(row) => router.push(ROUTES.CUSTOMER_JOB(row.jobId))}
            columns={[
              {
                key: "job",
                title: "Job",
                render: (row) => (
                  <div>
                    <p className="text-sm font-bold text-ink">{row.jobTitle}</p>
                    <p className="text-xs text-muted">{row.providerName}</p>
                  </div>
                ),
              },
              {
                key: "amount",
                title: "Amount",
                render: (row) => (
                  <span className="font-fraunces text-sm font-bold tabular-nums">
                    {formatCurrency(row.amount)}
                  </span>
                ),
              },
              {
                key: "status",
                title: "Status",
                render: (row) => <StatusChip status={row.status as any} />,
              },
              {
                key: "date",
                title: "Date",
                render: (row) => (
                  <span className="text-xs text-muted">
                    {formatDate(row.createdAt)}
                  </span>
                ),
              },
              {
                key: "action",
                title: "",
                align: "right",
                render: (row) =>
                  row.status === "held" || row.status === "pending" ? (
                    <button
                      type="button"
                      disabled={capturing}
                      onClick={(e) => {
                        e.stopPropagation();
                        void releasePayment(row.id, row.jobTitle);
                      }}
                      className="rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-dark disabled:opacity-50"
                    >
                      Approve & release
                    </button>
                  ) : (
                    <Link
                      href={ROUTES.CUSTOMER_JOB(row.jobId)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View job <ArrowRight className="size-3.5" />
                    </Link>
                  ),
              },
            ]}
          />
        </DashPanel>
      )}
    </div>
  );
}
