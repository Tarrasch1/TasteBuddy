import { ReviewUser, ReviewVenue, ReviewItem, ReviewPhoto } from './review';

// Friendship Types
export type FriendshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';

export interface Friendship {
  id: string;
  requesterId: string;
  requester?: ReviewUser;
  addresseeId: string;
  addressee?: ReviewUser;
  status: FriendshipStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FriendRequest {
  id: string;
  user: ReviewUser;
  status: FriendshipStatus;
  createdAt: string;
}

export interface Friend {
  id: string;
  user: ReviewUser;
  friendshipId: string;
  since: string;
}

// Activity Feed Types
export type ActivityType =
  | 'VENUE_REVIEW'
  | 'ITEM_REVIEW'
  | 'LIKE_REVIEW'
  | 'COMMENT_REVIEW'
  | 'SAVE_VENUE'
  | 'SAVE_ITEM'
  | 'FOLLOW_USER'
  | 'PHOTO_UPLOAD';

export interface Activity {
  id: string;
  type: ActivityType;
  user: ReviewUser;
  target: ActivityTarget;
  review?: ActivityReview;
  createdAt: string;
  likeCount?: number;
  commentCount?: number;
  isLiked?: boolean;
}

export interface ActivityTarget {
  type: 'venue' | 'item' | 'review' | 'user';
  venue?: ReviewVenue;
  item?: ReviewItem;
}

export interface ActivityReview {
  id: string;
  overallScore: number;
  content?: string;
  isVerified: boolean;
  photos: ReviewPhoto[];
}

// Notification Types
export type NotificationType =
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'REVIEW_LIKE'
  | 'REVIEW_COMMENT'
  | 'MENTION'
  | 'SYSTEM';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// Feed Params
export interface FeedParams {
  type?: 'all' | 'friends' | 'following';
  page?: number;
  limit?: number;
}

// Saved Items
export interface SavedVenue {
  id: string;
  venueId: string;
  venue: {
    id: string;
    name: string;
    slug: string;
    address: string;
    avgOverallScore?: number;
    photoUrl?: string;
  };
  savedAt: string;
}

export interface SavedItem {
  id: string;
  itemId: string;
  item: {
    id: string;
    name: string;
    slug: string;
    venueId: string;
    venueName: string;
    avgOverallScore?: number;
    photoUrl?: string;
  };
  savedAt: string;
}
