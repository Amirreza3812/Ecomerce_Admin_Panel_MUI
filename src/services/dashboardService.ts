// src/services/dashboardService.ts
import apiClient from "./api";

export interface DashboardOverview {
  newCustomers: {
    value: number;
    change: number;
  };
  totalOrders: {
    value: number;
    change: number;
  };
  totalRevenue: {
    value: number;
    change: number;
  };
  activeProducts: {
    value: number;
    change: number;
  };
  averageOrderValue: {
    value: number;
    change: number;
  };
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface SessionsData {
  direct: number[];
  referral: number[];
  organic: number[];
}

export interface TopProduct {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
}

export interface SalesChartData {
  period: string;
  chartData: {
    period: string;
    orders: number;
    revenue: number;
  }[];
  revenueChange: number;
}

export interface OrderStatusDistribution {
  [status: string]: number;
}

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await apiClient.get("/dashboard/overview");
  return response.data.data;
};

export const getRecentOrders = async (limit = 10): Promise<RecentOrder[]> => {
  const response = await apiClient.get(
    `/dashboard/recent-orders?limit=${limit}`
  );
  return response.data.data;
};

export const getSessionsData = async (
  period = "week"
): Promise<SessionsData> => {
  const response = await apiClient.get(
    `/dashboard/sessions?period=${period}`
  );
  return response.data.data.chartData;
};

export const getTopProducts = async (
  period = "month",
  limit = 10
): Promise<TopProduct[]> => {
  const response = await apiClient.get(
    `/dashboard/top-products?period=${period}&limit=${limit}`
  );
  return response.data.data;
};

export const getOrderStatusDistribution = async (
  period = "month"
): Promise<OrderStatusDistribution> => {
  const response = await apiClient.get(
    `/dashboard/order-status?period=${period}`
  );
  return response.data.data;
};

export const getSalesChart = async (
  period = "week"
): Promise<SalesChartData> => {
  const response = await apiClient.get(
    `/dashboard/sales-chart?period=${period}`
  );
  return response.data.data;
};
