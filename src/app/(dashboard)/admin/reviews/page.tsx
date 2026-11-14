"use client";

import { Star } from "lucide-react";
import { toast } from "sonner";
import type { AdminReviewRow } from "@/types/admin";
import AdminDataTable from "@/components/admin/AdminDataTable";
import PageHeader from "@/components/shared/app/PageHeader";
import ApiState from "@/components/shared/app/ApiState";
import { useClientPagination } from "@/hooks/useClientPagination";
import { formatDate } from "@/lib/customer/format";
import {
  useAdminDeleteReviewMutation,
  useAdminGetAllReviewsQuery,
} from "@/redux/api/adminApi";
import { extractAdminRows, mapAdminReview } from "@/lib/admin/mappers";

export default function AdminReviewsPage() {
  const { data, isLoading, isError, refetch } = useAdminGetAllReviewsQuery({
    sort: "-createdAt",
    limit: 100,
  });
  const [deleteReviewMutation] = useAdminDeleteReviewMutation();

  const rows = extractAdminRows(data).map(mapAdminReview);

  const pagination = useClientPagination(rows, 8);

  const remove = async (review: AdminReviewRow) => {
    try {
      await deleteReviewMutation(review.id).unwrap();
      toast.success("Review deleted");
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        "Could not delete review";
      toast.error(message);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Live · GET /admin/reviews"
        title="Reviews"
        description="Moderate public reviews. Delete spam or abusive content."
      />

      <ApiState
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        errorMessage="Could not load reviews from the API."
      >
        <AdminDataTable<AdminReviewRow>
          title="Review list"
          description="DELETE /admin/reviews/:reviewId"
          data={pagination.pageItems}
          totalItems={pagination.totalItems}
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          emptyText="No reviews left."
          columns={[
            {
              key: "jobTitle",
              title: "Job",
              render: (row) => (
                <div>
                  <p className="font-medium text-ink">{row.jobTitle}</p>
                  <p className="text-xs text-muted line-clamp-1">{row.comment}</p>
                </div>
              ),
            },
            {
              key: "reviewerName",
              title: "From",
            },
            {
              key: "revieweeName",
              title: "About",
            },
            {
              key: "rating",
              title: "Rating",
              render: (row) => (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  {row.rating}
                </span>
              ),
            },
            {
              key: "createdAt",
              title: "Date",
              render: (row) => formatDate(row.createdAt),
            },
            {
              key: "actions",
              title: "",
              align: "right",
              render: (row) => (
                <button
                  type="button"
                  onClick={() => void remove(row)}
                  className="rounded-lg border border-border text-xs font-semibold px-2.5 py-1.5 text-[#8b1a1a]"
                >
                  Delete
                </button>
              ),
            },
          ]}
        />
      </ApiState>
    </div>
  );
}
