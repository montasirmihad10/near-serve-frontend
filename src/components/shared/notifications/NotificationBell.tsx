"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/customer/format";
import { useSocket } from "@/components/providers/SocketProvider";
import {
  useGetMyNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
} from "@/redux/api/notificationApi";
import { useGetMeQuery } from "@/redux/api/userApi";
import { ROUTES } from "@/utils/navigation";
import { unwrapOne } from "@/lib/api/rows";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Role = "customer" | "provider" | "admin";

function extractRows(data: unknown): any[] {
  const raw = (data as any)?.data?.result || (data as any)?.data || data;
  return Array.isArray(raw) ? raw : [];
}

function unreadFrom(data: unknown): number {
  const payload = (data as any)?.data ?? data;
  if (typeof payload === "number") return payload;
  return Number(payload?.count ?? payload?.unreadCount ?? 0) || 0;
}

function hrefForNotification(role: Role, n: any): string {
  const data = n?.data || {};
  const jobId = data.jobId || data.job_id;
  const conversationId = data.conversationId;

  if (role === "customer") {
    if (conversationId) return `${ROUTES.CUSTOMER_MESSAGES}?id=${conversationId}`;
    if (jobId) return ROUTES.CUSTOMER_JOB(String(jobId));
    return ROUTES.CUSTOMER_HOME;
  }
  if (role === "provider") {
    if (conversationId) return `${ROUTES.PROVIDER_MESSAGES}?id=${conversationId}`;
    if (jobId) return ROUTES.PROVIDER_ACTIVE(String(jobId));
    return ROUTES.PROVIDER_HOME;
  }
  if (data.dispute || n?.type?.includes("dispute")) {
    return jobId ? ROUTES.ADMIN_DISPUTE(String(jobId)) : ROUTES.ADMIN_DISPUTES;
  }
  return ROUTES.ADMIN_HOME;
}

export default function NotificationBell({
  role,
  className,
}: {
  role: Role;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const { data: meRes } = useGetMeQuery(undefined);
  const me = unwrapOne<any>(meRes) || (meRes as any)?.data;
  const myUserId = String(me?._id || me?.id || "");

  const { data: unreadData, refetch: refetchUnread } = useGetUnreadCountQuery(
    undefined,
    { pollingInterval: 30000 },
  );
  const {
    data: listData,
    refetch: refetchList,
    isFetching,
    isError,
  } = useGetMyNotificationsQuery(
    { limit: 12, sort: "-createdAt" },
    { skip: !open, pollingInterval: open ? 20000 : 0 },
  );
  const [markRead] = useMarkNotificationAsReadMutation();
  const [markAll, { isLoading: markingAll }] =
    useMarkAllNotificationsAsReadMutation();

  const unread = unreadFrom(unreadData);
  const rows = useMemo(() => extractRows(listData), [listData]);

  useEffect(() => {
    if (!socket) return;

    const refresh = (payload?: any) => {
      void refetchUnread();
      if (open) void refetchList();
      if (payload?.title && !open) {
        toast(payload.title, {
          description: payload.message,
        });
      }
    };

    socket.on("notification", refresh);
    if (myUserId) {
      socket.on(`new_message-${myUserId}`, refresh);
      socket.on(`bid_accepted-${myUserId}`, refresh);
      socket.on(`new_bid-${myUserId}`, refresh);
      socket.on(`job_status_changed-${myUserId}`, refresh);
    }

    return () => {
      socket.off("notification", refresh);
      if (myUserId) {
        socket.off(`new_message-${myUserId}`, refresh);
        socket.off(`bid_accepted-${myUserId}`, refresh);
        socket.off(`new_bid-${myUserId}`, refresh);
        socket.off(`job_status_changed-${myUserId}`, refresh);
      }
    };
  }, [socket, open, myUserId, refetchUnread, refetchList]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const onOpen = () => {
    setOpen((v) => !v);
  };

  const onItemClick = async (n: any) => {
    const id = n._id || n.id;
    if (id && !n.isRead) {
      try {
        await markRead(String(id)).unwrap();
        void refetchUnread();
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
  };

  const onMarkAll = async () => {
    try {
      await markAll(undefined).unwrap();
      toast.success("All notifications marked read");
      void refetchUnread();
      void refetchList();
    } catch (err: any) {
      toast.error(err?.data?.message || "Could not mark all read");
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={onOpen}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-ink shadow-sm hover:bg-cream"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-brand px-1 text-[10px] font-bold leading-4 text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-bold text-ink">Notifications</p>
              <p className="text-[11px] text-muted">
                {unread > 0 ? `${unread} unread` : "You're caught up"}
              </p>
            </div>
            <button
              type="button"
              disabled={markingAll || unread === 0}
              onClick={() => void onMarkAll()}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold text-brand hover:bg-brand/5 disabled:opacity-40"
            >
              <CheckCheck className="size-3.5" />
              Mark all
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isFetching && rows.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted">
                Loading…
              </p>
            )}
            {isError && rows.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted">Couldn’t load notifications.</p>
                <button
                  type="button"
                  onClick={() => void refetchList()}
                  className="mt-2 text-xs font-bold text-brand hover:underline"
                >
                  Retry
                </button>
              </div>
            )}
            {!isFetching && !isError && rows.length === 0 && (
              <p className="px-4 py-8 text-center text-sm text-muted">
                No notifications yet. Bids, payments, and job updates land here.
              </p>
            )}
            {rows.map((n) => {
              const id = String(n._id || n.id);
              const href = hrefForNotification(role, n);
              return (
                <Link
                  key={id}
                  href={href}
                  onClick={() => void onItemClick(n)}
                  className={cn(
                    "block border-b border-border/70 px-4 py-3 transition-colors hover:bg-cream/80",
                    !n.isRead && "bg-brand/[0.04]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{n.title}</p>
                    {!n.isRead && (
                      <span className="mt-1 size-2 shrink-0 rounded-full bg-brand" />
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                    {n.message}
                  </p>
                  <p className="mt-1 text-[11px] text-muted/80">
                    {formatRelativeTime(n.createdAt)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
