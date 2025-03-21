// src/hooks/useProducts.ts
import { useState, useCallback, useMemo } from 'react';
import { useQueryProducts } from './useQueryProducts';
import { Product } from '../../utils/types';

export const useProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { categoriesQuery, productsQuery } = useQueryProducts();
  
  const categories = categoriesQuery.data || [];
  const allProducts = productsQuery.data || [];
  const isProductsLoading = productsQuery.isLoading;
  const isError = productsQuery.isError;
  const error = productsQuery.error;

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    let result = allProducts;

    // Apply category filter
    if (selectedCategory !== 'ALL') {
      result = result.filter((product: Product) => product.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((product: Product) => 
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