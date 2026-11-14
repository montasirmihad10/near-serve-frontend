"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Smartphone, CreditCard, Banknote } from "lucide-react";
import { toast } from "sonner";
import { useEditProfileMutation, useGetMeQuery } from "@/redux/api/userApi";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
  type ProviderLocalPayout,
} from "@/types/payment";
import { cn } from "@/lib/utils";

type Role = "customer" | "provider";

function unwrapMe(res: unknown): Record<string, unknown> | null {
  if (!res || typeof res !== "object") return null;
  const r = res as { data?: Record<string, unknown> };
  return (r.data as Record<string, unknown>) || (res as Record<string, unknown>);
}

export default function PaymentDetailsForm({ role }: { role: Role }) {
  const { data: meRes, isLoading } = useGetMeQuery(undefined);
  const [editProfile, { isLoading: saving }] = useEditProfileMutation();
  const me = unwrapMe(meRes);
  const prefs = (me?.paymentPreferences || {}) as {
    preferredMethod?: PaymentMethod;
    bkashNumber?: string;
    nagadNumber?: string;
  };
  const providerDoc =
    role === "provider"
      ? ((me as { localPayout?: ProviderLocalPayout })?.localPayout ||
          (
            me as {
              provider?: { localPayout?: ProviderLocalPayout };
            }
          )?.provider?.localPayout ||
          {})
      : {};

  const [preferredMethod, setPreferredMethod] = useState<PaymentMethod>("stripe");
  const [bkashNumber, setBkashNumber] = useState("");
  const [nagadNumber, setNagadNumber] = useState("");
  const [acceptsCod, setAcceptsCod] = useState(true);
  const [acceptsBkash, setAcceptsBkash] = useState(true);
  const [acceptsNagad, setAcceptsNagad] = useState(true);
  const [providerBkash, setProviderBkash] = useState("");
  const [providerNagad, setProviderNagad] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!me) return;
    setPreferredMethod(prefs.preferredMethod || "stripe");
    setBkashNumber(prefs.bkashNumber || "");
    setNagadNumber(prefs.nagadNumber || "");
    if (role === "provider") {
      setAcceptsCod(providerDoc.acceptsCod !== false);
      setAcceptsBkash(providerDoc.acceptsBkash !== false);
      setAcceptsNagad(providerDoc.acceptsNagad !== false);
      setProviderBkash(providerDoc.bkashNumber || "");
      setProviderNagad(providerDoc.nagadNumber || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meRes, role]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload: Record<string, unknown> = {
        paymentPreferences: {
          preferredMethod,
          bkashNumber: bkashNumber.trim() || null,
          nagadNumber: nagadNumber.trim() || null,
        },
      };
      if (role === "provider") {
        payload.localPayout = {
          acceptsCod,
          acceptsBkash,
          acceptsNagad,
          bkashNumber: providerBkash.trim() || null,
          nagadNumber: providerNagad.trim() || null,
        };
      }
      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));
      await editProfile(fd).unwrap();
      setSaved(true);
      toast.success("Payment details saved");
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Could not save payment details";
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white p-6 text-sm text-muted shadow-[inset_0_0_0_1px_rgba(26,18,8,0.06)]">
        Loading payment details…
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-3xl bg-white p-5 shadow-[inset_0_0_0_1px_rgba(26,18,8,0.06),0_12px_32px_-18px_rgba(26,18,8,0.1)] sm:p-6 md:p-8"
    >
      <div className="border-b border-border/70 pb-3">
        <h3 className="font-fraunces text-xl font-bold text-ink">
          Payment methods
        </h3>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          Stripe card hold for escrow, plus cash on delivery, bKash, and Nagad.
          Keep your numbers updated so checkout is one tap.
        </p>
      </div>

      {role === "customer" && (
        <>
          <div>
            <p className="mb-2 text-sm font-bold text-ink">Preferred method</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map(
                (m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPreferredMethod(m)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors",
                      preferredMethod === m
                        ? "border-ink bg-ink text-white"
                        : "border-border bg-cream text-warm hover:bg-white",
                    )}
                  >
                    {m === "stripe" ? (
                      <CreditCard className="mx-auto mb-1 size-4" />
                    ) : m === "cod" ? (
                      <Banknote className="mx-auto mb-1 size-4" />
                    ) : (
                      <Smartphone className="mx-auto mb-1 size-4" />
                    )}
                    {m === "stripe"
                      ? "Card"
                      : m === "cod"
                        ? "Cash"
                        : m === "bkash"
                          ? "bKash"
                          : "Nagad"}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-ink">
                <Smartphone className="size-4 text-pink-600" />
                Your bKash number
              </span>
              <input
                type="tel"
                value={bkashNumber}
                onChange={(e) => setBkashNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-2xl border border-border bg-cream px-4 py-3.5 text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-ink">
                <Smartphone className="size-4 text-orange-600" />
                Your Nagad number
              </span>
              <input
                type="tel"
                value={nagadNumber}
                onChange={(e) => setNagadNumber(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-2xl border border-border bg-cream px-4 py-3.5 text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>
          </div>
        </>
      )}

      {role === "provider" && (
        <>
          <div>
            <p className="mb-2 text-sm font-bold text-ink">Accept on jobs</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["cod", acceptsCod, setAcceptsCod, "Cash on delivery"],
                  ["bkash", acceptsBkash, setAcceptsBkash, "bKash"],
                  ["nagad", acceptsNagad, setAcceptsNagad, "Nagad"],
                ] as const
              ).map(([key, on, setOn, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOn(!on)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-bold transition-colors",
                    on
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-border bg-cream text-muted",
                  )}
                >
                  {on ? "✓ " : ""}
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted">
              Stripe Connect remains available from Payouts for card escrow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-ink">
                Receive on bKash
              </span>
              <input
                type="tel"
                value={providerBkash}
                onChange={(e) => setProviderBkash(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-2xl border border-border bg-cream px-4 py-3.5 text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-sm font-bold text-ink">
                Receive on Nagad
              </span>
              <input
                type="tel"
                value={providerNagad}
                onChange={(e) => setProviderNagad(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full rounded-2xl border border-border bg-cream px-4 py-3.5 text-sm font-medium text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/15"
              />
            </label>
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="app-btn rounded-2xl bg-brand px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-brand/20 hover:bg-brand-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save payment details"}
        </button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-sm font-bold text-emerald-800">
            <Check className="size-4" />
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
