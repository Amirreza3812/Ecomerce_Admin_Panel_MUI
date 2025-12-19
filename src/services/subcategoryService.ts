// src/services/subcategoryService.ts
import apiClient from "./api";

export interface SubCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string; // Changed from image to icon
  status: "active" | "inactive";
  sort_order: number;
  category_id: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface CreateSubCategoryData {
  name: string;
  description?: string;
  icon?: string; // Changed from image to icon
  status?: "active" | "inactive";
  sort_order?: number;
  category_id: number;
}

export interface IconOption {
  name: string;
  url: string;
}



// Add function to fetch subcategory icons
export const getSubCategoryIcons = async (): Promise<IconOption[]> => {
  try {
    const response = await apiClient.get("/subcategories/icons");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching subcategory icons:", error);
    throw error;
  }
};

export const getSubCategories = async (): Promise<SubCategory[]> => {
  try {
    const response = await apiClient.get("/subcategories");
    // Handle the response structure, assuming it's similar to categories
    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data)
    ) {
      return response.data.data;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn(
        "Unexpected Subcategories API response structure:",
        response.data
      );
      return [];
    }
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw error;
  }
};

export const getSubCategory = async (id: number): Promise<SubCategory> => {
  const response = await apiClient.get(`/subcategories/${id}`);
  return response.data.data;
};

export const createSubCategory = async (
  data: CreateSubCategoryData
): Promise<SubCategory> => {
  const response = await apiClient.post("/subcategories", data);
  return response.data.data;
};

export const updateSubCategory = async (
  id: number,
  data: CreateSubCategoryData
): Promise<SubCategory> => {
  const response = await apiClient.patch(`/subcategories/${id}`, data);
  return response.data.data;
};

export const deleteSubCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/subcategories/${id}`);
};

export const toggleSubCategoryStatus = async (
  id: number
): Promise<SubCategory> => {
  const response = await apiClient.patch(`/subcategories/${id}/toggle-status`);
  return response.data.data;
};