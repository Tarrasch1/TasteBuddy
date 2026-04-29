# TasteBuddy - Geolocation Verification Algorithm

## 1. Overview

The geolocation verification system ensures that users can only submit reviews when they are physically present at or very near the venue. This prevents fake reviews and increases trust in the rating system.

## 2. Core Algorithm

### 2.1 Haversine Formula

The Haversine formula calculates the great-circle distance between two points on Earth's surface.

```typescript
/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @param lat1 - Latitude of point 1 (degrees)
 * @param lon1 - Longitude of point 1 (degrees)
 * @param lat2 - Latitude of point 2 (degrees)
 * @param lon2 - Longitude of point 2 (degrees)
 * @returns Distance in meters
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
```

### 2.2 Verification Logic

```typescript
interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number; // GPS accuracy in meters
  timestamp?: Date;
}

interface VenueLocation {
  latitude: number;
  longitude: number;
  verificationRadius?: number; // Custom radius, default 100m
}

interface VerificationResult {
  isVerified: boolean;
  distance: number;
  maxAllowedDistance: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  verificationToken?: string;
}

const DEFAULT_RADIUS = 100; // meters
const MAX_GPS_ACCURACY = 50; // meters - reject if accuracy worse than this
const MIN_CONFIDENCE_THRESHOLD = 0.7;

async function verifyUserLocation(
  userCoords: GeoCoordinates,
  venue: VenueLocation
): Promise<VerificationResult> {
  
  // 1. Validate input coordinates
  if (!isValidCoordinates(userCoords) || !isValidCoordinates(venue)) {
    return {
      isVerified: false,
      distance: -1,
      maxAllowedDistance: venue.verificationRadius || DEFAULT_RADIUS,
      confidence: 'LOW',
      message: 'Invalid coordinates provided'
    };
  }

  // 2. Check GPS accuracy if provided
  if (userCoords.accuracy && userCoords.accuracy > MAX_GPS_ACCURACY) {
    return {
      isVerified: false,
      distance: -1,
      maxAllowedDistance: venue.verificationRadius || DEFAULT_RADIUS,
      confidence: 'LOW',
      message: 'GPS accuracy too low. Please try again outdoors.'
    };
  }

  // 3. Check timestamp freshness (max 5 minutes old)
  if (userCoords.timestamp) {
    const ageMs = Date.now() - new Date(userCoords.timestamp).getTime();
    if (ageMs > 5 * 60 * 1000) {
      return {
        isVerified: false,
        distance: -1,
        maxAllowedDistance: venue.verificationRadius || DEFAULT_RADIUS,
        confidence: 'LOW',
        message: 'Location data is stale. Please refresh.'
      };
    }
  }

  // 4. Calculate distance
  const distance = haversineDistance(
    userCoords.latitude,
    userCoords.longitude,
    venue.latitude,
    venue.longitude
  );

  // 5. Determine allowed radius (account for GPS accuracy)
  const allowedRadius = venue.verificationRadius || DEFAULT_RADIUS;
  const effectiveRadius = allowedRadius + (userCoords.accuracy || 0);

  // 6. Calculate confidence based on accuracy
  const confidence = calculateConfidence(userCoords.accuracy, distance, allowedRadius);

  // 7. Determine verification status
  const isVerified = distance <= effectiveRadius && confidence !== 'LOW';

  // 8. Generate verification token if verified
  let verificationToken: string | undefined;
  if (isVerified) {
    verificationToken = await generateVerificationToken({
      venueId: venue.venueId,
      userCoords,
      distance,
      timestamp: new Date()
    });
  }

  return {
    isVerified,
    distance: Math.round(distance),
    maxAllowedDistance: allowedRadius,
    confidence,
    message: isVerified 
      ? 'Location verified successfully'
      : `You are ${Math.round(distance)}m away. Please be within ${allowedRadius}m of the venue.`,
    verificationToken
  };
}

function isValidCoordinates(coords: { latitude: number; longitude: number }): boolean {
  return (
    typeof coords.latitude === 'number' &&
    typeof coords.longitude === 'number' &&
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180 &&
    !isNaN(coords.latitude) &&
    !isNaN(coords.longitude)
  );
}

function calculateConfidence(
  accuracy: number | undefined,
  distance: number,
  allowedRadius: number
): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (!accuracy) return 'MEDIUM';
  
  // High confidence: accurate GPS and well within radius
  if (accuracy <= 10 && distance < allowedRadius * 0.5) {
    return 'HIGH';
  }
  
  // Low confidence: poor accuracy or borderline distance
  if (accuracy > 30 || distance > allowedRadius * 0.9) {
    return 'LOW';
  }
  
  return 'MEDIUM';
}
```

