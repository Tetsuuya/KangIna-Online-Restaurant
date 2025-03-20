import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toggleFavorite, getFavorites } from '../../api/favorites/favorites';
import { toast } from 'sonner';
import { useAuthStore } from '../auth/useauth';
import { Product } from '../../utils/types';

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: toggleFavorite,
    onMutate: async (productId: number) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      
      // Get current favorites
      const previousFavorites = queryClient.getQueryData<Product[]>(['favorites']) || [];
      
      // Optimistically update favorites
      const isCurrentlyFavorite = previousFavorites.some(p => p.id === productId);
      const newFavorites = isCurrentlyFavorite
        ? previousFavorites.filter(p => p.id !== productId)
        : [...previousFavorites, { id: productId } as Product];
      
      queryClient.setQueryData(['favorites'], newFavorites);
      
      return { previousFavorites };
    },
    onError: (_, __, context) => {
      // Revert on error
      queryClient.setQueryData(['favorites'], context?.previousFavorites);
      toast.error('Failed to update favorites');
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });

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