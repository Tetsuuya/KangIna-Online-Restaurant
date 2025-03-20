import api from './../api';
import { AuthUser, RegisterData, DietaryPreferences } from '../../utils/types';

// The auth service handles direct API communication only
export const authService = {
  // User authentication
  getCurrentUser() {
    return api.get<AuthUser>('user');
  },

  login(email: string, password: string) {
    const payload = {
      email: email.toLowerCase().trim(),
      password
    };
    console.log('Login request payload:', payload);
    return api.post<{ access: string; refresh: string; user: AuthUser }>('login/', payload);
  },

  register(data: RegisterData) {
    console.log('Register request payload:', {
      ...data,
      email: data.email.toLowerCase().trim()
    });
    return api.post<{ access: string; refresh: string; user: AuthUser }>('/register/', {
      ...data,
      email: data.email.toLowerCase().trim()
    });
  },

  logout(refreshToken: string) {
    return api.post('/logout/', { refresh: refreshToken });
  },

  // Profile management
  updateProfile(data: Partial<AuthUser>) {
    return api.put<AuthUser>('/profile/update/', data);
  },

  updateProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('profile_picture', file);
    return api.put<AuthUser>('/profile/picture/', formData);
  },

  updateDietaryPreferences(data: Partial<DietaryPreferences>) {
    return api.put<AuthUser>('/profile/dietary-preferences/', data);
  }
};