## 3. PostGIS Implementation

For server-side verification using PostGIS:

```sql
-- Function to verify user is at venue
CREATE OR REPLACE FUNCTION verify_user_at_venue(
  p_user_lat DOUBLE PRECISION,
  p_user_lng DOUBLE PRECISION,
  p_venue_id TEXT,
  p_max_distance_meters INTEGER DEFAULT 100
)
RETURNS TABLE (
  is_verified BOOLEAN,
  distance_meters DOUBLE PRECISION,
  venue_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ST_DWithin(
      ST_SetSRID(ST_MakePoint(v.longitude, v.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography,
      p_max_distance_meters
    ) AS is_verified,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(v.longitude, v.latitude), 4326)::geography,
      ST_SetSRID(ST_MakePoint(p_user_lng, p_user_lat), 4326)::geography
    ) AS distance_meters,
    v.name AS venue_name
  FROM venues v
  WHERE v.id = p_venue_id;
END;
$$ LANGUAGE plpgsql;

-- Usage
SELECT * FROM verify_user_at_venue(40.7128, -74.0060, 'venue_id_here', 100);
```

## 4. Anti-Spoofing Measures

### 4.1 GPS Spoofing Detection

```typescript
interface LocationHistory {
  coords: GeoCoordinates[];
  timestamps: Date[];
}

interface SpoofingCheckResult {
  isSuspicious: boolean;
  reason?: string;
  riskScore: number; // 0-100
}

function detectGpsSpoofing(
  currentLocation: GeoCoordinates,
  locationHistory: LocationHistory,
  venueLocation: VenueLocation
): SpoofingCheckResult {
  const checks: { passed: boolean; weight: number; reason?: string }[] = [];

  // Check 1: Impossible travel speed
  if (locationHistory.coords.length > 0) {
    const lastLocation = locationHistory.coords[locationHistory.coords.length - 1];
    const lastTimestamp = locationHistory.timestamps[locationHistory.timestamps.length - 1];
    
    const distance = haversineDistance(
      lastLocation.latitude,
      lastLocation.longitude,
      currentLocation.latitude,
      currentLocation.longitude
    );
    
    const timeDiffMs = Date.now() - lastTimestamp.getTime();
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);
    const speedKmh = (distance / 1000) / timeDiffHours;
    
    // Max reasonable speed: 500 km/h (airplane)
    checks.push({
      passed: speedKmh < 500,
      weight: 30,
      reason: speedKmh >= 500 ? 'Impossible travel speed detected' : undefined
    });
  }

  // Check 2: Exact coordinate match (common in spoofing apps)
  const coordPrecision = getCoordinatePrecision(currentLocation);
  checks.push({
    passed: coordPrecision < 8, // Suspiciously precise if > 8 decimal places
    weight: 20,
    reason: coordPrecision >= 8 ? 'Suspiciously precise coordinates' : undefined
  });

  // Check 3: Accuracy vs distance inconsistency
  if (currentLocation.accuracy) {
    const distance = haversineDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      venueLocation.latitude,
      venueLocation.longitude
    );
    
    // If claimed accuracy is better than typical for the distance
    const suspiciousAccuracy = currentLocation.accuracy < 5 && distance > 50;
    checks.push({
      passed: !suspiciousAccuracy,
      weight: 15,
      reason: suspiciousAccuracy ? 'Accuracy inconsistent with location' : undefined
    });
  }

  // Check 4: Multiple verifications from different venues in short time
  // This would require additional context from the calling function
  
  // Check 5: Known mock location provider detection (mobile only)
  // This is handled on the client side

  // Calculate risk score
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);
  const failedWeight = checks
    .filter(c => !c.passed)
    .reduce((sum, c) => sum + c.weight, 0);
  
  const riskScore = Math.round((failedWeight / totalWeight) * 100);
  
  return {
    isSuspicious: riskScore > 40,
    reason: checks.find(c => !c.passed)?.reason,
    riskScore
  };
}

function getCoordinatePrecision(coords: GeoCoordinates): number {
  const latStr = coords.latitude.toString();
  const lngStr = coords.longitude.toString();
  
  const latDecimals = latStr.includes('.') ? latStr.split('.')[1].length : 0;
  const lngDecimals = lngStr.includes('.') ? lngStr.split('.')[1].length : 0;
  
  return Math.max(latDecimals, lngDecimals);
}
```

### 4.2 Rate Limiting

