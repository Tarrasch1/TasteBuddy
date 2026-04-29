import { z } from 'zod';

// Create Item Schema
export const createItemSchema = z.object({
  venueId: z.string().min(1, 'Venue ID is required'),
  categoryId: z.string().min(1, 'Category is required'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  description: z
    .string()
    .max(1000, 'Description must be at most 1000 characters')
    .optional(),
  price: z
    .number()
    .positive('Price must be positive')
    .optional(),
  currency: z
    .string()
    .length(3, 'Currency must be 3 characters (ISO code)')
    .optional()
    .default('USD'),
  photoUrl: z
    .string()
    .url('Invalid photo URL')
    .optional(),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

// Update Item Schema
export const updateItemSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .optional(),
  description: z
    .string()
    .max(1000)
    .optional(),
  price: z
    .number()
    .positive()
    .optional(),
  currency: z
    .string()
    .length(3)
    .optional(),
  photoUrl: z
    .string()
    .url()
    .optional(),
  isAvailable: z.boolean().optional(),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

// Item Search Schema
export const itemSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  venueId: z.string().optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(100).max(50000).optional().default(5000),
  minRating: z.coerce.number().min(1).max(5).optional(),
  sortBy: z.enum(['rating', 'reviews', 'distance', 'newest']).optional().default('rating'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type ItemSearchInput = z.infer<typeof itemSearchSchema>;

// Top Items Schema
export const topItemsSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().min(100).max(50000).optional().default(5000),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type TopItemsInput = z.infer<typeof topItemsSchema>;
