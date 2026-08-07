// src/services/orderService.ts
import apiClient from "./api";

export interface Order {
  id: number;
  order_number?: string;
  orderNumber?: string;
  customer_name?: string;
  customerName?: string;
  customer_phone?: string;
  customerEmail?: string;
  final_amount?: number | string;
  totalAmount?: number;
  status: OrderStatus;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod | null;
  createdAt: string;
  completed_at?: string | null;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod =
  | "cash"
  | "card"
  | "digital_wallet"
  | "bank_transfer"
  | "online";

export const getOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
  search?: string;
}): Promise<{ orders: Order[]; pagination?: any }> => {
  const response = await apiClient.get("/orders", { params });
  const data = response.data.data;
  // support different backend shapes
  if (Array.isArray(data)) return { orders: data };
  return {
    orders: data.orders || data.rows || [],
    pagination: data.pagination,
  };
};

export const getOrder = async (id: number): Promise<Order> => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (
  id: number,
  status: OrderStatus
): Promise<Order> => {
  const response = await apiClient.patch(`/orders/${id}/status`, { status });
  return response.data.data;
};

export const updateOrderPayment = async (
  id: number,
  payload: { payment_status?: PaymentStatus; payment_method?: PaymentMethod }
): Promise<Order> => {
  const response = await apiClient.patch(`/orders/${id}/payment`, payload);
  return response.data.data;
};
