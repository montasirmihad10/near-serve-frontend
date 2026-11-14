"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminDisputeRow } from "@/types/admin";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminBadge from "@/components/admin/AdminBadge";
import PageHeader from "@/components/shared/app/PageHeader";
import ApiState from "@/components/shared/app/ApiState";
import { useClientPagination } from "@/hooks/useClientPagination";
import { formatCurrency, formatDate } from "@/lib/customer/format";
import { ROUTES } from "@/utils/navigation";
import { cn } from "@/lib/utils";
import { useGetAllDisputesQuery } from "@/redux/api/adminApi";
import { extractAdminRows, mapAdminDispute } from "@/lib/admin/mappers";

type Filter = "all" | "open" | "resolved";

const STATUS_LABEL: Record<AdminDisputeRow["status"], string> = {
  open: "Open",
  resolved_customer: "Refund customer",
  resolved_provider: "Pay provider",
  resolved_split: "Split",
};

function tone(status: AdminDisputeRow["status"]) {
  if (status === "open") return "warning" as const;
  if (status === "resolved_customer") return "danger" as const;
  if (status === "resolved_provider") return "success" as const;
  return "info" as const;
}

export default function AdminDisputesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading, isError, refetch } = useGetAllDisputesQuery({
    sort: "-createdAt",
    limit: 100,
  });

  const rows = extractAdminRows(data).map(mapAdminDispute);

  const filtered = useMemo(() => {
    if (filter === "open") return rows.filter((d) => d.status === "open");
    if (filter === "resolved") return rows.filter((d) => d.status !== "open");
    return rows;
  }, [filter, rows]);

  const pagination = useClientPagination(filtered, 8);

  return (
    <div>
      <PageHeader
        eyebrow="Live · GET /admin/disputes"
        title="Disputes"
        description="Mediate payment holds using job chat + evidence."
      />

      <ApiState
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        errorMessage="Could not load disputes from the API."
      >
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {(
            [
              ["all", "All"],
              ["open", "Open"],
              ["resolved", "Resolved"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter(key);
                pagination.resetPage();
              }}
              className={cn(
                "app-chip shrink-0 rounded-full border px-4 py-2 text-sm font-medium",
                filter === key
                  ? "border-ink bg-ink text-cream"
                  : "border-border bg-white/70 text-warm",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <AdminDataTable<AdminDisputeRow>
          title="Dispute queue"
          description="GET /admin/disputes/:jobId"
          data={pagination.pageItems}
          totalItems={pagination.totalItems}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          emptyText="No disputes in this filter."
          onRowClick={(row) => router.push(ROUTES.ADMIN_DISPUTE(row.jobId))}
          columns={[
            {
              key: "jobTitle",
              title: "Job",
              render: (row) => (
                <div>
                  <p className="font-medium text-ink">{row.jobTitle}</p>
                  <p className="line-clamp-1 text-xs text-muted">{row.reason}</p>
                </div>
              ),
            },
            { key: "customerName", title: "Customer" },
            { key: "providerName", title: "Provider" },
            {
              key: "amount",
              title: "Amount",
              align: "right",
              render: (row) => (
                <span className="font-medium tabular-nums">
                  {formatCurrency(row.amount)}
                </span>
              ),
            },
            {
              key: "status",
              title: "Status",
              render: (row) => (
                <AdminBadge label={STATUS_LABEL[row.status]} tone={tone(row.status)} />
              ),
            },
            {
              key: "openedAt",
              title: "Opened",
              render: (row) => formatDate(row.openedAt),
            },
          ]}
        />
      </ApiState>
    </div>
  );
}
