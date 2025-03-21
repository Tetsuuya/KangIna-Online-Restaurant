// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import api from '../../api/api';
import { Product, CategoryOption } from '../../utils/types';

const defaultCategories: CategoryOption[] = [
  { value: 'ALL', label: 'All Items' },
  { value: 'AGAHAN', label: 'Agahan' },
  { value: 'TANGHALIAN', label: 'Tanghalian' },
  { value: 'HAPUNAN', label: 'Hapunan' },
  { value: 'MERIENDA', label: 'Merienda' }
];

export const useProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories query - using default categories since backend doesn't have categories endpoint yet
  const { data: categories = defaultCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => Promise.resolve(defaultCategories),
    staleTime: Infinity, // Never goes stale since these are static categories
  });

  // Fetch all products
  const { data: allProducts = [], isLoading: isProductsLoading, isError, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const { data } = await api.get<Product[]>('/products/');
        return data.map(product => ({
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

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let result = allProducts;

    // Apply category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter(product => product.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allProducts, selectedCategory, searchQuery]);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    setSearchQuery('');
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.trim());
    if (query.trim() === '') {
      setSelectedCategory('ALL');
    }
  }, []);

  return {
    categories,
    products: filteredProducts,
    selectedCategory,
    searchQuery,
    isLoading: isProductsLoading,
    isError,
    error,
    handleCategorySelect,
    handleSearch,
    resetFilters: useCallback(() => {
      setSelectedCategory('ALL');
      setSearchQuery('');
    }, [])
  };
};