import { z } from 'zod';

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  altitude: z.number().optional(),
  heading: z.number().optional(),
  speed: z.number().optional(),
});

export const geoVerifySchema = z.object({
  venueId: z.string().uuid(),
  coordinates: coordinatesSchema,
});

export type CoordinatesInput = z.infer<typeof coordinatesSchema>;
export type GeoVerifyInput = z.infer<typeof geoVerifySchema>;
