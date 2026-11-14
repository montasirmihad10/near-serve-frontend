"use client";

import Link from "next/link";
import {
  HardHat,
  Users,
  Briefcase,
  Scale,
  CreditCard,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { formatCurrency } from "@/lib/customer/format";
import { ROUTES } from "@/utils/navigation";
import PageHeader from "@/components/shared/app/PageHeader";
import DashStat from "@/components/shared/app/DashStat";
import DashPanel from "@/components/shared/app/DashPanel";
import AdminBadge from "@/components/admin/AdminBadge";
import { useGetAdminAnalyticsQuery } from "@/redux/api/analyticsApi";
import {
  useAdminGetAllPaymentsQuery,
  useGetAllDisputesQuery,
  useGetAllProvidersQuery,
} from "@/redux/api/adminApi";
import {
  extractAdminRows,
  mapAdminDispute,
  mapAdminPayment,
  mapAdminProvider,
} from "@/lib/admin/mappers";

export default function AdminOverviewPage() {
  const { data: analyticsResponse } = useGetAdminAnalyticsQuery({});
  const liveStats = analyticsResponse?.data;

  const { data: providersData } = useGetAllProvidersQuery({
    sort: "-createdAt",
    limit: 100,
  });
  const { data: disputesData } = useGetAllDisputesQuery({
    sort: "-createdAt",
    limit: 100,
  });
  const { data: paymentsData } = useAdminGetAllPaymentsQuery({
    sort: "-createdAt",
    limit: 100,
  });

  const providers = extractAdminRows(providersData).map(mapAdminProvider);
  const disputes = extractAdminRows(disputesData).map(mapAdminDispute);
  const payments = extractAdminRows(paymentsData).map(mapAdminPayment);

  const totalUsers =
    (liveStats?.users?.totalCustomers || 0) +
    (liveStats?.users?.totalProviders || 0);
  const activeJobsCount = liveStats?.jobs?.active ?? 0;
  const openDisputesCount =
    liveStats?.jobs?.disputed ??
    disputes.filter((d) => d.status === "open").length;

  const pendingProviders = providers.filter((p) => !p.isApproved);
  const openDisputes = disputes.filter((d) => d.status === "open");
  const heldPay = payments.filter((p) => p.status === "held");
  const heldTotal = heldPay.reduce((s, p) => s + p.amount, 0);
  const monthly = Array.isArray(liveStats?.revenue?.monthly)
    ? liveStats.revenue.monthly
    : [];
  const latestMonth = monthly.length ? monthly[monthly.length - 1] : null;
  const gmvMonth =
    Number(latestMonth?.volume) ||
    Number(liveStats?.revenue?.totalVolume) ||
    0;
  const revenueGrowth = Number(liveStats?.revenue?.growthPercent);
  const feeCollected =
    Number(latestMonth?.commission) ||
    Number(liveStats?.revenue?.totalCommission) ||
    0;
  const feeBase =
    Number(latestMonth?.volume) ||
    Number(liveStats?.revenue?.totalVolume) ||
    0;
  const feeRate =
    feeBase > 0 ? ((feeCollected / feeBase) * 100).toFixed(1) : null;
  const userGrowth =
    (liveStats?.users?.newCustomersThisMonth || 0) +
    (liveStats?.users?.newProvidersThisMonth || 0);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Super admin"
        title="Operations overview"
        description="Approve providers, watch live jobs, and keep protected payments moving safely."
      />

      <DashPanel tone="ink" className="animate-fade-up">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
              <Shield className="size-3.5 text-brand" />
              Control center
            </div>
            <h2 className="font-fraunces text-2xl font-semibold md:text-3xl">
              {pendingProviders.length > 0
                ? `${pendingProviders.length} provider${pendingProviders.length === 1 ? "" : "s"} waiting for review`
                : "Marketplace is running clean"}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/65">
              {openDisputesCount} open dispute
              {openDisputesCount === 1 ? "" : "s"} · {activeJobsCount} active jobs ·{" "}
              {formatCurrency(heldTotal)} in safe hold
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={ROUTES.ADMIN_PROVIDERS}
              className="app-btn inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-ink hover:bg-cream"
            >
              Review providers
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href={ROUTES.ADMIN_DISPUTES}
              className="app-btn inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-3 text-sm font-bold text-white hover:bg-white/12"
            >
              Open disputes
            </Link>
          </div>
        </div>
      </DashPanel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link href={ROUTES.ADMIN_USERS} className="block">
          <DashStat
            index={0}
            label="Registered users"
            value={totalUsers.toLocaleString()}
            hint={
              userGrowth > 0
                ? `+${userGrowth} this month`
                : "Registered accounts"
            }
            icon={<Users className="h-5 w-5" />}
            tone="sky"
          />
        </Link>
        <Link href={ROUTES.ADMIN_PROVIDERS} className="block">
          <DashStat
            index={1}
            label="Pending approvals"
            value={pendingProviders.length}
            hint="Action required"
            icon={<HardHat className="h-5 w-5" />}
            tone="amber"
          />
        </Link>
        <Link href={ROUTES.ADMIN_JOBS} className="block">
          <DashStat
            index={2}
            label="Active jobs"
            value={activeJobsCount}
            hint="Live marketplace"
            icon={<Briefcase className="h-5 w-5" />}
            tone="emerald"
          />
        </Link>
        <Link href={ROUTES.ADMIN_DISPUTES} className="block">
          <DashStat
            index={3}
            label="Open disputes"
            value={openDisputesCount}
            hint={openDisputesCount > 0 ? "Needs review" : "Clear"}
            icon={<Scale className="h-5 w-5" />}
            tone="rose"
          />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashPanel tone="ink" className="animate-fade-up">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/70">
            <CreditCard className="size-4 text-emerald-400" />
            Protected funds in safe hold
          </div>
          <p className="mt-3 font-fraunces text-3xl font-semibold tabular-nums md:text-4xl">
            {formatCurrency(heldTotal)}
          </p>
          <p className="mt-2 text-xs font-medium text-white/60">
            Secured across {heldPay.length} active order
            {heldPay.length === 1 ? "" : "s"} awaiting release
          </p>
        </DashPanel>

        <DashPanel className="animate-fade-up">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                Marketplace GMV
              </div>
              <p className="mt-1 font-fraunces text-3xl font-semibold tabular-nums text-ink md:text-4xl">
                {formatCurrency(gmvMonth)}
              </p>
              <p className="mt-1 text-xs font-medium text-muted">
                {feeRate
                  ? `Platform fees ~${feeRate}%`
                  : "Fees from captured payments"}
                {Number.isFinite(revenueGrowth) && revenueGrowth !== 0
                  ? ` · ${revenueGrowth > 0 ? "+" : ""}${revenueGrowth}% vs last month`
                  : ""}
              </p>
            </div>
          </div>
        </DashPanel>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DashPanel className="animate-fade-up space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-ink">
                Pending provider verifications
              </h2>
              <p className="text-xs text-muted">Review IDs and credentials for approval</p>
            </div>
            <Link
              href={ROUTES.ADMIN_PROVIDERS}
              className="text-xs font-bold text-brand hover:underline"
            >
              View all ({pendingProviders.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {pendingProviders.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-cream/70 px-4 py-3.5 transition-colors hover:bg-cream"
              >
                <div>
                  <p className="text-sm font-bold text-ink">{p.name}</p>
                  <p className="mt-0.5 text-xs font-medium text-muted">
                    {p.categories.join(", ")} · {p.city}
                  </p>
                </div>
                <Link
                  href={ROUTES.ADMIN_PROVIDER(p.id)}
                  className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-200"
                >
                  Review →
                </Link>
              </div>
            ))}
            {pendingProviders.length === 0 && (
              <p className="py-8 text-center text-sm text-muted">
                All provider applications processed.
              </p>
            )}
          </div>
        </DashPanel>

        <DashPanel className="animate-fade-up space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-fraunces text-xl font-semibold text-ink">
                Disputes & mediation
              </h2>
              <p className="text-xs text-muted">Resolve payment and quality inquiries</p>
            </div>
            <Link
              href={ROUTES.ADMIN_DISPUTES}
              className="text-xs font-bold text-brand hover:underline"
            >
              View all ({openDisputes.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {openDisputes.slice(0, 4).map((d) => (
              <Link
                key={d.id}
                href={ROUTES.ADMIN_DISPUTE(d.jobId)}
                className="group block rounded-2xl bg-cream/70 px-4 py-3.5 transition-colors hover:bg-cream"
              >
                <div className="mb-1 flex items-start justify-between gap-3">
                  <p className="text-sm font-bold text-ink transition-colors group-hover:text-brand">
                    {d.jobTitle}
                  </p>
                  <AdminBadge label="Open" tone="danger" />
                </div>
                <p className="line-clamp-1 text-xs font-medium text-muted">{d.reason}</p>
              </Link>
            ))}
            {openDisputes.length === 0 && (
              <div className="flex items-center justify-center gap-1.5 py-8 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="size-4 text-emerald-600" />
                Zero open disputes. Platform running smoothly.
              </div>
            )}
          </div>
        </DashPanel>
      </div>
    </div>
  );
}
