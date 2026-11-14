"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/utils/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function ProviderConversationRedirect({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  useEffect(() => {
    router.replace(`${ROUTES.PROVIDER_MESSAGES}?id=${id}`);
  }, [id, router]);

  return (
    <div className="py-20 text-center text-sm text-muted">Opening chat…</div>
  );
}
