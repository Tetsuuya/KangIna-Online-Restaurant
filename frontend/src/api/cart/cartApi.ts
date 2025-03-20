import api from '../api';
import { CartItem } from '../../utils/types';

export const getCartItems = async () => {
  const { data } = await api.get<CartItem[]>('/cart/');
  return data;
};

export const addToCart = async (productId: number, quantity = 1) => {
  const { data } = await api.post<CartItem>('/cart/add/', {
    product_id: productId,
    quantity
  });
  return data;
};

export const removeFromCart = async (productId: number) => {
  await api.delete(`/cart/remove/${productId}/`);
};

export const updateCartItemQuantity = async (productId: number, quantity: number) => {
  // First remove the item
  await api.delete(`/cart/remove/${productId}/`);
  // Then add it back with the exact quantity
  const { data } = await api.post<CartItem>('/cart/add/', {
    product_id: productId,
    quantity: quantity
  });
  return data;
};