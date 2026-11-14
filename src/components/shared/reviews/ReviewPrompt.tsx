"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCreateReviewMutation, useGetMyReviewsQuery } from "@/redux/api/reviewApi";

/* eslint-disable @typescript-eslint/no-explicit-any */

function extractRows(data: unknown): any[] {
  const raw = (data as any)?.data?.result || (data as any)?.data || data;
  return Array.isArray(raw) ? raw : [];
}

export default function ReviewPrompt({
  jobId,
  providerName,
}: {
  jobId: string;
  providerName?: string;
}) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);

  const { data: myReviews } = useGetMyReviewsQuery({ limit: 50 });
  const [createReview, { isLoading }] = useCreateReviewMutation();

  const alreadyReviewed = extractRows(myReviews).some((r) => {
    const id =
      typeof r.jobId === "string" ? r.jobId : r.jobId?._id || r.jobId?.id;
    return String(id) === String(jobId);
  });

  if (alreadyReviewed || done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
        Thanks — your review helps other neighbors hire with confidence.
      </div>
    );
  }

  const submit = async () => {
    try {
      await createReview({
        jobId,
        rating,
        comment: comment.trim() || undefined,
      }).unwrap();
      setDone(true);
      toast.success("Review submitted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not submit review");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
        Rate your pro
      </p>
      <h3 className="mt-1 font-fraunces text-xl font-semibold text-ink">
        How was {providerName?.split(" ")[0] || "your provider"}?
      </h3>
      <p className="mt-1 text-sm text-muted">
        One honest rating keeps the marketplace trustworthy.
      </p>

      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => {
          const active = (hover || rating) >= value;
          return (
            <button
              key={value}
              type="button"
              aria-label={`${value} stars`}
              onMouseEnter={() => setHover(value)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(value)}
              className="p-1"
            >
              <Star
                className={cn(
                  "size-7 transition-colors",
                  active
                    ? "fill-amber-400 text-amber-400"
                    : "text-stone-300",
                )}
              />
            </button>
          );
        })}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="Optional — what went well?"
        className="mt-4 w-full rounded-xl border border-border bg-cream/40 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
      />

      <button
        type="button"
        disabled={isLoading}
        onClick={() => void submit()}
        className="app-btn mt-3 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? "Sending…" : "Submit review"}
      </button>
    </div>
  );
}
