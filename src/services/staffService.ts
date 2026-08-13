import apiClient from "./api";

export type StaffRole =
  | "owner"
  | "manager"
  | "barista"
  | "cashier"
  | "accountant"
  | "custom";

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  staff_role: StaffRole;
  permissions: string[] | null;
  status: "active" | "inactive";
}

export type CreateStaffData = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  staff_role: StaffRole;
  permissions?: string[];
};

export const getStaff = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ staff: StaffMember[]; pagination?: any }> => {
  const res = await apiClient.get("/staff", { params });
  return res.data.data;
};

export const createStaff = async (
  data: CreateStaffData
): Promise<StaffMember> => {
  const res = await apiClient.post("/staff", data);
  return res.data.data;
};

export const updateStaff = async (
  id: number,
  data: Partial<CreateStaffData> & { status?: string }
): Promise<StaffMember> => {
  const res = await apiClient.patch(`/staff/${id}`, data);
  return res.data.data;
};

export const deactivateStaff = async (id: number): Promise<void> => {
  await apiClient.patch(`/staff/${id}/deactivate`);
};
