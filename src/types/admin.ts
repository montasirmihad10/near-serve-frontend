import type { JobStatus, PaymentStatus } from "@/types/job";

export type AdminProviderRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  categories: string[];
  isApproved: boolean;
  rating: number;
  jobsCompleted: number;
  memberSince: string;
  city: string;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "provider" | "admin";
  isBlocked: boolean;
  jobsCount: number;
  createdAt: string;
};

export type AdminJobRow = {
  id: string;
  title: string;
  category: string;
  customerName: string;
  providerName?: string;
  budget: number;
  status: JobStatus | "cancelled";
  createdAt: string;
  city: string;
};

export type AdminPaymentRow = {
  id: string;
  jobId: string;
  jobTitle: string;
  customerName: string;
  providerName: string;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  method: string;
};

export type AdminDisputeRow = {
  id: string;
  jobId: string;
  jobTitle: string;
  customerName: string;
  providerName: string;
  amount: number;
  reason: string;
  status: "open" | "resolved_customer" | "resolved_provider" | "resolved_split";
  openedAt: string;
};

export type AdminReviewRow = {
  id: string;
  jobId: string;
  jobTitle: string;
  reviewerName: string;
  revieweeName: string;
  rating: number;
  comment: string;
  createdAt: string;
};
