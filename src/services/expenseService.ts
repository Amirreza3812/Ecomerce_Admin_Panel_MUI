import apiClient from "./api";

export interface Expense {
  id: number;
  worker_id?: number | null;
  amount: number | string;
  category: string;
  description?: string | null;
  expense_date: string;
  payment_method: "cash" | "card" | "bank" | "worker_paid";
  payment_status: "paid" | "unpaid";
  receipt_url?: string | null;
  worker?: { id: number; name: string; job_title?: string } | null;
  createdAt?: string;
}

export interface CreateExpenseData {
  worker_id?: number | null;
  amount: number;
  category: string;
  description?: string;
  expense_date: string;
  payment_method?: "cash" | "card" | "bank" | "worker_paid";
  payment_status?: "paid" | "unpaid";
  receipt?: File | null; // for FormData
}

export interface ExpensesResponse {
  expenses: Expense[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export const getExpenses = async (params?: {
  page?: number;
  limit?: number;
  type?: "income" | "expense";
  worker_id?: number;
  category?: string;
  payment_method?: string;
  payment_status?: string;
  from?: string;
  to?: string;
  search?: string;
}): Promise<ExpensesResponse> => {
  const response = await apiClient.get("/expenses", { params });
  return response.data.data;
};

const toFormData = (data: Partial<CreateExpenseData>) => {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "receipt") return;
    if (value === undefined || value === null) return;
    fd.append(key, String(value));
  });
  if (data.receipt instanceof File) {
    fd.append("receipt", data.receipt);
  }
  return fd;
};

export const createExpense = async (
  data: CreateExpenseData
): Promise<Expense> => {
  const response = await apiClient.post("/expenses", toFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const updateExpense = async (
  id: number,
  data: Partial<CreateExpenseData>
): Promise<Expense> => {
  const response = await apiClient.patch(`/expenses/${id}`, toFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data;
};

export const markExpensePaid = async (id: number): Promise<Expense> => {
  const response = await apiClient.patch(`/expenses/${id}/mark-paid`);
  return response.data.data;
};

export const deleteExpense = async (id: number): Promise<void> => {
  await apiClient.delete(`/expenses/${id}`);
};

export const getExpenseStats = async (params?: {
  from?: string;
  to?: string;
}): Promise<{
  totalAmount: number;
  paidTotal: number;
  unpaidTotal: number;
  unpaidCount: number;
  count: number;
  byCategory: Record<string, number>;
  byMethod: Record<string, number>;
}> => {
  const response = await apiClient.get("/expenses/stats", { params });
  return response.data.data;
};
