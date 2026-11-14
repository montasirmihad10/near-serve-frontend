"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCheck,
  ImagePlus,
  Loader2,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetMyConversationsQuery,
  useGetConversationByIdQuery,
} from "@/redux/api/conversationApi";
import {
  useGetMessagesQuery,
  useSendTextMessageMutation,
  useSendAttachmentMutation,
} from "@/redux/api/messageApi";
import { useGetMeQuery } from "@/redux/api/userApi";
import { useSocket } from "@/components/providers/SocketProvider";
import {
  mapConversation,
  mapMessage,
  unwrapList,
  unwrapOne,
} from "@/lib/chat/mappers";
import type { ChatConversation, ChatMessage } from "@/types/chat";
import { formatRelativeTime } from "@/lib/customer/format";
import { ROUTES } from "@/utils/navigation";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/app/PageHeader";
import Avatar from "@/components/shared/app/Avatar";
import EmptyState from "@/components/shared/app/EmptyState";

type Role = "customer" | "provider";

const QUICK_REPLIES: Record<Role, string[]> = {
  customer: [
    "Can you arrive between 2–4 PM?",
    "Here's the gate code / access note.",
    "Please send a photo when you're done.",
    "Payment is held — I'll approve when finished.",
  ],
  provider: [
    "On my way — ETA 20 minutes.",
    "I'll bring the parts listed.",
    "Job complete — please review & approve.",
    "Need one clarification before I start.",
  ],
};

type Props = {
  role: Role;
};

