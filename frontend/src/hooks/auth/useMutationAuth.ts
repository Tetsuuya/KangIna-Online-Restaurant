import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthUser, DietaryPreferences, RegisterData } from '../../utils/types';
import { authService } from '../../api/auth/auth';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../api/constants';

export const useMutationAuth = () => {
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

  return {
    login,
    register,
    logout,
    updateProfile,
    updateProfilePicture,
    updateDietaryPreferences,
    refreshUserData
  };
};