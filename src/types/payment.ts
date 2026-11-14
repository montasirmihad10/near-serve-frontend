export type PaymentMethod = "stripe" | "cod" | "bkash" | "nagad";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  stripe: "Card (Stripe hold)",
  cod: "Cash on delivery",
  bkash: "bKash",
  nagad: "Nagad",
};

export type PaymentPreferences = {
  preferredMethod?: PaymentMethod;
  bkashNumber?: string | null;
  nagadNumber?: string | null;
};

export type ProviderLocalPayout = {
  acceptsCod?: boolean;
  acceptsBkash?: boolean;
  acceptsNagad?: boolean;
  bkashNumber?: string | null;
  nagadNumber?: string | null;
};
