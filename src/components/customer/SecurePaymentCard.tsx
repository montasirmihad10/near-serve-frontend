"use client";

import { useState } from "react";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Lock,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/customer/format";
import { cn } from "@/lib/utils";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/types/payment";

type SecurePaymentCardProps = {
  amount: number;
  paid: boolean;
  hasChosenProvider: boolean;
  providerFirstName?: string;
  defaultMethod?: PaymentMethod;
  savedBkash?: string | null;
  savedNagad?: string | null;
  onPay: (opts: { method: PaymentMethod; payerWallet?: string }) => void;
  className?: string;
};

const METHODS: Array<{
  id: PaymentMethod;
  label: string;
  hint: string;
  icon: typeof CreditCard;
}> = [
  {
    id: "stripe",
    label: "Card",
    hint: "Held until you approve",
    icon: CreditCard,
  },
  {
    id: "cod",
    label: "Cash",
    hint: "Pay after work",
    icon: Banknote,
  },
  {
    id: "bkash",
    label: "bKash",
    hint: "Mobile wallet",
    icon: Smartphone,
  },
  {
    id: "nagad",
    label: "Nagad",
    hint: "Mobile wallet",
    icon: Smartphone,
  },
];

/**
 * Stripe escrow hold + local BD methods (COD / bKash / Nagad).
 */
export default function SecurePaymentCard({
  amount,
  paid,
  hasChosenProvider,
  providerFirstName,
  defaultMethod = "stripe",
  savedBkash,
  savedNagad,
  onPay,
  className,
}: SecurePaymentCardProps) {
  const [method, setMethod] = useState<PaymentMethod>(defaultMethod);
  const [wallet, setWallet] = useState(
    defaultMethod === "nagad" ? savedNagad || "" : savedBkash || "",
  );

  const needsWallet = method === "bkash" || method === "nagad";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-ink p-5 text-white shadow-[0_12px_40px_rgba(26,18,8,0.18)] md:p-6",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(199,10,36,0.35)_0%,transparent_55%)]" />
      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <Lock className="size-5 text-brand" />
          <h2 className="font-fraunces text-lg font-semibold">Secure payment</h2>
        </div>

        {paid ? (
          <>
            <p className="mb-1 font-fraunces text-3xl font-bold tabular-nums">
              {formatCurrency(amount)}
            </p>
            <p className="mb-4 text-sm leading-relaxed text-white/65">
              Booking payment is locked in. Money / settlement is released only
              after you approve the finished work
              {providerFirstName ? ` — then ${providerFirstName} gets paid` : ""}
              .
            </p>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f5e9] px-3 py-1.5 text-xs font-semibold text-[#1b5e20]">
              <CheckCircle2 className="size-3.5" />
              Payment secured
            </div>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm leading-relaxed text-white/70">
              {hasChosenProvider
                ? "Choose how you want to pay. Card funds are held by Stripe until you approve. Local wallets & cash settle when the job is done."
                : "Choose a provider first, then pick a payment method to confirm the booking."}
            </p>

            <div className="mb-3 grid grid-cols-2 gap-2">
              {METHODS.map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={!hasChosenProvider}
                    onClick={() => {
                      setMethod(m.id);
                      if (m.id === "bkash") setWallet(savedBkash || "");
                      if (m.id === "nagad") setWallet(savedNagad || "");
                    }}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left transition-colors disabled:opacity-40",
                      active
                        ? "border-brand bg-brand/20"
                        : "border-white/15 bg-white/5 hover:bg-white/10",
                    )}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold">
                      <Icon className="size-3.5" />
                      {m.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-white/55">
                      {m.hint}
                    </span>
                  </button>
                );
              })}
            </div>

            {needsWallet && (
              <input
                type="tel"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder={
                  method === "bkash"
                    ? "Your bKash number (01XXXXXXXXX)"
                    : "Your Nagad number (01XXXXXXXXX)"
                }
                className="mb-3 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-brand/50"
              />
            )}

            <button
              type="button"
              onClick={() =>
                onPay({
                  method,
                  payerWallet: needsWallet ? wallet.trim() : undefined,
                })
              }
              disabled={!hasChosenProvider || (needsWallet && wallet.trim().length < 8)}
              className="app-btn flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-40"
            >
              {method === "stripe" ? (
                <CreditCard className="size-4" />
              ) : method === "cod" ? (
                <Banknote className="size-4" />
              ) : (
                <Smartphone className="size-4" />
              )}
              Confirm with {PAYMENT_METHOD_LABELS[method].split(" ")[0]} ·{" "}
              {formatCurrency(amount)}
              <ArrowRight className="size-4" />
            </button>
            <p className="mt-3 text-[11px] leading-relaxed text-white/40">
              Stripe card = hold until approve · bKash/Nagad/COD = settle after
              you approve completion. Update wallet numbers anytime in Profile.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
