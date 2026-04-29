import axios, { AxiosError } from 'axios';
import type { LoginInput, RegisterInput } from '@tastebuddy/shared';
import { useAuthStore } from '../stores/auth-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
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
    const originalRequest = error.config as any;
    
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
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        } catch {
          // Refresh failed, logout user
          useAuthStore.getState().logout();
        }
      }
    }
    
    // Extract error message
    const message = (error.response?.data as any)?.error?.message || error.message;
    return Promise.reject(new Error(message));
  }
);

// Auth API
export const authApi = {
  register: async (data: RegisterInput) => {
    const response = await api.post('/auth/register', data);
    return response.data.data;
  },
  
  login: async (data: LoginInput) => {
    const response = await api.post('/auth/login', data);
    return response.data.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  refresh: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },
};

// User API
export const userApi = {
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data.data;
  },
  
  updateProfile: async (data: { displayName?: string; bio?: string; avatarUrl?: string }) => {
    const response = await api.patch('/users/me', data);
    return response.data.data;
  },
  
  getPublicProfile: async (username: string) => {
    const response = await api.get(`/users/${username}`);
    return response.data.data;
  },
};

// Venue API
export const venueApi = {
  list: async (params?: { page?: number; limit?: number; categoryId?: string }) => {
    const response = await api.get('/venues', { params });
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await api.get(`/venues/${id}`);
    return response.data.data;
  },
  
  search: async (query: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get('/venues/search', { params: { q: query, ...params } });
    return response.data;
  },
  
  nearby: async (lat: number, lng: number, radiusKm?: number) => {
    const response = await api.get('/venues/nearby', { params: { lat, lng, radiusKm } });
    return response.data.data;
  },
  
  categories: async () => {
    const response = await api.get('/venues/categories');
    return response.data.data;
  },
};

// Item API
export const itemApi = {
  listByVenue: async (venueId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/items/venue/${venueId}`, { params });
    return response.data;
  },
  
  get: async (id: string) => {
    const response = await api.get(`/items/${id}`);
    return response.data.data;
  },
  
  search: async (query: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get('/items/search', { params: { q: query, ...params } });
    return response.data;
  },
  
  top: async (params?: { limit?: number; categoryId?: string }) => {
    const response = await api.get('/items/top', { params });
    return response.data.data;
  },
};

// Review API
export const reviewApi = {
  createItemReview: async (data: any) => {
    const response = await api.post('/reviews/items', data);
    return response.data.data;
  },
  
  createVenueReview: async (data: any) => {
    const response = await api.post('/reviews/venues', data);
    return response.data.data;
  },
  
  getItemReviews: async (itemId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/reviews/items/${itemId}`, { params });
    return response.data;
  },
  
  getVenueReviews: async (venueId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/reviews/venues/${venueId}`, { params });
    return response.data;
  },
  
  likeReview: async (reviewId: string, type: 'item' | 'venue') => {
    const response = await api.post(`/reviews/${reviewId}/like`, { type });
    return response.data;
  },
};

// Social API
export const socialApi = {
  getFriends: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/social/friends', { params });
    return response.data;
  },
  
  getPendingRequests: async () => {
    const response = await api.get('/social/friends/pending');
    return response.data.data;
  },
  
  sendFriendRequest: async (userId: string) => {
    const response = await api.post(`/social/friends/request/${userId}`);
    return response.data.data;
  },
  
  acceptFriendRequest: async (friendshipId: string) => {
    const response = await api.post(`/social/friends/${friendshipId}/accept`);
    return response.data.data;
  },
  
  getFeed: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/social/feed', { params });
    return response.data;
  },
  
  getPublicFeed: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/social/feed/public', { params });
    return response.data;
  },
  
  getNotifications: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/social/notifications', { params });
    return response.data;
  },
  
  getSavedVenues: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/social/saved/venues', { params });
    return response.data;
  },
  
  saveVenue: async (venueId: string, note?: string) => {
    const response = await api.post(`/social/saved/venues/${venueId}`, { note });
    return response.data.data;
  },
  
  unsaveVenue: async (venueId: string) => {
    const response = await api.delete(`/social/saved/venues/${venueId}`);
    return response.data;
  },
  
  getSavedItems: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/social/saved/items', { params });
    return response.data;
  },
  
  saveItem: async (itemId: string, note?: string) => {
    const response = await api.post(`/social/saved/items/${itemId}`, { note });
    return response.data.data;
  },
  
  unsaveItem: async (itemId: string) => {
    const response = await api.delete(`/social/saved/items/${itemId}`);
    return response.data;
  },
};

// Geo API
export const geoApi = {
  verify: async (venueId: string, latitude: number, longitude: number) => {
    const response = await api.post('/geo/verify', {
      venueId,
      coordinates: { latitude, longitude },
    });
    return response.data.data;
  },
};

export default api;
