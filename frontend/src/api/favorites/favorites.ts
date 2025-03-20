import api from '../api';
import { Product } from '../../utils/types';

export const toggleFavorite = async (productId: number) => {
  const { data } = await api.post(`/favorites/toggle/${productId}/`);
  return data;
};

export const getFavorites = async () => {
  const { data } = await api.get<Product[]>('/favorites/favorites_list/');
  return data;
};