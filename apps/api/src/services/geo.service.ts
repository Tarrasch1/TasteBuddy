import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { haversineDistance } from '@tastebuddy/shared';
import { env } from '../config/env.js';

/**
 * Location verification result
 */
export interface VerificationResult {
  isVerified: boolean;
  distance: number;
  maxAllowedDistance: number;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Verification token payload
 */
export interface VerificationPayload {
  userId: string;
  venueId: string;
  latitude: number;
  longitude: number;
  distance: number;
}

/**
 * Verify if a user's location is within the allowed radius of a venue
 */
export function verifyLocation(
  userLat: number,
  userLng: number,
  venueLat: number,
  venueLng: number,
  maxRadiusMeters: number = 100
): VerificationResult {
  const distance = haversineDistance(userLat, userLng, venueLat, venueLng);
  const isVerified = distance <= maxRadiusMeters;
  
  // Calculate confidence based on distance
  let confidence: 'high' | 'medium' | 'low';
  if (distance <= maxRadiusMeters * 0.3) {
    confidence = 'high';
  } else if (distance <= maxRadiusMeters * 0.7) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }
  
  return {
    isVerified,
    distance: Math.round(distance),
    maxAllowedDistance: maxRadiusMeters,
    confidence: isVerified ? confidence : 'low',
  };
}

/**
 * Generate a time-limited verification token
 */
export function generateVerificationToken(payload: VerificationPayload): string {
  return jwt.sign(
    {
      ...payload,
      type: 'geo_verification',
      nonce: crypto.randomBytes(8).toString('hex'),
    },
    env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

/**
 * Verify a geo verification token
 */
export function verifyVerificationToken(token: string): VerificationPayload | null {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    
    if (decoded.type !== 'geo_verification') {
      return null;
    }
    
    return {
      userId: decoded.userId,
      venueId: decoded.venueId,
      latitude: decoded.latitude,
      longitude: decoded.longitude,
      distance: decoded.distance,
    };
  } catch {
    return null;
  }
}

/**
 * Calculate bounding box for geospatial queries
 * Used for initial filtering before precise distance calculation
 */
export function calculateBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  // Earth's radius in km
  const R = 6371;
  
  // Angular distance in radians
  const angularDistance = radiusKm / R;
  
  // Convert latitude to radians
  const latRad = (lat * Math.PI) / 180;
  
  // Calculate latitude bounds
  const minLat = lat - (angularDistance * 180) / Math.PI;
  const maxLat = lat + (angularDistance * 180) / Math.PI;
  
  // Calculate longitude bounds (accounting for latitude)
  const deltaLng = Math.asin(Math.sin(angularDistance) / Math.cos(latRad));
  const minLng = lng - (deltaLng * 180) / Math.PI;
  const maxLng = lng + (deltaLng * 180) / Math.PI;
  
  return { minLat, maxLat, minLng, maxLng };
}

/**
 * Adaptive radius calculation based on venue density and GPS accuracy
 */
export function calculateAdaptiveRadius(
  baseRadius: number,
  gpsAccuracy: number = 0,
  venueDensity: 'high' | 'medium' | 'low' = 'medium'
): number {
  let radius = baseRadius;
  
  // Adjust for GPS accuracy (add accuracy buffer)
  if (gpsAccuracy > 0) {
    radius += Math.min(gpsAccuracy * 0.5, 50); // Max 50m buffer for GPS
  }
  
  // Adjust for venue density
  switch (venueDensity) {
    case 'high':
      // Tighter radius in dense areas
      radius *= 0.7;
      break;
    case 'low':
      // Looser radius in sparse areas
      radius *= 1.3;
      break;
    default:
      // Keep base radius
      break;
  }
  
  // Ensure minimum and maximum bounds
  return Math.max(20, Math.min(radius, 500));
}

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Calculate distance-based score weight
 * Closer distance = higher weight for scoring
 */
export function calculateDistanceWeight(distance: number, maxDistance: number): number {
  if (distance >= maxDistance) return 0;
  return 1 - Math.pow(distance / maxDistance, 2);
}
