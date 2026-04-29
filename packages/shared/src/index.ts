// Types - explicit exports to avoid conflicts
export type { 
  User, 
  UserStats, 
  UserProfile, 
  UserPreferences, 
  PublicUserProfile, 
  PrivacyLevel 
} from './types/user';

export type { 
  Venue, 
  VenueCategory, 
  VenuePhoto, 
  VenueHours, 
  VenueScores,
  VenueDetail,
  VenueListItem,
  VenueSearchParams,
  ItemSummary,
  VenueReviewSummary
} from './types/venue';

export type { 
  Item, 
  ItemCategory, 
  RatingCriterion, 
  ItemPhoto,
  ItemType,
  ItemDetail,
  ItemListItem,
  ItemVenueInfo,
  ItemReviewSummary,
  ItemRanking,
  ItemSearchParams
} from './types/item';

export type { 
  VenueReview, 
  ItemReview, 
  ReviewComment, 
  ReviewPhoto,
  VenueReviewScores,
  ReviewUser,
  ReviewVenue,
  ReviewItem,
  ReportReason,
  ReviewListParams
} from './types/review';

export type {
  FriendRequest,
  Friendship,
  FriendshipStatus,
  Friend,
  Activity,
  ActivityType,
  ActivityTarget,
  ActivityReview,
  NotificationType,
  Notification,
  FeedParams,
  SavedVenue,
  SavedItem
} from './types/social';

export type {
  ApiResponse,
  ApiError,
  PaginationParams,
  PaginationMeta,
  SortOrder,
  SortParams,
  GeoCoordinates,
  GeoVerificationRequest,
  GeoVerificationResult,
  TokenPair,
  UploadedPhoto
} from './types/common';

// Validation Schemas - auth
export {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type LoginInput,
  type UpdateProfileInput,
  type ChangePasswordInput,
  type ForgotPasswordInput,
  type ResetPasswordInput
} from './validation/auth';

// Validation Schemas - venue
export {
  createVenueSchema,
  updateVenueSchema,
  venueSearchSchema,
  type CreateVenueInput as CreateVenueSchemaInput,
  type UpdateVenueInput as UpdateVenueSchemaInput,
  type VenueSearchInput
} from './validation/venue';

// Validation Schemas - item
export {
  createItemSchema,
  updateItemSchema,
  itemSearchSchema,
  type CreateItemInput as CreateItemSchemaInput,
  type UpdateItemInput as UpdateItemSchemaInput,
  type ItemSearchInput
} from './validation/item';

// Validation Schemas - review
export { 
  createItemReviewSchema, 
  createVenueReviewSchema, 
  updateItemReviewSchema,
  updateVenueReviewSchema,
  createCommentSchema,
  createReportSchema,
  reviewListSchema,
  type CreateItemReviewInput as CreateItemReviewSchemaInput,
  type CreateVenueReviewInput as CreateVenueReviewSchemaInput,
  type UpdateItemReviewInput as UpdateItemReviewSchemaInput,
  type UpdateVenueReviewInput as UpdateVenueReviewSchemaInput,
  type CreateCommentInput as CreateCommentSchemaInput
} from './validation/review';

// Validation Schemas - geo
export {
  coordinatesSchema,
  geoVerifySchema,
  type CoordinatesInput,
  type GeoVerifyInput
} from './validation/geo';

// Utilities
export * from './utils/geo';
export * from './utils/score';

// Constants
export * from './constants';
