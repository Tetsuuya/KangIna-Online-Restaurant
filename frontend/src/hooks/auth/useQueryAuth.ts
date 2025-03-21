import { useQuery } from '@tanstack/react-query';
import { AuthUser } from '../../utils/types';
import { authService } from '../../api/auth/auth';
import { ACCESS_TOKEN } from '../../api/constants';

export const useQueryAuth = () => {
  const userQuery = useQuery<AuthUser | null>({
    queryKey: ['user'],
    queryFn: authService.getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!localStorage.getItem(ACCESS_TOKEN),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,   // 30 minutes
  });

  return {
    userQuery
  };
};