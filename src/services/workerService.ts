import apiClient from "./api";

export interface Worker {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  job_title?: string | null;
  hire_date?: string | null;
  base_salary?: number | string | null;
  status: "active" | "inactive";
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateWorkerData {
  name: string;
  phone?: string;
  email?: string;
  job_title?: string;
  hire_date?: string;
  base_salary?: number;
  status?: "active" | "inactive";
  notes?: string;
}

export interface WorkersResponse {
  workers: Worker[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export const getWorkers = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<WorkersResponse> => {
  const response = await apiClient.get("/workers", { params });
  return response.data.data;
};

export const getWorker = async (id: number): Promise<Worker> => {
  const response = await apiClient.get(`/workers/${id}`);
  return response.data.data;
};

export const createWorker = async (data: CreateWorkerData): Promise<Worker> => {
  const response = await apiClient.post("/workers", data);
  return response.data.data;
};

export const updateWorker = async (
  id: number,
  data: Partial<CreateWorkerData>
): Promise<Worker> => {
  const response = await apiClient.patch(`/workers/${id}`, data);
  return response.data.data;
};

export const deleteWorker = async (id: number): Promise<void> => {
  await apiClient.delete(`/workers/${id}`);
};

export const getWorkerStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
}> => {
  const response = await apiClient.get("/workers/stats/summary");
  return response.data.data;
};