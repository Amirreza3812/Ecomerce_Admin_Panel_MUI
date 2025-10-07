// src/services/categoryService.ts
import apiClient from "./api";

export interface Category {
  id: number;
  name: string;
  // ... other properties
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get("/categories");
  return response.data.data;
};

export const getCategory = async (id: number): Promise<Category> => {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data.data;
};

export const createCategory = async (
  data: CreateCategoryData
): Promise<Category> => {
  const response = await apiClient.post("/categories", data);
  return response.data.data;
};

export const updateCategory = async (
  id: number,
  data: UpdateCategoryData
): Promise<Category> => {
  const response = apiClient.put(`/categories/${id}`, data);
  return response.data.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};

export const getCategoryStats = async (): Promise<CategoryStats> => {
  const response = await apiClient.get("/stats");
  return response.data.data;
};
