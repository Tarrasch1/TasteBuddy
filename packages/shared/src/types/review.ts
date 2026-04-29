import { GeoCoordinates } from './common';

// Venue Review Types
export interface VenueReviewScores {
  service: number;
  atmosphere: number;
  cleanliness: number;
  value: number;
  location: number;
  noise: number;
}

export interface VenueReview {
  id: string;
  userId: string;
  user: ReviewUser;
  venueId: string;
  venue?: ReviewVenue;
  scores: VenueReviewScores;
  overallScore: number;
  content?: string;
  isVerified: boolean;
  photos: ReviewPhoto[];
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueReviewInput {
  scores: VenueReviewScores;
  content?: string;
  verification?: GeoCoordinates;
  photoIds?: string[];
}

export interface UpdateVenueReviewInput {
  scores?: VenueReviewScores;
  content?: string;
}

// Item Review Types
export interface ItemReview {
  id: string;
  userId: string;
  user: ReviewUser;
  itemId: string;
  item?: ReviewItem;
  venueId: string;
  venue?: ReviewVenue;
  criteriaScores: Record<string, number>;
  overallScore: number;
  content?: string;
  isVerified: boolean;
  photos: ReviewPhoto[];
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemReviewInput {
  criteriaScores: Record<string, number>;
  content?: string;
  verification?: GeoCoordinates;
  photoIds?: string[];
}

export interface UpdateItemReviewInput {
  criteriaScores?: Record<string, number>;
  content?: string;
}

// Shared Review Types
export interface ReviewUser {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface ReviewVenue {
  id: string;
  name: string;
  slug: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  slug: string;
}

export interface ReviewPhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
}

// Review Comment Types
export interface ReviewComment {
  id: string;
  userId: string;
  user: ReviewUser;
  content: string;
  parentId?: string;
  replies?: ReviewComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentInput {
  content: string;
  parentId?: string;
}

// Review Report Types
export type ReportReason =
  | 'SPAM'
  | 'FAKE_REVIEW'
  | 'OFFENSIVE_CONTENT'
  | 'HARASSMENT'
  | 'INCORRECT_INFO'
  | 'DUPLICATE'
  | 'OTHER';

export interface CreateReportInput {
  targetType: 'venue_review' | 'item_review' | 'user' | 'venue' | 'item';
  targetId: string;
  reason: ReportReason;
  description?: string;
}

// Review List Params
export interface ReviewListParams {
  sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
  page?: number;
  limit?: number;
}
