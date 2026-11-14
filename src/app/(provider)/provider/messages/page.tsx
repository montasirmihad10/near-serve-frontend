"use client";

import { Suspense } from "react";
import MessagesWorkspace from "@/components/shared/chat/MessagesWorkspace";

function ProviderMessagesInner() {
  return <MessagesWorkspace role="provider" />;
}

export default function ProviderMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-muted">
          Loading messages…
        </div>
      }
    >
      <ProviderMessagesInner />
    </Suspense>
  );
}
