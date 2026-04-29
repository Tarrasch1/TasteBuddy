export type ItemType = 'FOOD' | 'DRINK';

export interface ItemCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  type: ItemType;
  ratingCriteria: RatingCriterion[];
}

export interface RatingCriterion {
  id: string;
  categoryId: string;
  name: string;
  label: string;
  description?: string;
  weight: number;
  order: number;
}

export interface Item {
  id: string;
  venueId: string;
  venue?: ItemVenueInfo;
  category: ItemCategory;
  name: string;
  slug: string;
  description?: string;
  price?: number;
  currency: string;
  photoUrl?: string;
  avgOverallScore?: number;
  avgCriteriaScores?: Record<string, number>;
  reviewCount: number;
  isAvailable: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemVenueInfo {
  id: string;
  name: string;
  slug: string;
  address: string;
  distance?: number;
}

export interface ItemListItem {
  id: string;
  name: string;
  slug: string;
  category: ItemCategory;
  venue: ItemVenueInfo;
  price?: number;
  currency: string;
  avgOverallScore?: number;
  avgCriteriaScores?: Record<string, number>;
  reviewCount: number;
  photoUrl?: string;
}

export interface ItemDetail extends Item {
  photos: ItemPhoto[];
  recentReviews: ItemReviewSummary[];
  ranking?: ItemRanking;
  isSaved?: boolean;
  userReview?: ItemReviewSummary;
}

export interface ItemPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  userId: string;
  createdAt: string;
}

export interface ItemReviewSummary {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  overallScore: number;
  criteriaScores: Record<string, number>;
  content?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface ItemRanking {
  rank: number;
  total: number;
  category: string;
  nearbyRadius?: number;
}

export interface ItemSearchParams {
  q?: string;
  category?: string;
  venueId?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  minRating?: number;
  sortBy?: 'rating' | 'reviews' | 'distance' | 'newest';
  page?: number;
  limit?: number;
}

export interface CreateItemInput {
  venueId: string;
  categoryId: string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  photoUrl?: string;
}

export interface UpdateItemInput {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  photoUrl?: string;
  isAvailable?: boolean;
}
