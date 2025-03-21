import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AuthUser, RegisterData, DietaryPreferences } from '../../utils/types';
import { authService } from '../../api/auth/auth';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../api/constants';

export const useAuthStore = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isCheckingAuth } = useQuery<AuthUser | null>({
    queryKey: ['user'],
    queryFn: authService.getCurrentUser,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: !!localStorage.getItem(ACCESS_TOKEN),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const isAuthenticated = !!user;
  const hasCheckedAuth = !isCheckingAuth;

  const login = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const result = await authService.login(email, password);
      localStorage.setItem(ACCESS_TOKEN, result.access);
      localStorage.setItem(REFRESH_TOKEN, result.refresh);
      return result.user;
    },
    onSuccess: (data: AuthUser) => {
      queryClient.setQueryData(['user'], data);
      queryClient.prefetchQuery({ queryKey: ['favorites'] });
      queryClient.prefetchQuery({ queryKey: ['cart'] });
    }
  });

  const register = useMutation({
    mutationFn: async (data: RegisterData) => {
      const result = await authService.register(data);
      localStorage.setItem(ACCESS_TOKEN, result.access);
      localStorage.setItem(REFRESH_TOKEN, result.refresh);
      return result.user;
    },
    onSuccess: (data: AuthUser) => {
      queryClient.setQueryData(['user'], data);
      if (data.id) {
        queryClient.prefetchQuery({ queryKey: ['favorites'] });
        queryClient.prefetchQuery({ queryKey: ['cart'] });
      }
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
      queryClient.setQueryData(['user'], null);
      queryClient.clear();
    }
  });

  const updateProfile = useMutation({
    mutationFn: (data: Partial<AuthUser>) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  const updateProfilePictureMutation = useMutation({
    mutationFn: (file: File) => authService.updateProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  const updateProfilePicture = async (file: File) => {
    const result = await updateProfilePictureMutation.mutateAsync(file);
    return result;
  };

  const updateDietaryPreferences = useMutation({
    mutationFn: async (data: Partial<DietaryPreferences>) => {
      const result = await authService.updateDietaryPreferences(data);
      return result;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['user'] });
      const previousUser = queryClient.getQueryData(['user']);
      queryClient.setQueryData(['user'], (oldData: AuthUser | null) => oldData ? {
        ...oldData,
        ...newData
      } : null);
      return { previousUser };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (_, __, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['user'], context.previousUser);
      }
    }
  });

  const updateDietaryPreferencesAsync = async (data: Partial<DietaryPreferences>) => {
    const result = await updateDietaryPreferences.mutateAsync(data);
    return result;
  };

  const refreshUserDataAsync = async () => {
    const data = await authService.getCurrentUser();
    queryClient.setQueryData(['user'], data);
  };

  return {
    user,
    isAuthenticated,
    hasCheckedAuth,
    isLoading: login.isPending || register.isPending || logout.isPending,
    error: login.error || register.error || logout.error,
    login: login.mutateAsync,
    register: register.mutateAsync,
    logout: logout.mutateAsync,
    updateProfile: updateProfile.mutateAsync,
    updateProfilePicture,
    updateDietaryPreferences: updateDietaryPreferencesAsync,
    refreshUserData: refreshUserDataAsync
  };
};