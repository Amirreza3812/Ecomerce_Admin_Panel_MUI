// src/utils/orderLabels.ts
export const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار",
  confirmed: "تأیید شده",
  preparing: "در حال آماده‌سازی",
  ready: "آماده",
  completed: "تکمیل شده",
  cancelled: "لغو شده",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "پرداخت نشده",
  paid: "پرداخت شده",
  failed: "ناموفق",
  refunded: "بازگشت وجه",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "نقد",
  card: "کارت",
  digital_wallet: "کیف پول",
  bank_transfer: "حواله بانکی",
  online: "آنلاین",
};
