import { useQueryFavorites } from './useQueryFavorites';
import { useMutationFavorites } from './useMutationFavorites';
import { toast } from 'sonner';

export const useFavorites = () => {
  const { favoritesQuery, isAuthenticated } = useQueryFavorites();
  const { toggleFavoriteMutation } = useMutationFavorites();

  const favorites = favoritesQuery.data || [];
  const isLoading = favoritesQuery.isLoading;

  const handleToggleFavorite = (productId: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to manage favorites');
      return;
    }
    toggleFavoriteMutation.mutate(productId);
  };

  const isFavorite = (productId: number) => 
    favorites.some(product => product.id === productId);

  return {
    favorites,
    isLoading,
    toggleFavorite: handleToggleFavorite,
    isFavorite,
  };
};