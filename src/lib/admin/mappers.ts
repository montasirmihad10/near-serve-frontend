/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  AdminDisputeRow,
  AdminJobRow,
  AdminPaymentRow,
  AdminProviderRow,
  AdminReviewRow,
  AdminUserRow,
} from "@/types/admin";
import type { PaymentStatus } from "@/types/job";

export function extractAdminRows(data: unknown): any[] {
  const raw = (data as any)?.data?.result || (data as any)?.data || data;
  return Array.isArray(raw) ? raw : [];
}

export function unwrapAdminData(data: unknown): any {
  return (data as any)?.data ?? data ?? null;
}

export function mapAdminProvider(raw: any): AdminProviderRow {
  const user = raw.userId && typeof raw.userId === "object" ? raw.userId : {};
  return {
    id: String(raw._id || raw.id),
    name: user.name || raw.name || "Provider",
    email: user.email || raw.email || "",
    phone: user.phone || raw.phone || "—",
    city: raw.city || raw.location?.city || "—",
    categories: Array.isArray(raw.categories) && raw.categories.length
      ? raw.categories
      : ["General"],
    isApproved: !!(user.isApproved ?? raw.isApproved),
    rating: raw.trustScore
      ? Number((Number(raw.trustScore) / 20).toFixed(1))
      : Number(raw.rating) || 0,
    jobsCompleted: Number(raw.totalJobs ?? raw.jobsCompleted) || 0,
    memberSince:
      raw.createdAt || user.createdAt || new Date().toISOString(),
  };
}

export function mapAdminUser(raw: any): AdminUserRow {
  const role = (raw.role || "customer") as AdminUserRow["role"];
  return {
    id: String(raw._id || raw.id),
    name: raw.name || "User",
    email: raw.email || "",
    role:
      role === "provider" || role === "admin" || role === "customer"
        ? role
        : "customer",
    isBlocked: !!raw.isDeleted || !!raw.isBlocked,
    jobsCount: Number(raw.jobsCount) || 0,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export function mapAdminJob(raw: any): AdminJobRow {
  const customer =
    raw.customerId && typeof raw.customerId === "object" ? raw.customerId : {};
  const providerUser =
    raw.selectedProvider?.userId &&
    typeof raw.selectedProvider.userId === "object"
      ? raw.selectedProvider.userId
      : raw.selectedProvider && typeof raw.selectedProvider === "object"
        ? raw.selectedProvider
        : {};
  const location = raw.location || {};

  return {
    id: String(raw._id || raw.id),
    title: raw.title || "Untitled job",
    category: raw.category || "General",
    customerName: customer.name || raw.customerName || "Customer",
    providerName: providerUser.name || raw.providerName || undefined,
    budget: Number(raw.budget) || 0,
    status: (raw.status || "open") as AdminJobRow["status"],
    createdAt: raw.createdAt || new Date().toISOString(),
    city: location.address || location.city || raw.city || "—",
  };
}

export function mapPaymentStatus(status: string | undefined): PaymentStatus {
  if (status === "authorized") return "held";
  if (status === "captured") return "released";
  if (
    status === "held" ||
    status === "released" ||
    status === "refunded" ||
    status === "pending" ||
    status === "disputed"
  ) {
    return status;
  }
  return "pending";
}

export function mapAdminPayment(raw: any): AdminPaymentRow {
  const job = raw.jobId && typeof raw.jobId === "object" ? raw.jobId : null;
  const customer =
    raw.customerId && typeof raw.customerId === "object" ? raw.customerId : {};
  const providerDoc =
    raw.providerId && typeof raw.providerId === "object" ? raw.providerId : null;
  const providerUser =
    providerDoc?.userId && typeof providerDoc.userId === "object"
      ? providerDoc.userId
      : providerDoc || {};
  const jobId =
    (typeof raw.jobId === "string" ? raw.jobId : job?._id || job?.id) || "";

  return {
    id: String(raw._id || raw.id),
    jobId: String(jobId),
    jobTitle: job?.title || raw.jobTitle || "Service job",
    customerName: customer.name || raw.customerName || "Customer",
    providerName: providerUser.name || raw.providerName || "Provider",
    amount: Number(raw.amount) || 0,
    status: mapPaymentStatus(raw.status),
    createdAt: raw.createdAt || new Date().toISOString(),
    method: raw.method || raw.paymentMethod || "card",
  };
}

export function mapAdminDispute(raw: any): AdminDisputeRow {
  const job = raw.jobId && typeof raw.jobId === "object" ? raw.jobId : raw;
  const payment =
    raw.paymentId && typeof raw.paymentId === "object" ? raw.paymentId : null;
  const customer =
    (raw.customerId && typeof raw.customerId === "object"
      ? raw.customerId
      : null) ||
    (job?.customerId && typeof job.customerId === "object"
      ? job.customerId
      : {}) ||
    {};
  const providerUser =
    job?.selectedProvider?.userId &&
    typeof job.selectedProvider.userId === "object"
      ? job.selectedProvider.userId
      : raw.providerId && typeof raw.providerId === "object"
        ? raw.providerId
        : {};

  const jobId =
    (typeof raw.jobId === "string" ? raw.jobId : job?._id || job?.id) ||
    raw._id ||
    raw.id;

  const statusRaw = String(raw.status || job?.status || "open").toLowerCase();
  let status: AdminDisputeRow["status"] = "open";
  if (statusRaw === "disputed" || statusRaw === "open") {
    status = "open";
  } else if (
    statusRaw === "resolved_customer" ||
    statusRaw === "refund_customer" ||
    statusRaw === "customer"
  ) {
    status = "resolved_customer";
  } else if (
    statusRaw === "resolved_provider" ||
    statusRaw === "release_to_provider" ||
    statusRaw === "pay_provider" ||
    statusRaw === "provider"
  ) {
    status = "resolved_provider";
  } else if (
    statusRaw === "resolved_split" ||
    statusRaw === "partial_refund" ||
    statusRaw === "split" ||
    statusRaw === "resolved" ||
    statusRaw === "closed"
  ) {
    status = "resolved_split";
  }

  return {
    id: String(raw._id || raw.id || `disp-${jobId}`),
    jobId: String(jobId),
    jobTitle: job?.title || raw.jobTitle || raw.title || "Disputed job",
    customerName: customer.name || raw.customerName || "Customer",
    providerName: providerUser.name || raw.providerName || "Provider",
    amount: Number(raw.amount ?? payment?.amount ?? job?.budget) || 0,
    reason: raw.reason || raw.description || raw.message || "Dispute opened",
    status,
    openedAt:
      raw.openedAt ||
      raw.createdAt ||
      job?.updatedAt ||
      new Date().toISOString(),
  };
}

export function mapAdminReview(raw: any): AdminReviewRow {
  const customer =
    raw.customerId && typeof raw.customerId === "object" ? raw.customerId : {};
  const provider =
    raw.providerId && typeof raw.providerId === "object" ? raw.providerId : {};
  const providerUser =
    provider.userId && typeof provider.userId === "object"
      ? provider.userId
      : provider;
  const job = raw.jobId && typeof raw.jobId === "object" ? raw.jobId : null;

  return {
    id: String(raw._id || raw.id),
    jobId: String(
      typeof raw.jobId === "string" ? raw.jobId : job?._id || job?.id || "",
    ),
    jobTitle: job?.title || raw.jobTitle || "Service job",
    reviewerName: customer.name || raw.reviewerName || "Customer",
    revieweeName: providerUser.name || raw.revieweeName || "Provider",
    rating: Number(raw.rating) || 0,
    comment: raw.comment || raw.review || "",
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}
