// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// Pagination Params
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Geolocation Types
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
}

export interface GeoVerificationRequest {
  venueId: string;
  coordinates: GeoCoordinates;
}

export interface GeoVerificationResult {
  isVerified: boolean;
  distance: number;
  maxAllowedDistance: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  verificationToken?: string;
}

// Sort and Filter Types
export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sortBy?: string;
  sortOrder?: SortOrder;
}

// Token Types
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Upload Types
export interface UploadedPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}
