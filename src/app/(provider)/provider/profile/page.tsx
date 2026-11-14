"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Check,
  Star,
  ShieldCheck,
  User,
  Mail,
  Phone,
  MapPin,
  Landmark,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { JOB_CATEGORIES } from "@/lib/marketplace/constants";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/app/PageHeader";
import Avatar from "@/components/shared/app/Avatar";
import ApiState from "@/components/shared/app/ApiState";
import { ROUTES } from "@/utils/navigation";
import PaymentDetailsForm from "@/components/shared/payments/PaymentDetailsForm";
import { useDemoAuth } from "@/components/providers/DemoAuthProvider";
import { useEditProfileMutation, useGetMeQuery } from "@/redux/api/userApi";
import { useGetProviderAnalyticsQuery } from "@/redux/api/analyticsApi";
import { unwrapOne } from "@/lib/api/rows";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ProviderProfilePage() {
  const { user } = useDemoAuth();
  const { data: meRes, isLoading, isError, refetch } = useGetMeQuery(undefined);
  const { data: analyticsRes } = useGetProviderAnalyticsQuery({});
  const [editProfile, { isLoading: saving }] = useEditProfileMutation();

  const me = unwrapOne<any>(meRes) || (meRes as any)?.data;
  const analytics = (analyticsRes as any)?.data;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState("12");
  const [categories, setCategories] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!me) return;
    setName(me.name || user?.name || "");
    setEmail(me.email || user?.email || "");
    setPhone(me.phone || "");
    setBio(me.bio || me.description || "");
    setAddress(me.location?.address || "");
    setRadius(String(me.serviceRadiusKm || me.radiusKm || 12));
    const cats: string[] = Array.isArray(me.categories) ? me.categories : [];
    setCategories(
      cats.map((c) =>
        c
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
      ),
    );
  }, [me, user?.email, user?.name]);

  function toggleCategory(c: string) {
    setCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          name,
          phone,
          bio,
          categories: categories.map((c) => c.toLowerCase()),
          serviceRadiusKm: Number(radius) || 12,
          location: address
            ? {
                type: "Point",
                coordinates: me?.location?.coordinates || [90.4043, 23.7937],
                address,
              }
            : undefined,
        }),
      );
      await editProfile(formData).unwrap();
      setSaved(true);
      toast.success("Profile updated");
      window.setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not save profile");
    }
  }

  const memberSince = me?.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
      }).format(new Date(me.createdAt))
    : "—";
  const rating =
    analytics?.reviews?.average ??
    (me?.trustScore ? Number((Number(me.trustScore) / 20).toFixed(1)) : 0);
  const jobsDone =
    analytics?.jobs?.completed ?? me?.totalJobs ?? 0;
  const payout =
    me?.localPayout?.bkashNumber
      ? `bKash ···· ${String(me.localPayout.bkashNumber).slice(-4)}`
      : me?.stripeAccountStatus === "active"
        ? "Stripe Connect"
        : "Not configured";

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        eyebrow="Provider Account"
        title="Profile & skills"
        description="Manage your professional bio, service radius, trade categories, and payout settings."
      />

      <ApiState
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        errorMessage="Could not load your provider profile."
      >
        <div className="grid lg:grid-cols-12 gap-6 items-start animate-fade-up">
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-stone-100 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center shadow-xs">
              <Avatar name={name || "Provider"} size="xl" />
              <h2 className="font-fraunces text-2xl font-bold text-ink mt-4">
                {name || "Provider"}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {me?.isApproved ? "Verified Specialist" : "Pending approval"}
                </span>
                <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {rating || "—"} Rating
                </span>
              </div>

              <p className="text-xs text-muted font-medium mt-3">
                Member since {memberSince}
              </p>

              <div className="grid grid-cols-2 gap-3 w-full mt-6 pt-6 border-t border-stone-200/70">
                <div className="bg-white rounded-2xl p-3 shadow-xs">
                  <div className="text-xs font-bold text-muted uppercase">Jobs Done</div>
                  <div className="font-fraunces text-xl font-bold text-ink mt-0.5">
                    {jobsDone}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-xs">
                  <div className="text-xs font-bold text-muted uppercase">Radius</div>
                  <div className="font-fraunces text-xl font-bold text-brand mt-0.5">
                    {radius} km
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-stone-100 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider">
                <Landmark className="size-4 text-brand" />
                <span>Automated Direct Payouts</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Payout Destination:{" "}
                <strong className="text-ink">{payout}</strong>. Money transfers
                automatically when customers approve completed work.
              </p>
              <Link
                href={ROUTES.PROVIDER_PAYOUTS}
                className="inline-block text-xs font-bold text-brand hover:underline"
              >
                Configure Bank Payouts →
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-stone-100 rounded-3xl p-6 md:p-8 space-y-5 shadow-xs"
            >
              <h3 className="font-fraunces text-xl font-bold text-ink border-b border-stone-200/70 pb-3">
                Specialist Profile
              </h3>

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
                  <User className="size-4 text-muted" />
                  Full Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl bg-white px-4 py-3.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-medium shadow-xs"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
                    <Mail className="size-4 text-muted" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full rounded-2xl bg-white/70 px-4 py-3.5 text-muted text-sm font-medium shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
                    <Phone className="size-4 text-muted" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl bg-white px-4 py-3.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-medium shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5">
                  Professional Bio &amp; Experience
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-2xl bg-white px-4 py-3.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-medium resize-none shadow-xs"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
                    <MapPin className="size-4 text-muted" />
                    Base Location
                  </label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-2xl bg-white px-4 py-3.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-medium shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-ink mb-1.5">
                    Service Radius (km)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={radius}
                    onChange={(e) => setRadius(e.target.value)}
                    className="w-full rounded-2xl bg-white px-4 py-3.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-medium shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-2">
                  Trade Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {JOB_CATEGORIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCategory(c)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200",
                        categories.includes(c)
                          ? "bg-brand text-white shadow-xs"
                          : "bg-white text-warm hover:bg-stone-200/80",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand hover:bg-brand-dark text-white font-bold px-8 py-3.5 text-sm shadow-md shadow-brand/25 transition-all duration-300 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save Changes
                </button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 bg-emerald-100 px-3.5 py-1.5 rounded-full animate-fade-in">
                    <Check className="size-4" />
                    Profile updated successfully
                  </span>
                )}
              </div>
            </form>

            <div className="mt-6">
              <PaymentDetailsForm role="provider" />
            </div>
          </div>
        </div>
      </ApiState>
    </div>
  );
}
