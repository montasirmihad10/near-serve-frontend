import Link from "next/link";
import { MapPin, MessageSquare, Clock, ArrowRight } from "lucide-react";
import type { Job } from "@/types/job";
import { ROUTES } from "@/utils/navigation";
import StatusChip from "./StatusChip";
import { formatCurrency, formatRelativeTime } from "@/lib/customer/format";

type JobCardProps = {
  job: Job;
  index?: number;
};

export default function JobCard({ job, index = 0 }: JobCardProps) {
  return (
    <Link
      href={ROUTES.CUSTOMER_JOB(job.id)}
      className="group block overflow-hidden rounded-[1.35rem] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(26,18,8,0.06),0_12px_32px_-18px_rgba(26,18,8,0.12)] transition-all duration-400 active:scale-[0.99] hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_0_0_1px_rgba(26,18,8,0.08),0_22px_44px_-20px_rgba(26,18,8,0.18)] animate-fade-up sm:rounded-[1.5rem] sm:p-6"
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <StatusChip status={job.status} />
        <span className="flex items-center gap-1 text-xs font-medium tabular-nums text-muted">
          <Clock className="h-3 w-3 text-muted/70" />
          {formatRelativeTime(job.updatedAt)}
        </span>
      </div>

      <h3 className="font-fraunces text-lg font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand sm:text-xl">
        {job.title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
        {job.description}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-2.5 py-1 text-stone-700">
            <MapPin className="size-3 text-brand" />
            <span className="max-w-[160px] truncate">{job.location.address}</span>
          </span>
          <span className="rounded-full bg-brand/10 px-2.5 py-1 font-bold text-brand">
            {formatCurrency(job.budget)}
          </span>
          {job.bidCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-800">
              <MessageSquare className="size-3 text-emerald-600" />
              {job.bidCount} bid{job.bidCount === 1 ? "" : "s"}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-bold text-brand transition-transform duration-300 group-hover:translate-x-1">
          View details
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
