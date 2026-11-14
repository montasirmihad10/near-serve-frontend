"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AdminProviderRow } from "@/types/admin";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminBadge from "@/components/admin/AdminBadge";
import PageHeader from "@/components/shared/app/PageHeader";
import ApiState from "@/components/shared/app/ApiState";
import { useClientPagination } from "@/hooks/useClientPagination";
import { ROUTES } from "@/utils/navigation";
import { cn } from "@/lib/utils";
import {
  useGetAllProvidersQuery,
  useToggleProviderApprovalMutation,
} from "@/redux/api/adminApi";
import { extractAdminRows, mapAdminProvider } from "@/lib/admin/mappers";

type Filter = "all" | "pending" | "approved";

export default function AdminProvidersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading, isError, refetch } = useGetAllProvidersQuery({
    sort: "-createdAt",
    limit: 100,
  });
  const [toggleApprovalMutation] = useToggleProviderApprovalMutation();

  const rows = extractAdminRows(data).map(mapAdminProvider);

  const filtered = useMemo(() => {
    if (filter === "pending") return rows.filter((p) => !p.isApproved);
    if (filter === "approved") return rows.filter((p) => p.isApproved);
    return rows;
  }, [rows, filter]);

  const {
    currentPage,
    totalPages,
    pageItems,
    onPageChange,
    resetPage,
    totalItems,
  } = useClientPagination(filtered, 8);

  const setFilterAndReset = (f: Filter) => {
    setFilter(f);
    resetPage();
  };

  const toggleApproval = async (
    provider: AdminProviderRow,
    approve: boolean,
  ) => {
    try {
      await toggleApprovalMutation({
        providerId: provider.id,
        type: approve ? "approve" : "reject",
        reason: approve ? undefined : "Incomplete verification documents",
      }).unwrap();
      toast.success(
        approve ? `${provider.name} approved` : `${provider.name} rejected`,
      );
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Action failed";
      toast.error(message);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Live · GET /admin/providers"
        title="Providers"
        description="Approve or reject provider applications. Open a row for full details."
      />

      <ApiState
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        errorMessage="Could not load providers from the API."
      >
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {(
            [
              ["all", "All"],
              ["pending", "Pending"],
              ["approved", "Approved"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilterAndReset(key)}
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

        <AdminDataTable<AdminProviderRow>
          title="Provider list"
          description="PATCH /admin/providers/:id/approve-reject"
          data={pageItems}
          totalItems={totalItems}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          emptyText="No providers match this filter."
          onRowClick={(row) => router.push(ROUTES.ADMIN_PROVIDER(row.id))}
          columns={[
            {
              key: "name",
              title: "Provider",
              render: (row) => (
                <div>
                  <p className="font-medium text-ink">{row.name}</p>
                  <p className="text-xs text-muted">{row.email}</p>
                </div>
              ),
            },
            {
              key: "categories",
              title: "Skills",
              render: (row) => (
                <span className="text-xs text-muted">
                  {row.categories.join(", ")}
                </span>
              ),
            },
            {
              key: "city",
              title: "City",
            },
            {
              key: "isApproved",
              title: "Status",
              render: (row) =>
                row.isApproved ? (
                  <AdminBadge label="Approved" tone="success" />
                ) : (
                  <AdminBadge label="Pending" tone="warning" />
                ),
            },
            {
              key: "rating",
              title: "Rating",
              align: "right",
              render: (row) =>
                row.isApproved ? (
                  <span className="tabular-nums">{row.rating.toFixed(1)}</span>
                ) : (
                  <span className="text-muted">—</span>
                ),
            },
            {
              key: "actions",
              title: "",
              align: "right",
              render: (row) =>
                !row.isApproved ? (
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void toggleApproval(row, true);
                      }}
                      className="rounded-lg bg-brand px-2.5 py-1.5 text-xs font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void toggleApproval(row, false);
                      }}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-warm"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-muted">
                    {row.jobsCompleted} jobs
                  </span>
                ),
            },
          ]}
        />
      </ApiState>
    </div>
  );
}
