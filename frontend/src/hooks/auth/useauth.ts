import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../api/auth/auth';
import { AuthUser, RegisterData, DietaryPreferences } from '../../utils/types';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../api/constants';
import { setFavoriteUserId, clearFavoriteStore } from '../favorites/usefavorites';

export const useAuthStore = () => {
  const queryClient = useQueryClient();

  // Query for user data
  const { data: user, isLoading: isCheckingAuth, refetch: refreshUserData } = useQuery({
    queryKey: ['user'],
    queryFn: () => authService.getCurrentUser().then(res => res.data),
    enabled: !!localStorage.getItem(ACCESS_TOKEN),
    retry: false,
  });

  // Auth mutations
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      authService.login(email, password).then(res => res.data),
    onSuccess: (data) => {
      localStorage.setItem(ACCESS_TOKEN, data.access);
      localStorage.setItem(REFRESH_TOKEN, data.refresh);
      
      if (data.user?.id) {
        setFavoriteUserId(data.user.id);
        queryClient.invalidateQueries({ queryKey: ['favorites', data.user.id] });
      }
      queryClient.setQueryData(['user'], data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => 
      authService.register(data).then(res => res.data),
    onSuccess: (data) => {
      localStorage.setItem(ACCESS_TOKEN, data.access);
      localStorage.setItem(REFRESH_TOKEN, data.refresh);
      
      if (data.user?.id) {
        setFavoriteUserId(data.user.id);
        queryClient.invalidateQueries({ queryKey: ['favorites', data.user.id] });
      }
      queryClient.setQueryData(['user'], data.user);
    },
    onError(error) {
      console.error("Register Error:", error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      if (!refreshToken) return Promise.resolve({ data: null, status: 200 });
      return authService.logout(refreshToken);
    },
    onSettled: () => {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      clearFavoriteStore();
      queryClient.setQueryData(['cart'], []);
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries();
    },
    onError(error) {
      console.error("Logout Error:", error);
    },
  });

  // Profile mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<AuthUser>) => 
      authService.updateProfile(data).then(res => res.data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
    },
    onError(error) {
      console.error("Update Profile Error:", error);
    },
  });

  const updateProfilePictureMutation = useMutation({
    mutationFn: (file: File) => 
      authService.updateProfilePicture(file).then(res => res.data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
    },
    onError(error) {
      console.error("Update Profile Picture Error:", error);
    },
  });

  const updateDietaryPreferencesMutation = useMutation({
    mutationFn: (data: Partial<DietaryPreferences>) => 
      authService.updateDietaryPreferences(data).then(res => res.data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
    },
    onError(error) {
      console.error("Update Dietary Preferences Error:", error);
    },
  });

  return {
    user: user || null,
    isLoading: isCheckingAuth || loginMutation.isPending || registerMutation.isPending || logoutMutation.isPending,
    isCheckingAuth,
    hasCheckedAuth: !isCheckingAuth,
    isAuthenticated: !!user,
    error: (loginMutation.error || registerMutation.error || logoutMutation.error) as Error | null,
    success: registerMutation.isSuccess,
    refreshUserData,
    
    // Auth actions
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    
    // Profile actions
    updateProfile: updateProfileMutation.mutateAsync,
    updateProfilePicture: updateProfilePictureMutation.mutateAsync,
    updateDietaryPreferences: updateDietaryPreferencesMutation.mutateAsync,
  };
};