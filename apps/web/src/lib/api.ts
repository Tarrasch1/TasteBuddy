import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const tokens = useAuthStore.getState().tokens;
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const tokens = useAuthStore.getState().tokens;
      if (tokens?.refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });
          
          const newTokens = response.data.data.tokens;
          useAuthStore.getState().setTokens(newTokens);
          
          // Retry original request
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newTokens.accessToken}`,
          };
          return api(originalRequest);
        } catch {
          // Refresh failed, logout user
          useAuthStore.getState().logout();
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Handle API errors
function handleError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.error?.message || error.message;
    throw new Error(message);
  }
  throw error;
}

// Demo Mode - Simulates API responses when backend is not running
const DEMO_MODE = true; // Set to false when backend is running

const generateId = () => Math.random().toString(36).substring(2, 15);

const generateTokens = () => ({
  accessToken: `demo_access_${generateId()}`,
  refreshToken: `demo_refresh_${generateId()}`,
  expiresIn: 3600,
});

// Demo user storage
const getDemoUsers = (): any[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('demo_users');
  return stored ? JSON.parse(stored) : [];
};

const saveDemoUser = (user: any) => {
  const users = getDemoUsers();
  users.push(user);
  localStorage.setItem('demo_users', JSON.stringify(users));
};

// Auth API
export const authApi = {
  register: async (data: { email: string; username: string; password: string; displayName?: string }) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      
      const users = getDemoUsers();
      if (users.find(u => u.email === data.email)) {
        throw new Error('Bu e-posta adresi zaten kullanılıyor');
      }
      if (users.find(u => u.username === data.username)) {
        throw new Error('Bu kullanıcı adı zaten kullanılıyor');
      }
      
      const user = {
        id: generateId(),
        email: data.email,
        username: data.username,
        displayName: data.displayName || data.username,
        avatarUrl: null,
        createdAt: new Date().toISOString(),
        password: data.password, // In real app, this would be hashed
      };
      
      saveDemoUser(user);
      const { password, ...userWithoutPassword } = user;
      
      return {
        user: userWithoutPassword,
        tokens: generateTokens(),
      };
    }
    
    try {
      const response = await api.post<ApiResponse<{ user: any; tokens: any }>>('/auth/register', data);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  login: async (data: { email: string; password: string }) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const users = getDemoUsers();
      const user = users.find(u => u.email === data.email && u.password === data.password);
      
      if (!user) {
        throw new Error('E-posta veya şifre hatalı');
      }
      
      const { password, ...userWithoutPassword } = user;
      return {
        user: userWithoutPassword,
        tokens: generateTokens(),
      };
    }
    
    try {
      const response = await api.post<ApiResponse<{ user: any; tokens: any }>>('/auth/login', data);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
      useAuthStore.getState().logout();
    } catch (error) {
      // Logout locally even if API fails
      useAuthStore.getState().logout();
    }
  },
  
  refresh: async (refreshToken: string) => {
    try {
      const response = await api.post<ApiResponse<{ user: any; tokens: any }>>('/auth/refresh', { refreshToken });
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// User API
export const userApi = {
  getMe: async () => {
    try {
      const response = await api.get<ApiResponse<any>>('/users/me');
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  updateProfile: async (data: { displayName?: string; bio?: string; avatarUrl?: string }) => {
    try {
      const response = await api.patch<ApiResponse<any>>('/users/me', data);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getUser: async (userId: string) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Venue API
export const venueApi = {
  search: async (params: { query?: string; lat?: number; lng?: number; radius?: number; categoryId?: string; page?: number; limit?: number }) => {
    try {
      const response = await api.get<ApiResponse<any>>('/venues/search', { params });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getNearby: async (lat: number, lng: number, radius: number = 5) => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/venues/nearby', { params: { lat, lng, radius } });
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/venues/${id}`);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getCategories: async () => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/venues/categories/all');
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  create: async (data: any) => {
    try {
      const response = await api.post<ApiResponse<any>>('/venues', data);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Item API
export const itemApi = {
  search: async (params: { query?: string; venueId?: string; type?: string; categoryId?: string; page?: number; limit?: number }) => {
    try {
      const response = await api.get<ApiResponse<any>>('/items/search', { params });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getById: async (id: string) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/items/${id}`);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getByVenue: async (venueId: string) => {
    try {
      const response = await api.get<ApiResponse<any[]>>(`/items`, { params: { venueId } });
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getTopItems: async (limit: number = 10) => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/items/top', { params: { limit } });
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  create: async (data: any) => {
    try {
      const response = await api.post<ApiResponse<any>>('/items', data);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Review API
export const reviewApi = {
  createItemReview: async (data: { itemId: string; overallScore: number; criteriaScores?: any; content?: string; verificationToken?: string }) => {
    try {
      const response = await api.post<ApiResponse<any>>('/reviews/items', data);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  createVenueReview: async (data: { venueId: string; overallScore: number; content?: string; verificationToken?: string }) => {
    try {
      const response = await api.post<ApiResponse<any>>('/reviews/venues', data);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getItemReviews: async (itemId: string, page: number = 1, limit: number = 20) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/reviews/items/${itemId}`, { params: { page, limit } });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getVenueReviews: async (venueId: string, page: number = 1, limit: number = 20) => {
    try {
      const response = await api.get<ApiResponse<any>>(`/reviews/venues/${venueId}`, { params: { page, limit } });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  likeReview: async (reviewId: string, type: 'item' | 'venue') => {
    try {
      const endpoint = type === 'item' ? `/reviews/items/${reviewId}/like` : `/reviews/venues/${reviewId}/like`;
      const response = await api.post<ApiResponse<any>>(endpoint);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Geo API
export const geoApi = {
  verify: async (venueId: string, latitude: number, longitude: number) => {
    try {
      const response = await api.post<ApiResponse<any>>('/geo/verify', {
        venueId,
        coordinates: { latitude, longitude },
      });
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
};

// Social API
export const socialApi = {
  getFriends: async (params: { page?: number; limit?: number } = {}) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { data: [], pagination: { total: 0, page: 1, limit: params.limit || 20 } };
    }
    try {
      const response = await api.get<ApiResponse<any>>('/social/friends', { params });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  sendFriendRequest: async (userId: string) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }
    try {
      const response = await api.post<ApiResponse<any>>(`/social/friends/request/${userId}`);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  acceptFriendRequest: async (friendshipId: string) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }
    try {
      const response = await api.post<ApiResponse<any>>(`/social/friends/${friendshipId}/accept`);
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getFeed: async (params: { page?: number; limit?: number } = {}) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { data: [], pagination: { total: 0, page: 1, limit: params.limit || 20 } };
    }
    try {
      const response = await api.get<ApiResponse<any>>('/social/feed', { params });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  getNotifications: async (params: { page?: number; limit?: number } = {}) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { data: [], pagination: { total: 0, page: 1, limit: params.limit || 20 } };
    }
    try {
      const response = await api.get<ApiResponse<any>>('/social/notifications', { params });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  markNotificationRead: async (notificationId: string) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return;
    }
    try {
      await api.post(`/social/notifications/${notificationId}/read`);
    } catch (error) {
      handleError(error);
    }
  },
  
  saveVenue: async (venueId: string, note?: string) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }
    try {
      const response = await api.post<ApiResponse<any>>(`/social/saved/venues/${venueId}`, { note });
      return response.data.data;
    } catch (error) {
      handleError(error);
    }
  },
  
  unsaveVenue: async (venueId: string) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return;
    }
    try {
      await api.delete(`/social/saved/venues/${venueId}`);
    } catch (error) {
      handleError(error);
    }
  },
  
  getSavedVenues: async (params: { page?: number; limit?: number } = {}) => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return { data: [], pagination: { total: 0, page: 1, limit: params.limit || 20 } };
    }
    try {
      const response = await api.get<ApiResponse<any>>('/social/saved/venues', { params });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

export default api;
