export type PrivacyLevel = 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  privacyLevel: PrivacyLevel;
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  stats: UserStats;
}

export interface UserStats {
  venueReviewCount: number;
  itemReviewCount: number;
  friendCount: number;
  savedVenueCount: number;
  savedItemCount: number;
  photoCount: number;
}

export interface PublicUserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  isVerified: boolean;
  stats: UserStats;
  createdAt: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  showInSearch: boolean;
  allowFriendRequests: boolean;
}

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  privacyLevel?: PrivacyLevel;
}
