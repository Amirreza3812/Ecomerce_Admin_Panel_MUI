// src/services/productService.ts
import apiClient from "./api";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  subcategory_id: number;
  category_name?: string;
  subcategory_name?: string;
  image: string;
  status: "active" | "inactive";
  stock: number;
  ingredients?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  category_id: number;
  subcategory_id: number;
  image?: string;
  status?: "active" | "inactive";
  stock?: number;
  ingredients?: string;
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await apiClient.get("/products");

    // Handle the actual response structure: { success: true, data: { products: [...], pagination: {...} } }
    if (
      response.data &&
      response.data.data &&
      response.data.data.products &&
      Array.isArray(response.data.data.products)
    ) {
      return response.data.data.products;
    } else if (response.data && Array.isArray(response.data)) {
      // Fallback for different structure
      return response.data;
    } else {
      console.warn("Unexpected API response structure:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await apiClient.get(`/products/${id}`);
  return response.data.data;
};

export const createProduct = async (data: FormData): Promise<Product> => {
  try {
    const response = await apiClient.post("/products", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Create product response:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("Create product API error:", error);
    throw error;
  }
};

export const updateProduct = async (
  id: number,
  data: FormData
): Promise<Product> => {
  try {
    const response = await apiClient.put(`/products/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  } catch (error) {
    console.error("Update product API error:", error);
    throw error;
  }
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};

export const toggleProductStatus = async (id: number): Promise<Product> => {
  try {
    const response = await apiClient.patch(`/products/${id}/status`);
    return response.data.data;
  } catch (error) {
    console.error("Toggle product status error:", error);
    throw error;
  }
};

export const getProductStats = async (): Promise<any> => {
  const response = await apiClient.get("/products/stats");
  return response.data.data;
};