```typescript
const RATE_LIMITS = {
  verificationsPerHour: 10,
  verificationsPerVenuePerDay: 3,
  uniqueVenuesPerHour: 5
};

async function checkRateLimits(
  userId: string,
  venueId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const now = Date.now();
  const hourAgo = now - 60 * 60 * 1000;
  const dayAgo = now - 24 * 60 * 60 * 1000;

  // Get recent verifications from cache/db
  const recentVerifications = await getRecentVerifications(userId, dayAgo);

  // Check hourly limit
  const lastHourCount = recentVerifications
    .filter(v => v.timestamp > hourAgo).length;
  
  if (lastHourCount >= RATE_LIMITS.verificationsPerHour) {
    return { 
      allowed: false, 
      reason: 'Too many verification attempts. Please wait.' 
    };
  }

  // Check per-venue daily limit
  const venueCountToday = recentVerifications
    .filter(v => v.venueId === venueId && v.timestamp > dayAgo).length;
  
  if (venueCountToday >= RATE_LIMITS.verificationsPerVenuePerDay) {
    return { 
      allowed: false, 
      reason: 'Maximum verifications for this venue today reached.' 
    };
  }

  // Check unique venues per hour
  const uniqueVenuesLastHour = new Set(
    recentVerifications
      .filter(v => v.timestamp > hourAgo)
      .map(v => v.venueId)
  ).size;
  
  if (uniqueVenuesLastHour >= RATE_LIMITS.uniqueVenuesPerHour) {
    return { 
      allowed: false, 
      reason: 'Too many different venues in one hour.' 
    };
  }

  return { allowed: true };
}
```

## 5. Mobile Client Implementation

### 5.1 React Native (Expo) Location Service

```typescript
import * as Location from 'expo-location';

interface LocationServiceResult {
  coords: GeoCoordinates | null;
  error: string | null;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
}

export async function requestLocationPermission(): Promise<'granted' | 'denied'> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status;
}

export async function getCurrentLocation(): Promise<LocationServiceResult> {
  try {
    // Check permission first
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      return {
        coords: null,
        error: 'Location permission not granted',
        permissionStatus: status
      };
    }

    // Get high-accuracy location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      mayShowUserSettingsDialog: true
    });

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: new Date(location.timestamp)
      },
      error: null,
      permissionStatus: 'granted'
    };

  } catch (error) {
    return {
      coords: null,
      error: error instanceof Error ? error.message : 'Failed to get location',
      permissionStatus: 'granted'
    };
  }
}

// Check for mock location (Android)
export async function isMockLocationEnabled(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }
  
  try {
    const location = await Location.getCurrentPositionAsync({});
    // @ts-ignore - mocked property exists on Android
    return location.mocked === true;
  } catch {
    return false;
  }
}
```

### 5.2 Web Geolocation API

```typescript
export function getCurrentLocationWeb(): Promise<LocationServiceResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        coords: null,
        error: 'Geolocation is not supported by this browser',
        permissionStatus: 'denied'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          },
          error: null,
          permissionStatus: 'granted'
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        let permissionStatus: 'granted' | 'denied' | 'undetermined' = 'denied';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            permissionStatus = 'denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            permissionStatus = 'granted';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            permissionStatus = 'granted';
            break;
        }

        resolve({
          coords: null,
          error: errorMessage,
          permissionStatus
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}
```

## 6. Verification Token

The verification token is a signed JWT that proves the user was verified at the venue:

```typescript
import jwt from 'jsonwebtoken';

interface VerificationPayload {
  venueId: string;
  userId: string;
  latitude: number;
  longitude: number;
  distance: number;
  timestamp: number;
}

const VERIFICATION_SECRET = process.env.VERIFICATION_SECRET!;
const TOKEN_EXPIRY = '15m'; // 15 minutes

export function generateVerificationToken(payload: VerificationPayload): string {
  return jwt.sign(payload, VERIFICATION_SECRET, {
    expiresIn: TOKEN_EXPIRY,
    issuer: 'tastebuddy-geo'
  });
}

export function verifyVerificationToken(token: string): VerificationPayload | null {
  try {
    return jwt.verify(token, VERIFICATION_SECRET) as VerificationPayload;
  } catch {
    return null;
  }
}
```

## 7. Privacy Considerations

1. **Never store raw GPS coordinates publicly** - Only store verification status
2. **Hash coordinates for storage** - If needed for audit, hash with user-specific salt
3. **Automatic deletion** - Delete raw coordinates after review is submitted
4. **Minimal collection** - Only request location when actively submitting a review
5. **Clear disclosure** - Explain why location is needed before requesting
6. **Graceful degradation** - Allow unverified reviews with lower trust score
