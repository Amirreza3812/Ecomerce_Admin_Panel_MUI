import apiClient from "./api";

export type LoyaltyReward = {
  at_stamp: number;
  type: "percent" | "fixed" | "free_item";
  value: number;
  title: string;
  product_id?: number | null;
};

export type LoyaltySettings = {
  enabled: boolean;
  slots: number;
  stamp_on: "paid" | "completed";
  reset_on_reward: boolean;
  rewards: LoyaltyReward[];
};

export type OnlineOfferSettings = {
  enabled: boolean;
  title: string;
  type: "percent" | "fixed";
  value: number;
  min_order_amount: number;
  starts_at: string | null;
  ends_at: string | null;
  code: string | null;
};

export type GeneralSettings = {
  online_payment_enabled: boolean;
};

export type ShopSettings = {
  loyalty: LoyaltySettings;
  online_offer: OnlineOfferSettings;
  general: GeneralSettings;
};

export const getSettings = async (): Promise<ShopSettings> => {
  const res = await apiClient.get("/settings");
  return res.data.data;
};

export const updateSettings = async (
  payload: Partial<ShopSettings>
): Promise<Partial<ShopSettings>> => {
  const res = await apiClient.patch("/settings", payload);
  return res.data.data;
};