"use client";

import { Suspense } from "react";
import MessagesWorkspace from "@/components/shared/chat/MessagesWorkspace";

function CustomerMessagesInner() {
  return <MessagesWorkspace role="customer" />;
}

export default function CustomerMessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-muted">
          Loading messages…
        </div>
      }
    >
      <CustomerMessagesInner />
    </Suspense>
  );
}
