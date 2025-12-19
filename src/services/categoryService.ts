// src/services/categoryService.ts
import apiClient from "./api";

export interface SubCategory {
  id?: number;
  name: string;
  description?: string;
  icon?: string; // Changed from image to icon
  status: "active" | "inactive";
  sort_order: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string; // Changed from image to icon
  status: "active" | "inactive";
  sort_order: number;
  createdAt: string;
  updatedAt: string;
  subcategories?: SubCategory[];
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  icon?: string; // Changed from image to icon
  status?: "active" | "inactive";
  sort_order?: number;
  subcategories?: SubCategory[];
}

export interface IconOption {
  name: string;
  url: string;
}

// Add function to fetch icons
export const getIcons = async (): Promise<IconOption[]> => {
  try {
    const response = await apiClient.get("/categories/icons");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching icons:", error);
    throw error;
  }
};

export const createCategory = async (data: CreateCategoryData): Promise<Category> => {
  try {
    const response = await apiClient.post("/categories", data);
    return response.data.data;
  } catch (error) {
    console.error("Create category API error:", error);
    throw error;
  }
};

export const updateCategory = async (
  id: number,
  data: CreateCategoryData
): Promise<Category> => {
  try {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error("Update category API error:", error);
    throw error;
  }
};

// Keep other functions the same
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await apiClient.get("/categories");
    // Based on the provided response structure, the data is in response.data.data
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    } else {
      console.warn("Unexpected API response structure:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
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