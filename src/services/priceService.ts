// src/services/priceService.ts
import apiClient from "./api";

export interface PriceAnalytics {
  overview: {
    totalProducts: number;
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  };
  priceRanges: Record<string, number>;
  categoryStats: Record<
    string,
    {
      productCount: number;
      minPrice: number;
      maxPrice: number;
      avgPrice: number;
      subcategories?: Record<string, any>;
    }
  >;
  filters?: {
    categoryId: number | null;
    subcategoryId: number | null;
  };
}

export interface PriceIncreaseData {
  percentage: number;
  categoryId?: number;
  subcategoryId?: number;
}

export interface PriceDiscountData {
  percentage: number;
  categoryId?: number;
  subcategoryId?: number;
}

export interface BulkPriceUpdate {
  productId: number;
  price: number;
}

export interface BulkPriceUpdateData {
  updates: BulkPriceUpdate[];
}

export const getPriceAnalytics = async (
  categoryId?: number,
  subcategoryId?: number
): Promise<PriceAnalytics> => {
  try {
    const params = new URLSearchParams();
    if (categoryId) params.append("categoryId", categoryId.toString());
    if (subcategoryId) params.append("subcategoryId", subcategoryId.toString());

    const response = await apiClient.get(
      `/prices/analytics?${params.toString()}`
    );
    console.log("Price analytics response:", response.data);

    // Based on the provided response structure, the data is in response.data.data
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      console.warn(
        "Unexpected price analytics response structure:",
        response.data
      );
      return {
        overview: { totalProducts: 0, minPrice: 0, maxPrice: 0, avgPrice: 0 },
        priceRanges: {},
        categoryStats: {},
      };
    }
  } catch (error) {
    console.error("Error fetching price analytics:", error);
    throw error;
  }
};

export const increasePrices = async (data: PriceIncreaseData): Promise<any> => {
  try {
    const response = await apiClient.patch("/prices/increase", data);
    return response.data;
  } catch (error) {
    console.error("Error increasing prices:", error);
    throw error;
  }
};

export const applyDiscount = async (data: PriceDiscountData): Promise<any> => {
  try {
    const response = await apiClient.patch("/prices/discount", data);
    return response.data;
  } catch (error) {
    console.error("Error applying discount:", error);
    throw error;
  }
};

export const setBulkPrices = async (
  data: BulkPriceUpdateData
): Promise<any> => {
  try {
    const response = await apiClient.patch("/prices/set-bulk", data);
    return response.data;
  } catch (error) {
    console.error("Error setting bulk prices:", error);
    throw error;
  }
};
