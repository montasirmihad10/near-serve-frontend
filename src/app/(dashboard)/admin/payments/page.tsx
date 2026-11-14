"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminPaymentRow } from "@/types/admin";
import AdminDataTable from "@/components/admin/AdminDataTable";
import StatusChip from "@/components/customer/StatusChip";
import PageHeader from "@/components/shared/app/PageHeader";
import ApiState from "@/components/shared/app/ApiState";
import { useClientPagination } from "@/hooks/useClientPagination";
import { formatCurrency, formatDate } from "@/lib/customer/format";
import { ROUTES } from "@/utils/navigation";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/job";
import { useAdminGetAllPaymentsQuery } from "@/redux/api/adminApi";
import { extractAdminRows, mapAdminPayment } from "@/lib/admin/mappers";

type Filter = "all" | PaymentStatus;

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading, isError, refetch } = useAdminGetAllPaymentsQuery({
    sort: "-createdAt",
    limit: 100,
  });

  const rows = extractAdminRows(data).map(mapAdminPayment);

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    return rows.filter((p) => p.status === filter);
  }, [filter, rows]);

  const pagination = useClientPagination(filtered, 8);

  return (
    <div>
      <PageHeader
        eyebrow="Live · GET /admin/payments"
        title="Payments"
        description="All marketplace payments — held, released, disputed, and refunded."
      />

      <ApiState
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        errorMessage="Could not load payments from the API."
      >
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {(
            ["all", "held", "released", "pending", "disputed", "refunded"] as const
          ).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setFilter(key);
                pagination.resetPage();
              }}
              className={cn(
                "app-chip shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium capitalize",
                filter === key
                  ? "border-ink bg-ink text-cream"
                  : "border-border bg-white/70 text-warm",
              )}
            >
              {key === "all" ? "All" : key}
            </button>
          ))}
        </div>

        <AdminDataTable<AdminPaymentRow>
          title="Payment ledger"
          description="GET /admin/payments/:id"
          data={pagination.pageItems}
          totalItems={pagination.totalItems}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          emptyText="No payments match this filter."
          onRowClick={(row) => router.push(ROUTES.ADMIN_PAYMENT(row.id))}
          columns={[
            {
              key: "jobTitle",
              title: "Job",
              render: (row) => (
                <div>
                  <p className="font-medium text-ink">{row.jobTitle}</p>
                  <p className="text-xs text-muted">{row.method}</p>
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
              render: (row) => <StatusChip status={row.status as any} />,
            },
            {
              key: "createdAt",
              title: "Created",
              render: (row) => formatDate(row.createdAt),
            },
          ]}
        />
      </ApiState>
    </div>
  );
}
