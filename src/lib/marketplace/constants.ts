/** Shared marketplace category labels (UI). Backend stores lowercase slugs. */
export const JOB_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Moving",
  "Handyman",
  "Painting",
  "Landscaping",
  "Appliance Repair",
  "AC",
] as const;

export type JobCategoryLabel = (typeof JOB_CATEGORIES)[number];

export function formatDistance(km: number): string {
  if (!Number.isFinite(km)) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function toCategorySlug(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}
