"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/shared/app/PageHeader";
import DashPanel from "@/components/shared/app/DashPanel";
import {
  useGetAllAboutQuery,
  useGetAllPrivacyQuery,
  useGetAllTermsQuery,
  useUpdateAboutMutation,
  useUpdatePrivacyMutation,
  useUpdateTermsMutation,
} from "@/redux/api/settingsApi";
import { useRecalculateAllScoresMutation } from "@/redux/api/aiApi";
import { useAdminGetEarningsQuery } from "@/redux/api/adminApi";
import { formatCurrency } from "@/lib/customer/format";
import { unwrapAdminData } from "@/lib/admin/mappers";

/* eslint-disable @typescript-eslint/no-explicit-any */

function firstDescription(data: unknown): string {
  const payload = unwrapAdminData(data);
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) {
    return payload[0]?.description || "";
  }
  return payload?.description || "";
}

export default function AdminSettingsPage() {
  const { data: aboutData } = useGetAllAboutQuery({});
  const { data: privacyData } = useGetAllPrivacyQuery({});
  const { data: termsData } = useGetAllTermsQuery({});
  const { data: earningsData } = useAdminGetEarningsQuery({ limit: 1 });

  const [updateAbout, { isLoading: savingAbout }] = useUpdateAboutMutation();
  const [updatePrivacy, { isLoading: savingPrivacy }] =
    useUpdatePrivacyMutation();
  const [updateTerms, { isLoading: savingTerms }] = useUpdateTermsMutation();
  const [recalcScores, { isLoading: recalcing }] =
    useRecalculateAllScoresMutation();

  const [about, setAbout] = useState("");
  const [privacy, setPrivacy] = useState("");
  const [terms, setTerms] = useState("");

  useEffect(() => {
    setAbout(firstDescription(aboutData));
  }, [aboutData]);
  useEffect(() => {
    setPrivacy(firstDescription(privacyData));
  }, [privacyData]);
  useEffect(() => {
    setTerms(firstDescription(termsData));
  }, [termsData]);

  const earnings = unwrapAdminData(earningsData);
  const summary = earnings?.summary || {};

  const save = async (
    kind: "about" | "privacy" | "terms",
    value: string,
  ) => {
    try {
      if (kind === "about") await updateAbout({ description: value }).unwrap();
      if (kind === "privacy")
        await updatePrivacy({ description: value }).unwrap();
      if (kind === "terms") await updateTerms({ description: value }).unwrap();
      toast.success(`${kind[0].toUpperCase()}${kind.slice(1)} updated`);
    } catch (err: any) {
      toast.error(err?.data?.message || `Could not update ${kind}`);
    }
  };

  const runRecalc = async () => {
    try {
      await recalcScores({}).unwrap();
      toast.success("Trust scores recalculated");
    } catch (err: any) {
      toast.error(err?.data?.message || "Recalculation failed");
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Live · Platform CMS"
        title="Settings"
        description="Manage legal pages, review platform earnings, and run admin maintenance tools."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <DashPanel>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
            Captured volume
          </p>
          <p className="mt-2 font-fraunces text-3xl font-semibold tabular-nums text-ink">
            {formatCurrency(Number(summary.totalVolume) || 0)}
          </p>
        </DashPanel>
        <DashPanel>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
            Net platform commission
          </p>
          <p className="mt-2 font-fraunces text-3xl font-semibold tabular-nums text-ink">
            {formatCurrency(Number(summary.totalActualCommission) || 0)}
          </p>
        </DashPanel>
      </div>

      {(
        [
          ["about", "About", about, setAbout, savingAbout],
          ["privacy", "Privacy policy", privacy, setPrivacy, savingPrivacy],
          ["terms", "Terms of service", terms, setTerms, savingTerms],
        ] as const
      ).map(([key, label, value, setter, saving]) => (
        <div key={key} className="app-surface rounded-2xl p-5 space-y-3">
          <h2 className="font-fraunces text-lg font-semibold text-ink">
            {label}
          </h2>
          <textarea
            value={value}
            onChange={(e) => setter(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
          />
          <button
            type="button"
            disabled={saving || !value.trim()}
            onClick={() => void save(key, value)}
            className="app-btn rounded-xl bg-ink text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
          >
            Save {label.toLowerCase()}
          </button>
        </div>
      ))}

      <div className="app-surface rounded-2xl p-5 space-y-3">
        <h2 className="font-fraunces text-lg font-semibold text-ink">
          Maintenance
        </h2>
        <p className="text-sm text-muted">
          Recalculate provider trust scores from reviews, completion, and
          dispute history.
        </p>
        <button
          type="button"
          disabled={recalcing}
          onClick={() => void runRecalc()}
          className="app-btn rounded-xl border border-border text-sm font-semibold px-4 py-2.5 disabled:opacity-60"
        >
          {recalcing ? "Recalculating…" : "Recalculate trust scores"}
        </button>
      </div>
    </div>
  );
}
