"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AdminUserRow } from "@/types/admin";
import AdminDataTable from "@/components/admin/AdminDataTable";
import AdminBadge from "@/components/admin/AdminBadge";
import PageHeader from "@/components/shared/app/PageHeader";
import ApiState from "@/components/shared/app/ApiState";
import { useClientPagination } from "@/hooks/useClientPagination";
import { ROUTES } from "@/utils/navigation";
import { formatDate } from "@/lib/customer/format";
import { cn } from "@/lib/utils";
import { extractAdminRows, mapAdminUser } from "@/lib/admin/mappers";
import {
  useGetAllUsersQuery,
  useToggleUserBlockStatusMutation,
} from "@/redux/api/adminApi";

type Filter = "all" | "customer" | "provider" | "blocked";

export default function AdminUsersPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const { data, isLoading, isError, refetch, isFetching } = useGetAllUsersQuery({
    sort: "-createdAt",
    limit: 200,
  });
  const [toggleBlockMutation, { isLoading: blocking }] =
    useToggleUserBlockStatusMutation();

  const rows = extractAdminRows(data).map(mapAdminUser);

  const filtered = useMemo(() => {
    if (filter === "blocked") return rows.filter((u) => u.isBlocked);
    if (filter === "customer" || filter === "provider") {
      return rows.filter((u) => u.role === filter);
    }
    return rows.filter((u) => u.role !== "admin");
  }, [rows, filter]);

  const pagination = useClientPagination(filtered, 8);

  const toggleBlock = async (user: AdminUserRow) => {
    try {
      await toggleBlockMutation({
        userId: user.id,
        type: user.isBlocked ? "unblock" : "block",
        reason: user.isBlocked
          ? undefined
          : "Blocked by admin from users list",
      }).unwrap();
      toast.success(
        user.isBlocked ? `${user.name} unblocked` : `${user.name} blocked`,
      );
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Could not update user";
      toast.error(message);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Live · GET /admin/users"
        title="Users"
        description="Find customers and providers. Block or unblock accounts from the list or detail page."
      />

      <ApiState
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        errorMessage="Could not load users from the API."
      >
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(
            [
              ["all", "All"],
              ["customer", "Customers"],
              ["provider", "Providers"],
              ["blocked", "Blocked"],
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
                "app-chip shrink-0 rounded-full px-4 py-2 text-sm font-medium border",
                filter === key
                  ? "bg-ink text-cream border-ink"
                  : "bg-white/70 text-warm border-border",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <AdminDataTable<AdminUserRow>
          title="User list"
          description={
            isFetching
              ? "Refreshing…"
              : "PATCH /admin/users/:userId/block-unblock"
          }
          data={pagination.pageItems}
          totalItems={pagination.totalItems}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          emptyText="No users found."
          onRowClick={(row) => router.push(ROUTES.ADMIN_USER(row.id))}
          columns={[
            {
              key: "name",
              title: "User",
              render: (row) => (
                <div>
                  <p className="font-medium text-ink">{row.name}</p>
                  <p className="text-xs text-muted">{row.email}</p>
                </div>
              ),
            },
            {
              key: "role",
              title: "Role",
              render: (row) => (
                <AdminBadge
                  label={row.role}
                  tone={row.role === "provider" ? "info" : "muted"}
                />
              ),
            },
            {
              key: "jobsCount",
              title: "Jobs",
              align: "right",
              render: (row) => (
                <span className="tabular-nums">{row.jobsCount || "—"}</span>
              ),
            },
            {
              key: "createdAt",
              title: "Joined",
              render: (row) => formatDate(row.createdAt),
            },
            {
              key: "isBlocked",
              title: "Status",
              render: (row) =>
                row.isBlocked ? (
                  <AdminBadge label="Blocked" tone="danger" />
                ) : (
                  <AdminBadge label="Active" tone="success" />
                ),
            },
            {
              key: "actions",
              title: "",
              align: "right",
              render: (row) =>
                row.role === "admin" ? null : (
                  <button
                    type="button"
                    disabled={blocking}
                    onClick={(e) => {
                      e.stopPropagation();
                      void toggleBlock(row);
                    }}
                    className={cn(
                      "rounded-lg text-xs font-semibold px-2.5 py-1.5 border disabled:opacity-60",
                      row.isBlocked
                        ? "bg-brand text-white border-brand"
                        : "border-border text-[#8b1a1a]",
                    )}
                  >
                    {row.isBlocked ? "Unblock" : "Block"}
                  </button>
                ),
            },
          ]}
        />
      </ApiState>
    </div>
  );
}
