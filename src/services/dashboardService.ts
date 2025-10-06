// src/services/dashboardService.ts
import apiClient from './api';

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

export const getDashboardOverview = async (): Promise<DashboardOverview> => {
  const response = await apiClient.get('/admin/dashboard/overview');
  return response.data.data;
};