import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoriteApi } from '../../api/favorites/favorites';
import { toast } from 'sonner';
import { FavoriteState, Product } from '../../utils/types';

// Create a simple store for userId persistence
const userIdStore = {
  userId: null as number | null,
  setUserId: (id: number | null) => {
    userIdStore.userId = id;
  },
  clearFavorites: () => {
    userIdStore.userId = null;
  },
};

// Add direct methods for external use
export const setFavoriteUserId = (id: number | null) => {
  userIdStore.setUserId(id);
};

export const clearFavoriteStore = () => {
  userIdStore.clearFavorites();
};

export const useFavoriteStore = (): FavoriteState => {
  const queryClient = useQueryClient();
  const userId = userIdStore.userId;

  // Query for fetching favorites
  const { data: favorites = [], isLoading, error } = useQuery({
    queryKey: ['favorites', userId],
    queryFn: async () => {
      if (!userId) return [];
      return favoriteApi.getFavoritesList();
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  });

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!userId) throw new Error('User not authenticated');
      return favoriteApi.toggleFavorite(productId);
    },
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites', userId] });

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData(['favorites', userId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['favorites', userId], (old: Product[] = []) => {
        const isCurrentlyFavorited = old.some(p => p.id === productId);
        if (isCurrentlyFavorited) {
          return old.filter(p => p.id !== productId);
        } else {
          // If not a favorite, trigger a full refresh to ensure consistency
          return old;
        }
      });

      return { previousFavorites };
    },
    onError: (error, _, context) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle favorite';
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites', userId], context.previousFavorites);
      }
      toast.error(errorMessage);
    },
    onSuccess: async (response) => {
      // Show success toast
      toast.success(
        response.status === 'added to favorites'
          ? 'Added to favorites'
          : 'Removed from favorites'
      );

      // If adding to favorites, refetch to ensure consistency
      if (response.status === 'added to favorites') {
        await queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      }
    },
  });

  // Helper function to check if a product is favorited
  const isFavorite = (productId: number) => {
    return favorites.some(product => product.id === productId);
  };

  // Helper function to remove favorite
  const removeFavorite = async (productId: number) => {
    try {
      await toggleFavoriteMutation.mutateAsync(productId);
      toast.success('Removed from favorites');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove from favorites';
      toast.error(errorMessage);
    }
  };

  // Fetch favorites function
  const fetchFavorites = async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
  };

  // Wrapper for toggleFavorite to match the interface
  const toggleFavorite = async (productId: number) => {
    if (!userId) {
      toast.error('Please log in to add favorites');
      return;
    }
    await toggleFavoriteMutation.mutateAsync(productId);
  };

  return {
    favorites,
    isLoading,
    error: error as string | null,
    userId,
    
    // Actions
    fetchFavorites,
    toggleFavorite,
    isFavorite,
    removeFavorite,
    clearFavorites: () => {
      userIdStore.clearFavorites();
      queryClient.setQueryData(['favorites'], []);
    },
    setUserId: (newUserId: number | null) => {
      if (userIdStore.userId !== newUserId) {
        userIdStore.setUserId(newUserId);
        if (newUserId) {
          queryClient.invalidateQueries({ queryKey: ['favorites', newUserId] });
        } else {
          queryClient.setQueryData(['favorites'], []);
        }
      }
    },
  };
};