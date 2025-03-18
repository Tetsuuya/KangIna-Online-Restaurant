import React, { useState } from 'react';
import { Product } from '../../api/productApi';
import { useCartStore } from '../../store/CartStore';
import { useFavoriteStore } from '../../store/StoreFavorites';
import { ProductDetailModal } from './ProductDetailModal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Using Zustand stores for cart and favorites management
  const { addItem, isLoading: isCartLoading } = useCartStore();
  const { toggleFavorite, isFavorite } = useFavoriteStore();
  
  // Get favorite status directly from the store
  const isFav = isFavorite(product.id);
  
  // State for controlling the detail modal
  const [showDetails, setShowDetails] = useState(false);
  
  const handleAddToCart = () => {
    addItem(product.id);
  };
  
  const handleToggleFavorite = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent triggering parent click events if event exists
    toggleFavorite(product.id);
  };
  
  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-md overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full h-80 flex flex-col cursor-pointer group"
        onClick={() => setShowDetails(true)}
      >
        {/* Image container with fixed height */}
        <div className="relative w-full h-40 overflow-hidden mx-auto mt-4 px-4">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
        
        {/* Content area with flex to use remaining space */}
        <div className="p-4 flex flex-col flex-grow justify-between">
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg truncate max-w-[calc(100%-40px)]">
                {product.name}
              </h3>
              <button 
                onClick={handleToggleFavorite}
                className="p-1.5 rounded-full bg-[#D9D9D9] hover:bg-[#252566] transition-all duration-300 flex-shrink-0"
                aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  className={`w-5 h-5 transition-all duration-300 ${
                  isFav 
                    ? 'fill-red-500 stroke-red-500' 
                    : 'fill-none stroke-[#545454] hover:fill-red-500 hover:stroke-red-500' 
                  }`}
                  strokeWidth="2"
                > 
                  <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>
            </div>
            <p className="font-medium text-gray-600 mt-1">
              ₱{product.price.toLocaleString()}
            </p>
          </div>
          
          <div className="grid grid-cols-10 gap-2 mt-auto pt-3">
            <button 
              className={`col-span-6 py-1.5 rounded-full text-white text-sm font-medium transition-colors duration-300 ${
                isCartLoading ? 'bg-blue-400' : 'bg-[#32347C] hover:bg-[#ED3F25]'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={isCartLoading}
            >
              {isCartLoading ? 'Adding...' : 'Add to Cart'}
            </button>
            <button 
              className="col-span-4 py-1.5 rounded-full text-[#32347C] text-sm font-medium border border-[#32347C] bg-white hover:bg-[#32347C] hover:text-white transition-colors duration-300"
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(true);
              }}
            >
              View
            </button>
          </div>
        </div>
      </div>
      
      {showDetails && (
        <ProductDetailModal 
          product={product}
          onClose={() => setShowDetails(false)}
          onToggleFavorite={() => handleToggleFavorite()}
        />
      )}
    </>
  );
};
