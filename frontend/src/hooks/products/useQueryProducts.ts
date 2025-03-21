// src/hooks/products/useQueryProducts.ts
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { Product, CategoryOption } from '../../utils/types';

const defaultCategories: CategoryOption[] = [
  { value: 'ALL', label: 'All Items' },
  { value: 'AGAHAN', label: 'Agahan' },
  { value: 'TANGHALIAN', label: 'Tanghalian' },
  { value: 'HAPUNAN', label: 'Hapunan' },
  { value: 'MERIENDA', label: 'Merienda' }
];

export const useQueryProducts = () => {
  // Categories query - using default categories since backend doesn't have categories endpoint yet
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: () => Promise.resolve(defaultCategories),
    staleTime: Infinity, // Never goes stale since these are static categories
  });

  // Fetch all products
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data } = await api.get<Product[]>('/products/');
        return data.map((product: Product) => ({
          ...product,
          category: product.category.toUpperCase() // Normalize category to uppercase
        }));
      } catch (error) {
        console.error('Error fetching products:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return {
    categoriesQuery,
    productsQuery
  };
};
