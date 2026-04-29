/**
 * Earth's radius in meters
 */
const EARTH_RADIUS = 6371000;

/**
 * Convert degrees to radians
 */
export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param lat1 - Latitude of point 1 (degrees)
 * @param lon1 - Longitude of point 1 (degrees)
 * @param lat2 - Latitude of point 2 (degrees)
 * @param lon2 - Longitude of point 2 (degrees)
 * @returns Distance in meters
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

/**
 * Check if user is within radius of venue
 * @param userLat - User latitude
 * @param userLng - User longitude
 * @param venueLat - Venue latitude
 * @param venueLng - Venue longitude
 * @param maxRadius - Maximum allowed radius in meters (default 100)
 * @returns Object with verification result
 */
export function verifyLocationAtVenue(
  userLat: number,
  userLng: number,
  venueLat: number,
  venueLng: number,
  maxRadius: number = 100
): {
  isVerified: boolean;
  distance: number;
  maxAllowedDistance: number;
} {
  if (!isValidCoordinates(userLat, userLng) || !isValidCoordinates(venueLat, venueLng)) {
    return {
      isVerified: false,
      distance: -1,
      maxAllowedDistance: maxRadius,
    };
  }

  const distance = haversineDistance(userLat, userLng, venueLat, venueLng);

  return {
    isVerified: distance <= maxRadius,
    distance: Math.round(distance),
    maxAllowedDistance: maxRadius,
  };
}

/**
 * Calculate bounding box for a point and radius
 * Used for database queries to pre-filter before exact distance calculation
 */
export function getBoundingBox(
  lat: number,
  lng: number,
  radiusMeters: number
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  // Approximate degrees per meter at this latitude
  const latDelta = radiusMeters / 111320;
  const lngDelta = radiusMeters / (111320 * Math.cos(toRadians(lat)));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