export default function MessagesWorkspace({ role }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { socket, isConnected } = useSocket();

  const initialId = searchParams.get("id");
  const [selectedId, setSelectedId] = useState<string | null>(initialId);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: meRes } = useGetMeQuery(undefined);
  const me = unwrapOne(meRes) || meRes?.data || meRes;
  const myUserId = String(me?._id || me?.id || "");

  const {
    data: convRes,
    isLoading: convLoading,
    isError: convError,
    refetch: refetchConversations,
  } = useGetMyConversationsQuery({ sort: "-lastMessageAt", limit: 50 });

  const conversations = useMemo(() => {
    return unwrapList(convRes)
      .map((c) => mapConversation(c, myUserId, role))
      .sort((a, b) => {
        const at = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
        const bt = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
        return bt - at;
      });
  }, [convRes, myUserId, role]);

  useEffect(() => {
    if (initialId) setSelectedId(initialId);
    else if (!selectedId && conversations[0]?.id) {
      setSelectedId(conversations[0].id);
    }
  }, [initialId, conversations, selectedId]);

  const selectConversation = useCallback(
    (id: string) => {
      setSelectedId(id);
      setLiveMessages([]);
      const params = new URLSearchParams(searchParams.toString());
      params.set("id", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const { data: activeConvRes } = useGetConversationByIdQuery(selectedId!, {
    skip: !selectedId,
  });

  const activeConversation: ChatConversation | null = useMemo(() => {
    const raw = unwrapOne(activeConvRes);
    if (raw) return mapConversation(raw, myUserId, role);
    return conversations.find((c) => c.id === selectedId) || null;
  }, [activeConvRes, conversations, myUserId, role, selectedId]);

  const {
    data: msgRes,
    isFetching: msgLoading,
    isError: msgError,
    refetch: refetchMessages,
  } = useGetMessagesQuery(
    { conversationId: selectedId!, sort: "createdAt", limit: 100 },
    { skip: !selectedId, pollingInterval: isConnected ? 0 : 8000 },
  );

  const apiMessages = useMemo(() => {
    return unwrapList(msgRes).map((m) => mapMessage(m, myUserId));
  }, [msgRes, myUserId]);

  const messages = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    for (const m of apiMessages) map.set(m.id, m);
    for (const m of liveMessages) {
      if (m.conversationId === selectedId) map.set(m.id, m);
    }
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [apiMessages, liveMessages, selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, selectedId]);

  useEffect(() => {
    if (!socket || !myUserId) return;

    const event = `chat:message-${myUserId}`;
    const notifEvent = `new_message-${myUserId}`;

    const onChat = (payload: { conversationId?: string; message?: unknown }) => {
      void refetchConversations();
      if (!payload?.message) {
        void refetchMessages();
        return;
      }
      const mapped = mapMessage(payload.message, myUserId);
      if (payload.conversationId && payload.conversationId !== selectedId) {
        return;
      }
      setLiveMessages((prev) => {
        if (prev.some((m) => m.id === mapped.id)) return prev;
        return [...prev, mapped];
      });
    };

    const onNotif = () => {
      void refetchMessages();
      void refetchConversations();
    };

    socket.on(event, onChat);
    socket.on(notifEvent, onNotif);
    socket.on("notification", onNotif);
    return () => {
      socket.off(event, onChat);
      socket.off(notifEvent, onNotif);
      socket.off("notification", onNotif);
    };
  }, [socket, myUserId, refetchMessages, refetchConversations, selectedId]);

  const [sendText, { isLoading: sending }] = useSendTextMessageMutation();
  const [sendAttachment, { isLoading: uploading }] =
    useSendAttachmentMutation();

  const filtered = conversations.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.participant.name.toLowerCase().includes(q) ||
      c.jobTitle.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  const jobHref =
    role === "customer"
      ? activeConversation
        ? ROUTES.CUSTOMER_JOB(activeConversation.jobId)
        : ROUTES.CUSTOMER_HOME
      : activeConversation
        ? ROUTES.PROVIDER_ACTIVE(activeConversation.jobId)
        : ROUTES.PROVIDER_HOME;

  const handleSend = async (e?: FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const text = (textOverride ?? draft).trim();
    if (!text || !selectedId) return;

    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      conversationId: selectedId,
      senderId: myUserId,
      senderName: me?.name || "You",
      content: text,
      messageType: "text",
      attachments: [],
      isRead: true,
      isMine: true,
      createdAt: new Date().toISOString(),
    };
    setLiveMessages((prev) => [...prev, optimistic]);
    setDraft("");

    try {
      const res = await sendText({
        conversationId: selectedId,
        content: text,
      }).unwrap();
      const saved = mapMessage(unwrapOne(res) || res?.data || res, myUserId);
      setLiveMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? { ...saved, isMine: true } : m)),
      );
      void refetchConversations();
      void refetchMessages();
    } catch (err: any) {
      setLiveMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      toast.error(err?.data?.message || err?.message || "Failed to send message");
    }
  };

  const handleFile = async (file: File | null) => {
    if (!file || !selectedId) return;
    const formData = new FormData();
    formData.append("files", file);
    formData.append("data", JSON.stringify({ content: draft.trim() || undefined }));
    try {
      await sendAttachment({ conversationId: selectedId, formData }).unwrap();
      setDraft("");
      refetchMessages();
      toast.success("Attachment sent");
    } catch (err: any) {
      toast.error(err?.data?.message || "Upload failed");
    }
  };

  return (
    <div className="w-full space-y-6">
      <PageHeader
        eyebrow={role === "customer" ? "Job messaging" : "Client messaging"}
        title="Messages"
        description={
          role === "customer"
            ? "Chat with your booked provider about timing, access, and completion — payment stays protected until you approve."
            : "Coordinate with customers on booked jobs: arrival, materials, and sign-off for payout."
        }
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-emerald-500" : "bg-amber-400",
              )}
            />
            {isConnected ? "Live" : "Polling"}
          </div>
        }
      />

      <div className="flex h-[calc(100vh-14rem)] min-h-[560px] max-h-[860px] flex-col gap-3 overflow-hidden rounded-[1.75rem] bg-stone-100/90 p-3 shadow-xs md:flex-row md:p-4">
        {/* List */}
        <div
          className={cn(
            "flex w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-xs md:w-[340px] lg:w-[360px]",
            selectedId && "hidden md:flex",
          )}
        >
          <div className="border-b border-border/70 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-fraunces text-base font-semibold text-ink">
                {role === "customer" ? "Provider chats" : "Customer chats"}
              </span>
              <span className="rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-bold text-muted">
                {filtered.length}
              </span>
            </div>
            <label className="flex items-center gap-2 rounded-full border border-border/80 bg-cream/60 px-3 py-2.5">
              <Search className="size-3.5 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs or people"
                className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-muted"
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {convLoading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
                <Loader2 className="size-4 animate-spin" />
                Loading conversations…
              </div>
            ) : convError ? (
              <EmptyState
                icon={<MessageCircle className="size-6 text-brand" />}
                title="Couldn’t load chats"
                description="Check that you’re signed in (Preview Customer/Provider works) and try again."
                action={
                  <button
                    type="button"
                    onClick={() => void refetchConversations()}
                    className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white"
                  >
                    Retry
                  </button>
                }
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<MessageCircle className="size-6 text-brand" />}
                title="No job chats yet"
                description={
                  role === "customer"
                    ? "Chats open automatically after you accept a bid. Coordinate access and approve completion here."
                    : "When a customer accepts your bid, a job chat appears here for scheduling and updates."
                }
              />
            ) : (
              filtered.map((conv) => {
                const active = conv.id === selectedId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => selectConversation(conv.id)}
                    className={cn(
                      "mb-1 flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors",
                      active
                        ? "bg-ink text-white"
                        : "hover:bg-cream/80 text-ink",
                    )}
                  >
                    <Avatar name={conv.participant.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-bold">
                          {conv.participant.name}
                        </p>
                        {conv.lastMessageAt && (
                          <span
                            className={cn(
                              "shrink-0 text-[10px] font-medium tabular-nums",
                              active ? "text-white/55" : "text-muted",
                            )}
                          >
                            {formatRelativeTime(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-0.5 truncate text-[11px] font-semibold",
                          active ? "text-brand" : "text-brand/90",
                        )}
                      >
                        {conv.jobTitle}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 line-clamp-1 text-xs",
                          active ? "text-white/65" : "text-muted",
                        )}
                      >
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span
                        className={cn(
                          "mt-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-brand text-white",
                        )}
                      >
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Thread */}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-xs",
            !selectedId && "hidden md:flex",
          )}
        >
          {activeConversation ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    className="rounded-xl p-2 text-muted hover:bg-cream md:hidden"
                    onClick={() => setSelectedId(null)}
                    aria-label="Back"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <Avatar name={activeConversation.participant.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">
                      {activeConversation.participant.name}
                    </p>
                    <Link
                      href={jobHref}
                      className="inline-flex items-center gap-1 truncate text-xs font-semibold text-brand hover:underline"
                    >
                      <Briefcase className="size-3" />
                      {activeConversation.jobTitle}
                    </Link>
                  </div>
                </div>
                <Link
                  href={jobHref}
                  className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-cream/70 px-3 py-2 text-xs font-bold text-ink transition-colors hover:bg-cream sm:inline-flex"
                >
                  Open job
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="border-b border-border/50 bg-cream/40 px-4 py-2.5">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-ink">
                    <ShieldCheck className="size-3 text-emerald-600" />
                    Job-scoped chat
                  </span>
                  <span>
                    Use this thread for access notes, timing, photos, and
                    completion — not for off-platform payment.
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-[linear-gradient(180deg,#fff_0%,#faf6ef_100%)] px-4 py-4">
                {msgLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-20 text-sm text-muted">
                    <Loader2 className="size-4 animate-spin" />
                    Loading messages…
                  </div>
                ) : msgError && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                    <p className="text-sm font-semibold text-ink">
                      Couldn’t load this thread
                    </p>
                    <button
                      type="button"
                      onClick={() => void refetchMessages()}
                      className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-white"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  messages.map((msg) => {
                    if (msg.messageType === "system") {
                      return (
                        <div
                          key={msg.id}
                          className="mx-auto max-w-md rounded-2xl border border-border/70 bg-white/90 px-4 py-3 text-center text-xs leading-relaxed text-muted"
                        >
                          {msg.content}
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-2",
                          msg.isMine ? "justify-end" : "justify-start",
                        )}
                      >
                        {!msg.isMine && (
                          <Avatar
                            name={activeConversation.participant.name}
                            size="sm"
                          />
                        )}
                        <div
                          className={cn(
                            "max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                            msg.isMine
                              ? "rounded-br-md bg-ink text-white"
                              : "rounded-bl-md bg-white text-ink ring-1 ring-border/70",
                          )}
                        >
                          {msg.content && <p>{msg.content}</p>}
                          {msg.attachments?.map((att) =>
                            att.type === "image" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                key={att.url}
                                src={att.url}
                                alt={att.name}
                                className="mt-2 max-h-48 rounded-xl object-cover"
                              />
                            ) : (
                              <a
                                key={att.url}
                                href={att.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-xs font-bold underline"
                              >
                                <Paperclip className="size-3" />
                                {att.name}
                              </a>
                            ),
                          )}
                          <div
                            className={cn(
                              "mt-1 flex items-center justify-end gap-1 text-[10px] tabular-nums",
                              msg.isMine ? "text-white/50" : "text-muted",
                            )}
                          >
                            {formatRelativeTime(msg.createdAt)}
                            {msg.isMine && <CheckCheck className="size-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-border/70 p-3">
                <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {QUICK_REPLIES[role].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => handleSend(undefined, q)}
                      className="shrink-0 rounded-full border border-border/80 bg-cream/70 px-3 py-1.5 text-[11px] font-semibold text-warm transition-colors hover:bg-white hover:text-ink"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={handleSend}
                  className="flex items-end gap-2 rounded-2xl border border-border/80 bg-cream/50 p-2"
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,audio/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFile(e.target.files?.[0] || null)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-xl p-2.5 text-muted transition-colors hover:bg-white hover:text-ink"
                    aria-label="Attach"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <ImagePlus className="size-4" />
                    )}
                  </button>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={1}
                    placeholder={`Message ${activeConversation.participant.name}…`}
                    className="max-h-28 min-h-[42px] flex-1 resize-none bg-transparent px-1 py-2.5 text-sm font-medium text-ink outline-none placeholder:text-muted"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || sending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-dark disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-cream text-brand">
                <MessageCircle className="size-7" />
              </div>
              <h3 className="font-fraunces text-xl font-semibold text-ink">
                Select a conversation
              </h3>
              <p className="max-w-sm text-sm text-muted">
                Job chats appear after a bid is accepted. Keep coordination here
                so payments and disputes stay tied to the job record.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
