export interface VenueCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  parentId?: string;
}

export interface VenueHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

export interface VenueScores {
  overall?: number;
  service?: number;
  atmosphere?: number;
  cleanliness?: number;
  value?: number;
  location?: number;
  noise?: number;
}

export interface Venue {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  category: VenueCategory;
  priceLevel: number; // 1-4
  phone?: string;
  website?: string;
  hours?: VenueHours;
  scores: VenueScores;
  reviewCount: number;
  photoCount?: number;
  itemCount?: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VenueListItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  category: VenueCategory;
  priceLevel: number;
  avgOverallScore?: number;
  reviewCount: number;
  distance?: number;
  photoUrl?: string;
  topItems?: ItemSummary[];
}

export interface ItemSummary {
  id: string;
  name: string;
  avgOverallScore?: number;
}

export interface VenueDetail extends Venue {
  photos: VenuePhoto[];
  topItems: ItemSummary[];
  recentReviews: VenueReviewSummary[];
  isSaved?: boolean;
  userReview?: VenueReviewSummary;
}

export interface VenuePhoto {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  userId: string;
  createdAt: string;
}

export interface VenueReviewSummary {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  overallScore: number;
  content?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface VenueSearchParams {
  q?: string;
  category?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  minRating?: number;
  priceLevel?: string; // comma-separated: "1,2,3"
  sortBy?: 'distance' | 'rating' | 'reviews' | 'newest';
  page?: number;
  limit?: number;
}

export interface CreateVenueInput {
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  categoryId: string;
  priceLevel?: number;
  phone?: string;
  website?: string;
  hours?: VenueHours;
}

export interface UpdateVenueInput {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  categoryId?: string;
  priceLevel?: number;
  phone?: string;
  website?: string;
  hours?: VenueHours;
}
