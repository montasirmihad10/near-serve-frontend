"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  CreditCard,
  Gavel,
  LayoutGrid,
  MessageSquare,
  Plus,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/utils/navigation";

type Role = "customer" | "provider";

const CUSTOMER_ITEMS = [
  { href: ROUTES.CUSTOMER_HOME, label: "Jobs", icon: Briefcase, match: "home" },
  {
    href: ROUTES.CUSTOMER_MESSAGES,
    label: "Chat",
    icon: MessageSquare,
    match: "messages",
  },
  {
    href: ROUTES.CUSTOMER_POST_JOB,
    label: "Post",
    icon: Plus,
    match: "post",
    primary: true,
  },
  {
    href: ROUTES.CUSTOMER_PAYMENTS,
    label: "Pay",
    icon: CreditCard,
    match: "payments",
  },
] as const;

const PROVIDER_ITEMS = [
  { href: ROUTES.PROVIDER_HOME, label: "Feed", icon: LayoutGrid, match: "home" },
  {
    href: ROUTES.PROVIDER_MY_BIDS,
    label: "Bids",
    icon: Gavel,
    match: "bids",
  },
  {
    href: ROUTES.PROVIDER_MESSAGES,
    label: "Chat",
    icon: MessageSquare,
    match: "messages",
  },
  {
    href: ROUTES.PROVIDER_EARNINGS,
    label: "Earn",
    icon: Wallet,
    match: "earnings",
  },
] as const;

function isActive(pathname: string, role: Role, match: string) {
  if (role === "customer") {
    if (match === "home")
      return (
        pathname === ROUTES.CUSTOMER_HOME ||
        pathname.startsWith("/customer/jobs")
      );
    if (match === "post") return pathname.startsWith("/customer/post-job");
    if (match === "messages") return pathname.startsWith("/customer/messages");
    if (match === "payments") return pathname.startsWith("/customer/payments");
  }
  if (match === "home")
    return (
      pathname === ROUTES.PROVIDER_HOME ||
      pathname.startsWith("/provider/feed") ||
      pathname.startsWith("/provider/active")
    );
  if (match === "bids") return pathname.startsWith("/provider/my-bids");
  if (match === "messages") return pathname.startsWith("/provider/messages");
  if (match === "earnings")
    return (
      pathname.startsWith("/provider/earnings") ||
      pathname.startsWith("/provider/payouts")
    );
  return false;
}

export default function MarketplaceBottomNav({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = role === "customer" ? CUSTOMER_ITEMS : PROVIDER_ITEMS;

  return (
    <nav
      className="marketplace-bottom-nav fixed inset-x-0 bottom-0 z-[70] border-t border-border/80 bg-cream/95 backdrop-blur-xl lg:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-lg items-end justify-around gap-1 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5">
        {items.map((item) => {
          const active = isActive(pathname, role, item.match);
          const primary = "primary" in item && item.primary;
          const Icon = item.icon;

          if (primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-5 flex flex-col items-center gap-1 px-2"
              >
                <span
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white shadow-[0_10px_28px_rgba(199,10,36,0.4)] ring-4 ring-cream transition-transform active:scale-95",
                    active && "bg-brand-dark",
                  )}
                >
                  <Icon className="size-6" strokeWidth={2.5} />
                </span>
                <span className="text-[10px] font-bold text-brand">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[4.25rem] flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 transition-colors",
                active ? "text-brand" : "text-muted hover:text-ink",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-2xl transition-colors",
                  active ? "bg-brand/10" : "bg-transparent",
                )}
              >
                <Icon className="size-[1.15rem]" strokeWidth={active ? 2.4 : 2} />
              </span>
              <span className="text-[10px] font-bold tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
