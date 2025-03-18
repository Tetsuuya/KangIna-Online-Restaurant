import React from 'react';
import { Product } from '../../api/productApi';
import { ProductCard } from './ProductCard';


interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
}


export const ProductGrid: React.FC<ProductGridProps> = ({ products, isLoading, isError, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="pb-[75%] relative bg-gray-200 animate-pulse"></div>
            <div className="p-3">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3 animate-pulse"></div>
              <div className="h-9 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }


  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p>Error: {error?.message || 'Failed to fetch products'}</p>
      </div>
    );
  }


  if (products.length === 0) {
    return (
      <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">
        <p>No products found in this category.</p>
      </div>
    );
  }


  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};


