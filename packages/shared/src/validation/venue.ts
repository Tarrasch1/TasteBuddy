import { z } from 'zod';

// Create Venue Schema
export const createVenueSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address must be at most 200 characters'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be at most 100 characters'),
  state: z
    .string()
    .max(100)
    .optional(),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be at most 100 characters'),
  postalCode: z
    .string()
    .max(20)
    .optional(),
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude'),
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude'),
  categoryId: z.string().min(1, 'Category is required'),
  priceLevel: z
    .number()
    .int()
    .min(1)
    .max(4)
    .optional()
    .default(2),
  phone: z
    .string()
    .max(30)
    .optional(),
  website: z
    .string()
    .url('Invalid website URL')
    .optional(),
  hours: z.record(
    z.object({
      open: z.string().regex(/^\d{2}:\d{2}$/),
      close: z.string().regex(/^\d{2}:\d{2}$/),
    })
  ).optional(),
});

export type CreateVenueInput = z.infer<typeof createVenueSchema>;

// Update Venue Schema
export const updateVenueSchema = createVenueSchema.partial();

export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;

// Venue Search Schema
export const venueSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(100).max(50000).optional().default(5000),
  minRating: z.coerce.number().min(1).max(5).optional(),
  priceLevel: z.string().optional(),
  sortBy: z.enum(['distance', 'rating', 'reviews', 'newest']).optional().default('distance'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type VenueSearchInput = z.infer<typeof venueSearchSchema>;

// Nearby Search Schema
export const nearbyVenuesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(50000).optional().default(1000),
  category: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type NearbyVenuesInput = z.infer<typeof nearbyVenuesSchema>;
