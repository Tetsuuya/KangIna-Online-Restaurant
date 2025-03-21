import api from '../../lib/api';
import { Order } from '../../utils/types';

export const createOrder = async () => {
  const { data } = await api.post<Order>('/orders/create/');
  return data;
};

export const getOrders = async () => {
  const { data } = await api.get<Order[]>('/orders/');
  return data;
};

export const getOrderDetail = async (orderId: number) => {
  const { data } = await api.get<Order>(`/orders/${orderId}/`);
  return data;
};