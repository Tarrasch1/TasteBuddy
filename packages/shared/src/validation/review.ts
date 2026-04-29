import { z } from 'zod';

// Geo Coordinates Schema
const geoCoordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  timestamp: z.string().datetime().optional(),
});

// Venue Review Scores Schema
const venueScoresSchema = z.object({
  service: z.number().min(1).max(5),
  atmosphere: z.number().min(1).max(5),
  cleanliness: z.number().min(1).max(5),
  value: z.number().min(1).max(5),
  location: z.number().min(1).max(5),
  noise: z.number().min(1).max(5),
});

// Create Venue Review Schema
export const createVenueReviewSchema = z.object({
  scores: venueScoresSchema,
  content: z
    .string()
    .max(2000, 'Review must be at most 2000 characters')
    .optional(),
  verification: geoCoordinatesSchema.optional(),
  photoIds: z.array(z.string()).max(5).optional(),
});

export type CreateVenueReviewInput = z.infer<typeof createVenueReviewSchema>;

// Update Venue Review Schema
export const updateVenueReviewSchema = z.object({
  scores: venueScoresSchema.optional(),
  content: z
    .string()
    .max(2000)
    .optional(),
});

export type UpdateVenueReviewInput = z.infer<typeof updateVenueReviewSchema>;

// Create Item Review Schema
export const createItemReviewSchema = z.object({
  criteriaScores: z.record(z.number().min(1).max(5)),
  content: z
    .string()
    .max(2000, 'Review must be at most 2000 characters')
    .optional(),
  verification: geoCoordinatesSchema.optional(),
  photoIds: z.array(z.string()).max(5).optional(),
});

export type CreateItemReviewInput = z.infer<typeof createItemReviewSchema>;

// Update Item Review Schema
export const updateItemReviewSchema = z.object({
  criteriaScores: z.record(z.number().min(1).max(5)).optional(),
  content: z
    .string()
    .max(2000)
    .optional(),
});

export type UpdateItemReviewInput = z.infer<typeof updateItemReviewSchema>;

// Geo Verification Schema
export const geoVerifySchema = z.object({
  venueId: z.string().min(1, 'Venue ID is required'),
  coordinates: geoCoordinatesSchema,
});

export type GeoVerifyInput = z.infer<typeof geoVerifySchema>;

// Create Comment Schema
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(500, 'Comment must be at most 500 characters'),
  parentId: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// Create Report Schema
export const createReportSchema = z.object({
  targetType: z.enum(['venue_review', 'item_review', 'user', 'venue', 'item']),
  targetId: z.string().min(1),
  reason: z.enum([
    'SPAM',
    'FAKE_REVIEW',
    'OFFENSIVE_CONTENT',
    'HARASSMENT',
    'INCORRECT_INFO',
    'DUPLICATE',
    'OTHER',
  ]),
  description: z
    .string()
    .max(1000)
    .optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;

// Review List Schema
export const reviewListSchema = z.object({
  sortBy: z.enum(['newest', 'oldest', 'highest', 'lowest', 'helpful']).optional().default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type ReviewListInput = z.infer<typeof reviewListSchema>;
