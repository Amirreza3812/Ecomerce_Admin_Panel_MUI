import apiClient from "./api";
import type { LicenseInfo } from "../config/license";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  avatar?: string | null;
  staff_role?: string | null;
  permissions?: string[] | null;
};

export type LoginResponse = {
  token: string;
  admin: AdminUser;
  license?: LicenseInfo;
};

export const adminLogin = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await apiClient.post("/auth/login", { email, password });
  return response.data.data;
};