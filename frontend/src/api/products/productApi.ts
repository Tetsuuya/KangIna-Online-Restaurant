// src/api/productApi.ts
import api from './../api';
import { Product, CategoryOption } from '../../utils/types';

// Product-related API calls
export const productApi = {
  // Get all categories
  getCategories: async (): Promise<CategoryOption[]> => {
    try {
      const response = await api.get<CategoryOption[]>('/categories/');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get products by category
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>(`/products/category/${category}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};