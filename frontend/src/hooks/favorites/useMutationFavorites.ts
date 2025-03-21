import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleFavorite } from '../../api/favorites/favorites';
import { toast } from 'sonner';
import { Product } from '../../utils/types';

export const useMutationFavorites = () => {
  const queryClient = useQueryClient();

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

  return {
    toggleFavoriteMutation
  };
};
