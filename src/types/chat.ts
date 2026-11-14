export type ChatMessageType =
  | "text"
  | "image"
  | "audio"
  | "document"
  | "location"
  | "system";

export type ChatParticipant = {
  id: string;
  name: string;
  profileImage?: string | null;
  phone?: string | null;
  role?: string;
};

export type ChatJobRef = {
  id: string;
  title: string;
  category?: string;
  status?: string;
  budget?: number;
};

export type ChatAttachment = {
  url: string;
  type: "image" | "audio" | "document";
  name: string;
  size?: number;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole?: string;
  content: string;
  messageType: ChatMessageType;
  attachments: ChatAttachment[];
  isRead: boolean;
  isMine: boolean;
  createdAt: string;
};

export type ChatConversation = {
  id: string;
  jobId: string;
  jobTitle: string;
  jobStatus?: string;
  jobCategory?: string;
  participant: ChatParticipant;
  lastMessage: string;
  lastMessageAt: string | null;
  unreadCount: number;
  isActive: boolean;
};
