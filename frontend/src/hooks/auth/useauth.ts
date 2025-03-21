import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../api/auth/auth';
import { AuthUser, RegisterData, DietaryPreferences } from '../../utils/types';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../api/constants';

export const useAuthStore = () => {
  const queryClient = useQueryClient();

  const {data: userData, isLoading: isCheckingAuth, refetch: refreshUserData} = useQuery({
    queryKey: ['user'],
    queryFn: authService.getCurrentUser,
    enabled: !!localStorage.getItem(ACCESS_TOKEN),
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const isAuthenticated = !!userData;
  const hasCheckedAuth = !isCheckingAuth;

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      authService.login(email, password),
    onSuccess: (data) => {
      localStorage.setItem(ACCESS_TOKEN, data.access);
      localStorage.setItem(REFRESH_TOKEN, data.refresh);
      queryClient.setQueryData(['user'], data.user);
      queryClient.prefetchQuery({ queryKey: ['favorites'] });
      queryClient.prefetchQuery({ queryKey: ['cart'] });
    }
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authService.register(data),
    onSuccess: (data) => {
      localStorage.setItem(ACCESS_TOKEN, data.access);
      localStorage.setItem(REFRESH_TOKEN, data.refresh);
      queryClient.setQueryData(['user'], data.user);
      if (data.user?.id) {
        queryClient.prefetchQuery({ queryKey: ['favorites'] });
        queryClient.prefetchQuery({ queryKey: ['cart'] });
      }
      window.alert('Registration successful!');
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries();
      queryClient.clear();
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
    },
    onSettled: () => {
      queryClient.resetQueries();
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<AuthUser>) => authService.updateProfile(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['user'] });
      const previousUser = queryClient.getQueryData<AuthUser>(['user']);
      if (previousUser) {
        queryClient.setQueryData(['user'], { ...previousUser, ...newData });
      }
      return { previousUser };
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
      window.alert('Profile updated successfully');
    },
    onError: (_, __, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['user'], context.previousUser);
      }
      window.alert('Failed to update profile');
    }
  });

  const updateProfilePictureMutation = useMutation({
    mutationFn: (file: File) => authService.updateProfilePicture(file),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
      window.alert('Profile picture updated successfully');
    }
  });

  const updateDietaryPreferencesMutation = useMutation({
    mutationFn: (data: Partial<DietaryPreferences>) => authService.updateDietaryPreferences(data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['user'] });
      const previousUser = queryClient.getQueryData<AuthUser>(['user']);
      if (previousUser) {
        queryClient.setQueryData(['user'], { ...previousUser, ...newData });
      }
      return { previousUser };
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      window.alert('Profile updated successfully');
    },
    onError: (_, __, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(['user'], context.previousUser);
      }
      window.alert('Failed to update profile');
    }
  });

  return {
    user: userData,
    isCheckingAuth,
    error: null,
    isAuthenticated,
    hasCheckedAuth,
    isLoading: loginMutation.isPending || registerMutation.isPending,
    login: ({ email, password }: { email: string; password: string }) => loginMutation.mutate({ email, password }),
    register: (data: RegisterData) => registerMutation.mutate(data),
    logout: () => logoutMutation.mutate(),
    updateProfile: (data: Partial<AuthUser>) => updateProfileMutation.mutate(data),
    updateProfilePicture: (file: File) => updateProfilePictureMutation.mutate(file),
    updateDietaryPreferences: (data: Partial<DietaryPreferences>) => updateDietaryPreferencesMutation.mutate(data),
    refreshUserData
  };
};