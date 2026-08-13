import apiClient from "./api";

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

export interface Order {
  id: number;
  order_number?: string;
  orderNumber?: string;
  customer_name?: string;
  customerName?: string;
  customer_phone?: string;
  customerEmail?: string;
  user?: { id: number; name?: string; email?: string; phone?: string };
  final_amount?: number | string;
  total_amount?: number | string;
  totalAmount?: number;
  status: OrderStatus;
  payment_status?: PaymentStatus;
  payment_method?: PaymentMethod | null;
  createdAt: string;
  completed_at?: string | null;
}

export interface OrdersListResult {
  orders: Order[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

function normalizeOrder(raw: any): Order {
  return {
    id: raw.id,
    order_number: raw.order_number ?? raw.orderNumber,
    orderNumber: raw.orderNumber ?? raw.order_number,
    customer_name:
      raw.customer_name ?? raw.customerName ?? raw.user?.name ?? undefined,
    customerName:
      raw.customerName ?? raw.customer_name ?? raw.user?.name ?? undefined,
    customer_phone: raw.customer_phone ?? raw.user?.phone,
    customerEmail: raw.customerEmail ?? raw.user?.email,
    user: raw.user,
    final_amount: raw.final_amount,
    total_amount: raw.total_amount,
    totalAmount: Number(
      raw.totalAmount ?? raw.final_amount ?? raw.total_amount ?? 0
    ),
    status: raw.status,
    payment_status: raw.payment_status ?? raw.paymentStatus ?? "pending",
    payment_method: raw.payment_method ?? raw.paymentMethod ?? null,
    createdAt: raw.createdAt,
    completed_at: raw.completed_at ?? null,
  };
}

export const getOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
  search?: string;
}): Promise<OrdersListResult> => {
  const response = await apiClient.get("/orders", { params });
  const data = response.data.data;

  if (Array.isArray(data)) {
    return { orders: data.map(normalizeOrder) };
  }

  const list = data?.orders || data?.rows || [];
  return {
    orders: list.map(normalizeOrder),
    pagination: data?.pagination,
  };
};

export const getOrder = async (id: number): Promise<Order> => {
  const response = await apiClient.get(`/orders/${id}`);
  const raw = response.data.data ?? response.data;
  return normalizeOrder(raw);
};

export const updateOrderStatus = async (
  id: number,
  status: OrderStatus
): Promise<Order> => {
  const response = await apiClient.patch(`/orders/${id}/status`, { status });
  const raw = response.data.data ?? response.data;
  return normalizeOrder(raw);
};

export const updateOrderPayment = async (
  id: number,
  payload: {
    payment_status?: PaymentStatus;
    payment_method?: PaymentMethod;
  }
): Promise<Order> => {
  const response = await apiClient.patch(`/orders/${id}/payment`, payload);
  const raw = response.data.data ?? response.data;
  return normalizeOrder(raw);
};
