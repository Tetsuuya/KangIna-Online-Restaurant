import api from './../api';
import { Order } from '../../utils/types';

export const orderApi = {
  createOrder: async () => {
    try {
      const response = await api.post<Order>('/orders/create/', {});
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Fetch recent orders
  getRecentOrders: async () => {
    try {
      const response = await api.get<Order[]>('/orders/');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Fetch specific order details
  getOrderDetail: async (orderId: number) => {
    try {
      const response = await api.get<Order>(`/orders/${orderId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }
};