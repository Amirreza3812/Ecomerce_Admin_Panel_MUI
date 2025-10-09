// src/services/subcategoryService.ts
import apiClient from "./api";

export interface SubCategory {
  id: number;
  name: string;
  description?: string;
  image?: string;
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
  image?: string;
  status?: "active" | "inactive";
  sort_order?: number;
  category_id: number;
  imageFile?: File;
}

export const getSubCategories = async (): Promise<SubCategory[]> => {
  try {
    const response = await apiClient.get("/subcategories");
    console.log("Subcategories API response:", response.data);

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
  const formData = new FormData();

  // Append all fields to FormData
  formData.append("name", data.name);
  formData.append("category_id", data.category_id.toString());
  if (data.description) formData.append("description", data.description);
  if (data.status) formData.append("status", data.status);
  if (data.sort_order !== undefined)
    formData.append("sort_order", data.sort_order.toString());

  // Append image file if provided
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  }

  const response = await apiClient.post("/subcategories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

export const updateSubCategory = async (
  id: number,
  data: CreateSubCategoryData
): Promise<SubCategory> => {
  const formData = new FormData();

  // Append all fields to FormData
  formData.append("name", data.name);
  formData.append("category_id", data.category_id.toString());
  if (data.description !== undefined)
    formData.append("description", data.description);
  if (data.status) formData.append("status", data.status);
  if (data.sort_order !== undefined)
    formData.append("sort_order", data.sort_order.toString());

  // Append image file if provided
  if (data.imageFile) {
    formData.append("image", data.imageFile);
  }

  const response = await apiClient.put(`/subcategories/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
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
