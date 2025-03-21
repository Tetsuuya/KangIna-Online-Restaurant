import { useQueryAuth } from './useQueryAuth';
import { useMutationAuth } from './useMutationAuth';

export const useAuthStore = () => {
  const { userQuery } = useQueryAuth();
  const { 
    login,
    register,
    logout,
    updateProfile,
    updateProfilePicture,
    updateDietaryPreferences,
    refreshUserData 
  } = useMutationAuth();

  const user = userQuery.data;
  const isAuthenticated = !!user;
  const isCheckingAuth = userQuery.isLoading;
  const hasCheckedAuth = !isCheckingAuth;
  
  const isLoading = login.isPending || register.isPending || isCheckingAuth;
  const error = login.error || register.error || logout.error || 
                updateProfile.error || updateProfilePicture.error || 
                updateDietaryPreferences.error || null;

  return {
    user,
    isAuthenticated,
    isCheckingAuth,
    hasCheckedAuth,
    isLoading,
    error,
    login: login.mutateAsync,
    register: register.mutateAsync,
    logout: logout.mutateAsync,
    updateProfile: updateProfile.mutateAsync,
    updateProfilePicture: updateProfilePicture.mutateAsync,
    updateDietaryPreferences: updateDietaryPreferences.mutateAsync,
    refreshUserData
  };
};