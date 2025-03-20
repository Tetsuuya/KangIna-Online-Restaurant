import React from 'react';
import { ProductDetailModalProps } from '../../utils/types';
import { useFavorites } from '../../hooks/favorites/usefavorites';
import { useCart } from '../../hooks/cart/usecart';
import { useAuthStore } from '../../hooks/auth/useauth';
import { useNavigate } from 'react-router-dom';

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onToggleFavorite
}) => {
  const navigate = useNavigate();
  const { isFavorite } = useFavorites();
  const { addItem, isLoading: isCartLoading } = useCart();
  const { isAuthenticated } = useAuthStore();

  // Safe price formatting function
  const formatPrice = (price: number | string | undefined) => {
    if (price === undefined || price === null) return 'N/A';
   
    // Convert to number if it's a string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
   
    // Check if it's a valid number
    return isNaN(numPrice) ? 'N/A' : `₱${numPrice.toFixed(2)}`;
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // If not authenticated, redirect to login
      navigate('/login');
      return;
    }
    try {
      await addItem(product.id);
    } catch (error) {
      // Error is already handled by the cart store
      console.error('Error adding to cart:', error);
    }
  };

  return (
    <>
      {/* Overlay - use z-50 to ensure it's above other content */}
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
      ></div>

      {/* Side Panel - use z-60 to be above the overlay */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white rounded-lg shadow-2xl p-6 z-60 overflow-y-auto flex flex-col">
        <div className="relative mb-4">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 text-black hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-blue-900 break-words">{product.name}</h2>
        </div>

        {/* Description */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-700">Description</h3>
          <p className="text-sm text-gray-600">
            {product.description || 'No description available'}
          </p>
        </div>

        {/* Product Image */}
        <div className="mb-4">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No Image</span>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto pr-2">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-700">Ingredients</h3>
            <p className="text-sm text-gray-600">
              {product.ingredients || 'No ingredients listed'}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 mb-4">
            <div>
              <h3 className="font-semibold text-gray-700">Serving Size</h3>
              <p className="text-sm text-gray-600">
                {product.serving_size || 'N/A'}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700">Dietary Info</h3>
              <p className="text-sm text-gray-600">
                {product.dietary_info || 'No info'}
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Section */}
        <div className="sticky bottom-0 left-0 w-full bg-white pt-4 border-t">
          <div className="mb-4">
            <span className="text-lg font-bold text-black block mb-2">
              {formatPrice(product.price)}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={onToggleFavorite}
                className={`flex-1 px-3 py-2 rounded-full text-sm ${
                  isFavorite(product.id)
                    ? 'bg-red-400 text-white'
                    : 'bg-red-100 text-red-400'
                }`}
              >
                {isFavorite(product.id) ? 'Favorited' : 'Add to Favorites'}
              </button>
              <button
                className={`flex-1 text-white py-2 rounded-full ${
                  isCartLoading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-[#32347C] hover:bg-blue-950'
                }`}
                onClick={handleAddToCart}
                disabled={isCartLoading}
              >
                {isCartLoading ? 'Adding...' : isAuthenticated ? 'Add to Cart' : 'Login to Add'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};  
