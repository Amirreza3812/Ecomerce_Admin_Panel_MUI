// src/services/customerService.ts
import apiClient from "./api";

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  status: "active" | "inactive" | "banned";
  avatar?: string | null;
  createdAt: string;
  updatedAt?: string;
  statistics?: {
    totalOrders?: number;
    totalSpent?: number;
    totalComments?: number;
    totalFavorites?: number;
  };
}

export interface CustomerProfile {
  customer: Customer;
  statistics: {
    totalOrders: number;
    completedOrders: number;
    totalSpent: number;
    avgOrderValue: number;
    totalComments: number;
    totalFavorites: number;
  };
  orderHistory: Array<{
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    itemCount: number;
    createdAt: string;
    completedAt?: string;
  }>;
  recentComments: any[];
  favoriteProducts: Array<{
    id: number;
    createdAt: string;
    product: {
      id: number;
      name: string;
      price: number;
      image?: string;
      status: string;
    };
  }>;
  mostOrderedItems: any[];
  lastOrder: {
    id: number;
    orderNumber: string;
    status: string;
    amount: number;
    date: string;
  } | null;
}

export interface CustomerAnalytics {
  overview: {
    totalCustomers: number;
    activeCustomers: number;
    newCustomers: number;
    inactiveCustomers: number;
  };
  topCustomers?: any[];
}

export interface CustomersResponse {
  users: Customer[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export const getCustomers = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<CustomersResponse> => {
  const response = await apiClient.get("/customers", {
    params: { role: "customer", ...params },
  });
  return response.data.data;
};

export const getCustomerProfile = async (
  id: number
): Promise<CustomerProfile> => {
  const response = await apiClient.get(`/customers/${id}/profile`);
  return response.data.data;
};

export const getCustomerAnalytics = async (): Promise<CustomerAnalytics> => {
  const response = await apiClient.get("/customers/analytics");
  return response.data.data;
};

export const updateCustomerStatus = async (
  id: number,
  status: "active" | "inactive" | "banned"
): Promise<void> => {
  await apiClient.patch(`/customers/${id}/status`, { status });
};

export const deleteCustomer = async (id: number): Promise<void> => {
  await apiClient.delete(`/customers/${id}`);
};

/** Stub — wire to your SMS provider later */
export const sendCustomerSms = async (
  id: number,
  message: string
): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post(`/customers/${id}/sms`, { message });
  return response.data;
};

export const sendBulkCustomerSms = async (
  message: string
): Promise<{ success: boolean; message: string; sent?: number; skipped?: number }> => {
  const response = await apiClient.post("/customers/sms/bulk", { message });
  return response.data.data ?? response.data;
};