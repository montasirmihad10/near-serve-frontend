/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ChatConversation, ChatMessage } from "@/types/chat";

const idOf = (value: any): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id || value.id || "");
};

const nameOf = (value: any, fallback = "User") =>
  value?.name || fallback;

export function mapConversation(
  raw: any,
  myUserId: string,
  role: "customer" | "provider",
): ChatConversation {
  const customer = raw.customerId;
  const provider = raw.providerId;
  const job = raw.jobId;

  const other = role === "customer" ? provider : customer;

  return {
    id: idOf(raw),
    jobId: idOf(job) || idOf(raw.jobId),
    jobTitle: job?.title || "Service job",
    jobStatus: job?.status,
    jobCategory: job?.category,
    participant: {
      id: idOf(other),
      name: nameOf(other, role === "customer" ? "Provider" : "Customer"),
      profileImage: other?.profileImage || null,
      phone: other?.phone || null,
      role: role === "customer" ? "provider" : "customer",
    },
    lastMessage: raw.lastMessage || "No messages yet",
    lastMessageAt: raw.lastMessageAt || raw.updatedAt || null,
    unreadCount: Number(raw.unreadCount || 0),
    isActive: raw.isActive !== false,
  };
}

export function mapMessage(raw: any, myUserId: string): ChatMessage {
  const sender = raw.senderId;
  const senderId = idOf(sender) || idOf(raw.senderId);

  return {
    id: idOf(raw),
    conversationId: idOf(raw.conversationId),
    senderId,
    senderName: nameOf(sender, "User"),
    senderRole: sender?.role,
    content: raw.content || "",
    messageType: raw.messageType || "text",
    attachments: Array.isArray(raw.attachments) ? raw.attachments : [],
    isRead: !!raw.isRead,
    isMine: senderId === myUserId,
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

export function unwrapList(response: any): any[] {
  const data = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.result)) return data.result;
  return [];
}

export function unwrapOne(response: any): any | null {
  const data = response?.data?.data ?? response?.data ?? response;
  if (!data || Array.isArray(data)) return null;
  if (data.result && !data._id && !data.id) return data.result;
  return data;
}
