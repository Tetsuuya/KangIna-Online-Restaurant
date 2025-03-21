import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '../../api/favorites/favorites';
import { useAuthStore } from '../auth/useauth';

export const useQueryFavorites = () => {
  const { isAuthenticated } = useAuthStore();

  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    favoritesQuery,
    isAuthenticated
  };
};
