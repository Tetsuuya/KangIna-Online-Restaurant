// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../../api/products/productApi';
import { useState, useEffect } from 'react';
import { CategoryOption, Product } from '../../utils/types';

export const useCategories = () => {
  return useQuery<CategoryOption[], Error>({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductsByCategory = (category: string) => {
  return useQuery<Product[], Error>({
    queryKey: ['products', category],
    queryFn: () => productApi.getProductsByCategory(category),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !category.startsWith('search:'), // Disable when searching
  });
};

export const useSearchProducts = (query: string) => {
  return useQuery<Product[], Error>({
    queryKey: ['products', 'search', query],
    queryFn: () => productApi.searchProducts(query),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: query.length > 0, // Only run when there's a search query
  });
};

export const useProducts = () => {
  // Use local state for category and search
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const categoriesQuery = useCategories();
  const productsByCategoryQuery = useProductsByCategory(selectedCategory);
  const searchProductsQuery = useSearchProducts(searchQuery);

  // Handle search results or category results
  useEffect(() => {
    if (isSearching && searchProductsQuery.data) {
      setProducts(searchProductsQuery.data);
    } else if (!isSearching && productsByCategoryQuery.data) {
      setProducts(productsByCategoryQuery.data);
    }
  }, [
    isSearching, 
    searchProductsQuery.data, 
    productsByCategoryQuery.data
  ]);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsSearching(false);
    setSearchQuery('');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  };

  const resetProductStore = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setIsSearching(false);
  };

  return {
    // Queries
    categoriesQuery,
    productsQuery: {
      data: products,
      isLoading: isSearching ? searchProductsQuery.isLoading : productsByCategoryQuery.isLoading,
      isError: isSearching ? searchProductsQuery.isError : productsByCategoryQuery.isError,
      error: isSearching ? searchProductsQuery.error : productsByCategoryQuery.error,
    },
    
    // State
    selectedCategory,
    searchQuery,
    isSearching,
    
    // Actions
    handleCategorySelect,
    handleSearch,
    resetProductStore,
  };
};