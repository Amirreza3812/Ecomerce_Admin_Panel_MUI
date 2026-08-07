export type PlanType = "basic" | "pro";

export type LicenseModules = {
  orders: boolean;
  categories: boolean;
  products: boolean;
  subcategories: boolean;
  prices: boolean;
  customers: boolean;
  banking: boolean;
  personnel: boolean;
  comments: boolean;
  settings: boolean;
  about: boolean;
  feedback: boolean;
  myAccount: boolean;
};

export type LicenseInfo = {
  plan: PlanType;
  expires_at: string;
  days_left: number;
  expired: boolean;
  can_create_admins: boolean;
  modules: LicenseModules;
};

/** Offline default — used until login returns license; also fallback */
export const defaultLicenseConfig: LicenseInfo = {
  plan: "pro",
  expires_at: "2026-12-31",
  days_left: 0, // computed below
  expired: false,
  can_create_admins: true,
  modules: {
    orders: true,
    categories: true,
    products: true,
    subcategories: true,
    prices: true,
    customers: true,
    banking: true,
    personnel: true,
    comments: true,
    settings: true,
    about: true,
    feedback: true,
    myAccount: true,
  },
};

export function computeDaysLeft(expires_at: string): number {
  const end = new Date(expires_at);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function normalizeLicense(
  partial?: Partial<LicenseInfo> | null
): LicenseInfo {
  const base = {
    ...defaultLicenseConfig,
    ...partial,
    modules: {
      ...defaultLicenseConfig.modules,
      ...(partial?.modules || {}),
    },
  };
  const days_left = computeDaysLeft(base.expires_at);
  return {
    ...base,
    days_left,
    expired: days_left < 0,
    can_create_admins: !!base.can_create_admins && days_left >= 0,
  };
}