import api from './../api';  // Import the shared API instance
import { Product, FavoriteToggleResponse } from '../../utils/types';

export const favoriteApi = {
  /**
   * Toggle favorite status for a product
   * @param productId - ID of the product to toggle favorite
   * @returns Promise with toggle response
   */
  toggleFavorite: async (productId: number): Promise<FavoriteToggleResponse> => {
    try {
      const response = await api.post(`/favorites/toggle/${productId}/`, {});
      return response.data;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  },

  /**
   * Fetch user's favorite products
   * @returns Promise with list of favorite products
   */
  getFavoritesList: async (): Promise<Product[]> => {
    try {
      const response = await api.get('/favorites/favorites_list/');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  }
};