// src/services/categoryService.ts
import apiClient from "./api";

export interface SubCategory {
  id?: number;
  name: string;
  description?: string;
  image?: string;
  status: "active" | "inactive";
  sort_order: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  status: "active" | "inactive";
  sort_order: number;
  createdAt: string;
  updatedAt: string;
  subcategories?: SubCategory[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  image?: string;
  status?: "active" | "inactive";
  sort_order?: number;
  subcategories?: SubCategory[];
  imageFile?: File;
}

export const createCategory = async (
  data: FormData
): Promise<Category> => {
  try {
    const response = await apiClient.post("/categories", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Create category API error:", error);
    throw error;
  }
};

export const updateCategory = async (
  id: number,
  data: FormData
): Promise<Category> => {
  try {
    const response = await apiClient.put(`/categories/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Update category API error:", error);
    throw error;
  }
};

// Keep other functions the same
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get("/categories");
  return response.data.data;
};

export const getCategory = async (id: number): Promise<Category> => {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data.data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};

export const getCategoryStats = async (): Promise<any> => {
  const response = await apiClient.get("/categories/stats");
  return response.data.data;
};