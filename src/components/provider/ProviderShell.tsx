"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Gavel,
  MessageSquare,
  Wallet,
  User,
  Menu,
  X,
  ClipboardList,
  LogOut,
  Landmark,
  ChevronDown,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  PROVIDER_NAV,
  NAVBAR_CONFIG,
  PUBLIC_NAV,
  ROUTES,
} from "@/utils/navigation";
import { cn } from "@/lib/utils";
import Avatar from "@/components/shared/app/Avatar";
import NotificationBell from "@/components/shared/notifications/NotificationBell";
import RequireRole from "@/components/auth/RequireRole";
import { useDemoAuth } from "@/components/providers/DemoAuthProvider";
import { useGetProviderAnalyticsQuery } from "@/redux/api/analyticsApi";
import { useGetJobFeedQuery } from "@/redux/api/jobApi";
import { useGetMyConversationsQuery } from "@/redux/api/conversationApi";
import MarketplaceBottomNav from "@/components/shared/app/MarketplaceBottomNav";

type ProviderShellProps = {
  children: ReactNode;
};

export default function ProviderShell({ children }: ProviderShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useDemoAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const displayName = user?.name ?? "Provider";

  const { data: analyticsRes } = useGetProviderAnalyticsQuery({});
  const { data: feedRes } = useGetJobFeedQuery({ limit: 50 });
  const { data: conversationsData } = useGetMyConversationsQuery({
    limit: 50,
  });
  const analytics = (analyticsRes as { data?: Record<string, unknown> })?.data;
  const profile = (analytics?.profile || {}) as { trustScore?: number };
  const reviews = (analytics?.reviews || {}) as { average?: number };
  const trust =
    Number(profile.trustScore) ||
    (Number(reviews.average) ? Number(reviews.average) * 20 : 0);
  const rating =
    Number(reviews.average) ||
    (trust ? Number((trust / 20).toFixed(1)) : 0);
  const feedRaw =
    (feedRes as { data?: { result?: unknown[] } })?.data?.result ||
    (feedRes as { data?: unknown })?.data;
  const feedCount = Array.isArray(feedRaw) ? feedRaw.length : 0;
  const conversationRows =
    (conversationsData as { data?: { result?: unknown[] } })?.data?.result ||
    (conversationsData as { data?: unknown })?.data ||
    conversationsData;
  const unreadMessages = Array.isArray(conversationRows)
    ? conversationRows.reduce(
        (sum, c) =>
          sum +
          Number(
            (c as { unreadCount?: number })?.unreadCount ??
              (c as { unreadMessages?: number })?.unreadMessages ??
              0,
          ),
        0,
      )
    : 0;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const isToolActive = (path: string) => {
    if (path === ROUTES.PROVIDER_HOME) {
      return (
        pathname === path ||
        pathname.startsWith("/provider/feed") ||
        pathname.startsWith("/provider/active")
      );
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    logout();
    router.push(ROUTES.HOME);
  };

  const toolIcon = (icon: string) => {
    if (icon === "gavel") return Gavel;
    if (icon === "message") return MessageSquare;
    if (icon === "wallet") return Wallet;
    if (icon === "bank") return Landmark;
    return LayoutGrid;
  };

  return (
    <RequireRole allow={["provider"]}>
      <div className="min-h-screen flex flex-col bg-cream">
        <header className="sticky top-0 z-50 border-b border-border/80 bg-cream/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <Link
              href={ROUTES.HOME}
              className="font-fraunces text-[22px] font-bold tracking-tight transition-transform duration-300 hover:scale-[1.02]"
            >
              <span className="text-ink">{NAVBAR_CONFIG.LOGO_TEXT}</span>
              <span className="text-brand">{NAVBAR_CONFIG.LOGO_HIGHLIGHT}</span>
            </Link>

            <nav className="hidden items-center gap-6 lg:flex">
              {PUBLIC_NAV.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="text-sm font-medium text-warm transition-colors hover:text-ink"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 md:inline-flex">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                {rating > 0 ? rating.toFixed(1) : "—"}
                {trust > 0 ? ` · ${Math.round(trust)}` : ""}
              </span>
              <NotificationBell role="provider" />
              <Link
                href={ROUTES.PROVIDER_MESSAGES}
                className="relative hidden rounded-full p-2.5 text-warm transition-colors hover:bg-white hover:text-ink sm:inline-flex"
                aria-label="Messages"
              >
                <MessageSquare className="size-[18px]" />
                {unreadMessages > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>
              <Link
                href={ROUTES.PROVIDER_HOME}
                className="app-btn hidden items-center gap-1.5 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(199,10,36,0.25)] hover:bg-brand-dark sm:inline-flex"
              >
                <LayoutGrid className="size-4" />
                Job feed
                {feedCount > 0 && (
                  <span className="rounded-full bg-white/20 px-1.5 text-[10px]">
                    {feedCount}
                  </span>
                )}
              </Link>

              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-border bg-white py-1.5 pl-1.5 pr-2.5 shadow-sm transition-colors hover:border-border-warm"
                >
                  <Avatar name={displayName} size="sm" />
                  <span className="max-w-[90px] truncate text-sm font-semibold text-ink">
                    {displayName.split(" ")[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-3.5 text-muted transition-transform",
                      userMenuOpen && "rotate-180",
                    )}
                  />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-cream shadow-[0_12px_40px_rgba(26,18,8,0.12)]">
                    <div className="border-b border-border px-4 py-3">
                      <p className="truncate text-sm font-semibold text-ink">
                        {displayName}
                      </p>
                      <p className="truncate text-[11px] text-muted">
                        {user?.email}
                      </p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href={ROUTES.PROVIDER_ONBOARDING}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-warm hover:bg-white hover:text-ink"
                      >
                        <ClipboardList className="size-4" />
                        Verification
                      </Link>
                      <Link
                        href={ROUTES.PROVIDER_PROFILE}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-warm hover:bg-white hover:text-ink"
                      >
                        <User className="size-4" />
                        Profile & payouts
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#8b1a1a] hover:bg-[#f5e6e6]"
                      >
                        <LogOut className="size-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((v) => !v)}
                className="rounded-xl border border-border bg-white p-2 text-ink shadow-sm lg:hidden"
              >
                {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>

          <div className="hidden border-t border-border/60 bg-gradient-to-r from-white/40 via-white/70 to-white/40 lg:block">
            <div className="mx-auto flex max-w-7xl gap-1 px-4 py-2.5 sm:px-6 lg:px-8">
              {PROVIDER_NAV.map((item) => {
                const active = isToolActive(item.path);
                const Icon = toolIcon(item.icon);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                      active
                        ? "bg-ink text-white shadow-sm"
                        : "text-warm hover:bg-cream hover:text-ink",
                    )}
                  >
                    <Icon className="size-3.5" />
                    {item.name}
                    {item.name === "Job feed" && feedCount > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[10px] font-bold",
                          active
                            ? "bg-white/20"
                            : "bg-emerald-100 text-emerald-800",
                        )}
                      >
                        {feedCount}
                      </span>
                    )}
                    {item.name === "Messages" && unreadMessages > 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[10px] font-bold",
                          active ? "bg-white/20" : "bg-brand/10 text-brand",
                        )}
                      >
                        {unreadMessages > 9 ? "9+" : unreadMessages}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </header>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-[60] bg-ink/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-cream p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <Avatar name={displayName} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-ink">{displayName}</p>
                    <p className="text-[11px] font-semibold text-emerald-700">
                      Verified provider
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-1.5 text-muted hover:bg-white"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 overflow-y-auto">
                {PUBLIC_NAV.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-sm font-semibold text-warm hover:bg-white hover:text-ink"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="my-3 border-t border-border" />
                {PROVIDER_NAV.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm font-semibold",
                      isToolActive(item.path)
                        ? "bg-ink text-white"
                        : "text-warm hover:bg-white hover:text-ink",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href={ROUTES.PROVIDER_ONBOARDING}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-warm hover:bg-white hover:text-ink"
                >
                  Verification
                </Link>
                <Link
                  href={ROUTES.PROVIDER_PROFILE}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-warm hover:bg-white hover:text-ink"
                >
                  Profile & payouts
                </Link>
              </nav>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-auto flex items-center gap-2 rounded-xl p-2 text-sm font-bold text-red-700 hover:bg-red-50"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </div>
          </div>
        )}

        <main
          key={pathname}
          className="marketplace-main mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 sm:py-6 md:py-8 lg:px-8 app-page"
        >
          {children}
        </main>

        <MarketplaceBottomNav role="provider" />
      </div>
    </RequireRole>
  );
}
