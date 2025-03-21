import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthUser, DietaryPreferences, RegisterData } from '../../utils/types';
import { authService } from '../../api/auth/auth';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../api/constants';

export const useAuthStore = () => {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await authService.login(email, password);
      localStorage.setItem(ACCESS_TOKEN, result.access);
      localStorage.setItem(REFRESH_TOKEN, result.refresh);
      return result.user;
    },
    onSuccess: (data: AuthUser) => {
      queryClient.setQueryData(['user'], data);
    }
  });

  const register = useMutation({
    mutationFn: async (data: RegisterData) => {
      return await authService.register(data);
    }
  });

  const logout = useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/';
    }
  });

  const { data: user, isLoading: isCheckingAuth } = useQuery<AuthUser | null>({
    queryKey: ['user'],
    queryFn: authService.getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!localStorage.getItem(ACCESS_TOKEN),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30,   // 30 minutes
  });

  const updateProfile = useMutation({
    mutationFn: (data: Partial<AuthUser>) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  const updateProfilePicture = useMutation({
    mutationFn: (file: File) => authService.updateProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  const updateDietaryPreferences = useMutation({
    mutationFn: (data: Partial<DietaryPreferences>) => authService.updateDietaryPreferences(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  const refreshUserData = async () => {
    const data = await authService.getCurrentUser();
    queryClient.setQueryData(['user'], data);
    return data;
  };

  const isAuthenticated = !!user;
  const isLoading = login.isPending || register.isPending || isCheckingAuth;
  const hasCheckedAuth = !isCheckingAuth;

  return {
    user,
    isAuthenticated,
    isCheckingAuth,
    hasCheckedAuth,
    isLoading,
    error: login.error || register.error || logout.error || updateProfile.error || updateProfilePicture.error || updateDietaryPreferences.error || null,
    login: login.mutateAsync,
    register: register.mutateAsync,
    logout: logout.mutateAsync,
    updateProfile: updateProfile.mutateAsync,
    updateProfilePicture: updateProfilePicture.mutateAsync,
    updateDietaryPreferences: updateDietaryPreferences.mutateAsync,
    refreshUserData
  };
};