import React from 'react';
import { ProductGridProps } from '../../utils/types';
import { ProductCard } from './ProductCard';

export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading, isError, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-3">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="pb-[60%] relative bg-gray-200 animate-pulse"></div>
            <div className="p-2">
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-3 rounded-md">
        <p>Error: {error?.message || 'Failed to fetch products'}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="bg-yellow-50 text-yellow-600 p-3 rounded-md">
        <p>No products found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};