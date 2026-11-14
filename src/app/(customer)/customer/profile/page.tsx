"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, ShieldCheck, User, Mail, Phone, MapPin, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/shared/app/PageHeader";
import Avatar from "@/components/shared/app/Avatar";
import ApiState from "@/components/shared/app/ApiState";
import PaymentDetailsForm from "@/components/shared/payments/PaymentDetailsForm";
import { useDemoAuth } from "@/components/providers/DemoAuthProvider";
import { useEditProfileMutation, useGetMeQuery } from "@/redux/api/userApi";
import { useGetCustomerAnalyticsQuery } from "@/redux/api/analyticsApi";
import { unwrapOne } from "@/lib/api/rows";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function ProfilePage() {
  const { user } = useDemoAuth();
  const { data: meRes, isLoading, isError, refetch } = useGetMeQuery(undefined);
  const { data: analyticsRes } = useGetCustomerAnalyticsQuery({});
  const [editProfile, { isLoading: saving }] = useEditProfileMutation();

  const me = unwrapOne<any>(meRes) || (meRes as any)?.data;
  const stats = (analyticsRes as any)?.data;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!me) return;
    setName(me.name || user?.name || "");
    setEmail(me.email || user?.email || "");
    setPhone(me.phone || "");
    setAddress(me.location?.address || "");
  }, [me, user?.email, user?.name]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({
          name,
          phone,
          location: address
            ? {
                type: "Point",
                coordinates: me?.location?.coordinates || [90.4125, 23.8103],
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

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        eyebrow="Account Details"
        title="Profile & settings"
        description="Manage your contact details, service address, and security preferences."
      />

      <ApiState
        isLoading={isLoading}
        isError={isError}
        onRetry={() => void refetch()}
        errorMessage="Could not load your profile."
      >
        <div className="grid lg:grid-cols-12 gap-6 items-start animate-fade-up">
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-stone-100 rounded-3xl p-6 md:p-8 flex flex-col items-center text-center shadow-xs">
              <Avatar name={name || "Customer"} size="xl" />
              <h2 className="font-fraunces text-2xl font-bold text-ink mt-4">
                {name || "Customer"}
              </h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {me?.isVerified ? "Verified Customer Account" : "Customer Account"}
              </span>
              <p className="text-xs text-muted font-medium mt-3">
                Member since {memberSince}
              </p>

              <div className="grid grid-cols-2 gap-3 w-full mt-6 pt-6 border-t border-stone-200/70">
                <div className="bg-white rounded-2xl p-3 shadow-xs">
                  <div className="text-xs font-bold text-muted uppercase">Jobs Posted</div>
                  <div className="font-fraunces text-xl font-bold text-ink mt-0.5">
                    {Number(stats?.totalJobs ?? stats?.completedJobs ?? 0) || "—"}
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-xs">
                  <div className="text-xs font-bold text-muted uppercase">Completed</div>
                  <div className="font-fraunces text-xl font-bold text-amber-600 mt-0.5">
                    {Number(stats?.completedJobs) || 0}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-stone-100 rounded-3xl p-5 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-white text-brand flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="size-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-ink uppercase tracking-wider">
                  Privacy Protected
                </div>
                <p className="text-xs text-muted leading-relaxed mt-0.5">
                  Your full phone number and address are only shared with the specific provider you hire for a confirmed job.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="bg-stone-100 rounded-3xl p-6 md:p-8 space-y-5 shadow-xs"
            >
              <h3 className="font-fraunces text-xl font-bold text-ink border-b border-stone-200/70 pb-3">
                Personal Information
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

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
                  <Mail className="size-4 text-muted" />
                  Email Address
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
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl bg-white px-4 py-3.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-medium shadow-xs"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1.5 flex items-center gap-2">
                  <MapPin className="size-4 text-muted" />
                  Default Service Address
                </label>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-2xl bg-white px-4 py-3.5 text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 text-sm font-medium shadow-xs"
                />
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
                    Settings updated successfully
                  </span>
                )}
              </div>
            </form>

            <div className="mt-6">
              <PaymentDetailsForm role="customer" />
            </div>
          </div>
        </div>
      </ApiState>
    </div>
  );
}
