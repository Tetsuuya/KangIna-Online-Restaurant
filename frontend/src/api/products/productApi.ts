// src/api/productApi.ts
import api from '../api';
import { Product, CategoryOption } from '../../utils/types';

// Product-related API calls
export const getCategories = async () => {
  const { data } = await api.get<CategoryOption[]>('/categories/');
  return data;
};

export const getProductsByCategory = async (category: string) => {
  const { data } = await api.get<Product[]>(`/products/category/${category}/`);
  return data;
};

export const searchProducts = async (query: string) => {
  const { data } = await api.get<Product[]>(`/products/search?q=${encodeURIComponent(query)}`);
  return data;
};