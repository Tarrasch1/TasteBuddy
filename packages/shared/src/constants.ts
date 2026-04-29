// API Version
export const API_VERSION = 'v1';

// Default Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

// Geolocation
export const DEFAULT_VERIFICATION_RADIUS = 100; // meters
export const MAX_GPS_ACCURACY = 50; // meters - reject if worse
export const LOCATION_TIMESTAMP_MAX_AGE = 5 * 60 * 1000; // 5 minutes in ms

// Rate Limits
export const RATE_LIMITS = {
  general: 100, // requests per minute
  auth: 10, // requests per minute
  upload: 20, // uploads per hour
  reviewsPerVenuePerDay: 3,
  reviewsPerItemPerDay: 3,
  verificationsPerHour: 10,
} as const;

// File Upload
export const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxPhotosPerReview: 5,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  thumbnailSize: 200,
  fullSize: 1200,
} as const;

// JWT
export const JWT_EXPIRY = {
  accessToken: '15m',
  refreshToken: '7d',
  verificationToken: '24h',
  passwordResetToken: '1h',
} as const;

// Password
export const PASSWORD_SALT_ROUNDS = 12;

// Content Limits
export const CONTENT_LIMITS = {
  reviewMaxLength: 2000,
  commentMaxLength: 500,
  bioMaxLength: 500,
  displayNameMaxLength: 50,
  usernameMinLength: 3,
  usernameMaxLength: 30,
} as const;

// Venue Categories (seed data)
export const VENUE_CATEGORIES = [
  { name: 'Restaurant', slug: 'restaurant', icon: '🍽️' },
  { name: 'Bar', slug: 'bar', icon: '🍸' },
  { name: 'Café', slug: 'cafe', icon: '☕' },
  { name: 'Bakery', slug: 'bakery', icon: '🥐' },
  { name: 'Fast Food', slug: 'fast-food', icon: '🍔' },
  { name: 'Food Truck', slug: 'food-truck', icon: '🚚' },
  { name: 'Pub', slug: 'pub', icon: '🍺' },
  { name: 'Wine Bar', slug: 'wine-bar', icon: '🍷' },
  { name: 'Cocktail Bar', slug: 'cocktail-bar', icon: '🍹' },
  { name: 'Ice Cream', slug: 'ice-cream', icon: '🍦' },
] as const;

// Item Categories with Rating Criteria
export const ITEM_CATEGORIES = {
  pizza: {
    name: 'Pizza',
    slug: 'pizza',
    icon: '🍕',
    type: 'FOOD' as const,
    criteria: [
      { name: 'taste', label: 'Taste', weight: 1.5 },
      { name: 'dough', label: 'Dough Quality', weight: 1.2 },
      { name: 'ingredients', label: 'Ingredients', weight: 1.0 },
      { name: 'portion', label: 'Portion Size', weight: 0.8 },
      { name: 'value', label: 'Value for Money', weight: 1.0 },
      { name: 'presentation', label: 'Presentation', weight: 0.5 },
    ],
  },
  burger: {
    name: 'Burger',
    slug: 'burger',
    icon: '🍔',
    type: 'FOOD' as const,
    criteria: [
      { name: 'taste', label: 'Taste', weight: 1.5 },
      { name: 'meat', label: 'Meat Quality', weight: 1.2 },
      { name: 'bun', label: 'Bun', weight: 0.8 },
      { name: 'toppings', label: 'Toppings', weight: 0.8 },
      { name: 'portion', label: 'Portion Size', weight: 0.8 },
      { name: 'value', label: 'Value for Money', weight: 1.0 },
    ],
  },
  pasta: {
    name: 'Pasta',
    slug: 'pasta',
    icon: '🍝',
    type: 'FOOD' as const,
    criteria: [
      { name: 'taste', label: 'Taste', weight: 1.5 },
      { name: 'pasta_quality', label: 'Pasta Quality', weight: 1.0 },
      { name: 'sauce', label: 'Sauce', weight: 1.2 },
      { name: 'portion', label: 'Portion Size', weight: 0.8 },
      { name: 'value', label: 'Value for Money', weight: 1.0 },
    ],
  },
  coffee: {
    name: 'Coffee',
    slug: 'coffee',
    icon: '☕',
    type: 'DRINK' as const,
    criteria: [
      { name: 'taste', label: 'Taste', weight: 1.5 },
      { name: 'aroma', label: 'Aroma', weight: 1.0 },
      { name: 'temperature', label: 'Temperature', weight: 0.8 },
      { name: 'presentation', label: 'Presentation', weight: 0.5 },
      { name: 'value', label: 'Value for Money', weight: 1.0 },
    ],
  },
  cocktail: {
    name: 'Cocktail',
    slug: 'cocktail',
    icon: '🍸',
    type: 'DRINK' as const,
    criteria: [
      { name: 'taste_balance', label: 'Taste Balance', weight: 1.5 },
      { name: 'alcohol_balance', label: 'Alcohol Balance', weight: 1.0 },
      { name: 'presentation', label: 'Presentation', weight: 1.0 },
      { name: 'creativity', label: 'Creativity', weight: 0.8 },
      { name: 'value', label: 'Value for Money', weight: 1.0 },
    ],
  },
  beer: {
    name: 'Beer',
    slug: 'beer',
    icon: '🍺',
    type: 'DRINK' as const,
    criteria: [
      { name: 'taste', label: 'Taste', weight: 1.5 },
      { name: 'freshness', label: 'Freshness', weight: 1.0 },
      { name: 'temperature', label: 'Temperature', weight: 0.8 },
      { name: 'value', label: 'Value for Money', weight: 1.0 },
    ],
  },
  dessert: {
    name: 'Dessert',
    slug: 'dessert',
    icon: '🍰',
    type: 'FOOD' as const,
    criteria: [
      { name: 'taste', label: 'Taste', weight: 1.5 },
      { name: 'freshness', label: 'Freshness', weight: 1.0 },
      { name: 'presentation', label: 'Presentation', weight: 1.0 },
      { name: 'portion', label: 'Portion Size', weight: 0.8 },
      { name: 'value', label: 'Value for Money', weight: 1.0 },
    ],
  },
} as const;

// Error Codes
export const ERROR_CODES = {
  // Auth Errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  ACCOUNT_BANNED: 'ACCOUNT_BANNED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
  
  // Resource Errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Permission Errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation Errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Location Errors
  LOCATION_TOO_FAR: 'LOCATION_TOO_FAR',
  LOCATION_INVALID: 'LOCATION_INVALID',
  LOCATION_STALE: 'LOCATION_STALE',
  
  // Rate Limit Errors
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Review Errors
  REVIEW_EXISTS: 'REVIEW_EXISTS',
  REVIEW_LIMIT_REACHED: 'REVIEW_LIMIT_REACHED',
  
  // Server Errors
  SERVER_ERROR: 'SERVER_ERROR',
} as const;
