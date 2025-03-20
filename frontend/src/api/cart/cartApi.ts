import api from './../api'; // Import the configured axios instance
import { CartItem } from '../../utils/types';

export const getCartItems = async (): Promise<CartItem[]> => {
  try {
    const response = await api.get('/cart/');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Please log in to view your cart');
    }
    throw new Error(error.response?.data?.error || 'Failed to fetch cart items');
  }
};

export const addToCart = async (productId: number, quantity: number = 1): Promise<CartItem> => {
  try {
    const response = await api.post('/cart/add/', {
      product_id: productId,
      quantity
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Please log in to add items to cart');
    }
    throw new Error(error.response?.data?.error || 'Failed to add item to cart');
  }
};

export const removeFromCart = async (productId: number): Promise<void> => {
  try {
    await api.delete(`/cart/remove/${productId}/`);
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Please log in to remove items from cart');
    }
    throw new Error(error.response?.data?.error || 'Failed to remove item from cart');
  }
};

export const updateCartItemQuantity = async (productId: number, quantity: number): Promise<CartItem> => {
  try {
    await removeFromCart(productId);
    return await addToCart(productId, quantity);
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Please log in to update cart items');
    }
    throw new Error(error.response?.data?.error || 'Failed to update item quantity');
  }
};