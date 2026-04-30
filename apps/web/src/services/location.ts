// Location Service - Optimized geolocation with parallel fallbacks

export interface LocationCoords {
  lat: number;
  lng: number;
  accuracy?: number;
  source: 'gps' | 'ip' | 'manual' | 'fallback' | 'cached';
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED' | 'UNKNOWN';
  message: string;
}

// Default fallback location (Istanbul center)
const ISTANBUL_CENTER: LocationCoords = {
  lat: 41.0082,
  lng: 28.9784,
  source: 'fallback',
};

// Cache for quick access
const LOCATION_CACHE_KEY = 'tastebuddy_last_location';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

// Save location to cache
function cacheLocation(coords: LocationCoords): void {
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({
      ...coords,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignore localStorage errors
  }
}

// Get cached location if still valid
export function getCachedLocation(): LocationCoords | null {
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_MAX_AGE) {
        return {
          lat: data.lat,
          lng: data.lng,
          accuracy: data.accuracy,
          source: 'cached',
        };
      }
    }
  } catch {
    // Ignore errors
  }
  return null;
}

// IP-based geolocation - PARALLEL requests to multiple services
export async function getLocationByIP(): Promise<LocationCoords | null> {
  // Race all IP services in parallel - first one wins
  const ipServices = [
    // ipapi.co - fast and reliable
    fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
      .then(r => r.json())
      .then(data => {
        if (data.latitude && data.longitude && !data.error) {
          return { lat: data.latitude, lng: data.longitude, accuracy: 5000, source: 'ip' as const };
        }
        throw new Error('Invalid data');
      }),
    
    // ipwho.is - good backup
    fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.latitude && data.longitude) {
          return { lat: data.latitude, lng: data.longitude, accuracy: 5000, source: 'ip' as const };
        }
        throw new Error('Invalid data');
      }),
    
    // freeipapi.com - another backup
    fetch('https://freeipapi.com/api/json', { signal: AbortSignal.timeout(3000) })
      .then(r => r.json())
      .then(data => {
        if (data.latitude && data.longitude) {
          return { lat: data.latitude, lng: data.longitude, accuracy: 5000, source: 'ip' as const };
        }
        throw new Error('Invalid data');
      }),
  ];

  try {
    // Promise.any returns first successful result
    const result = await Promise.any(ipServices);
    return result;
  } catch {
    console.warn('All IP geolocation services failed');
    return null;
  }
}

// Quick GPS location (low accuracy, faster)
export function getQuickGPSLocation(timeout: number = 3000): Promise<LocationCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: 'NOT_SUPPORTED', message: 'GPS desteklenmiyor' } as LocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'gps',
        });
      },
      (error) => {
        reject({
          code: error.code === 1 ? 'PERMISSION_DENIED' : 
                error.code === 2 ? 'POSITION_UNAVAILABLE' : 'TIMEOUT',
          message: error.message,
        } as LocationError);
      },
      {
        enableHighAccuracy: false, // Low accuracy = faster
        timeout: timeout,
        maximumAge: 60000, // Accept cached location up to 1 min
      }
    );
  });
}

// High accuracy GPS location
export function getGPSLocation(options?: {
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
}): Promise<LocationCoords> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 'NOT_SUPPORTED',
        message: 'Tarayıcınız konum servisini desteklemiyor',
      } as LocationError);
      return;
    }

    const geoOptions: PositionOptions = {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 8000, // Reduced from 15s to 8s
      maximumAge: options?.maximumAge ?? 30000, // Accept 30s old location
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: 'gps',
        });
      },
      (error) => {
        let errorCode: LocationError['code'];
        let errorMessage: string;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorCode = 'PERMISSION_DENIED';
            errorMessage = 'Konum izni reddedildi.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorCode = 'POSITION_UNAVAILABLE';
            errorMessage = 'Konum bilgisi alınamadı.';
            break;
          case error.TIMEOUT:
            errorCode = 'TIMEOUT';
            errorMessage = 'Konum alma zaman aşımına uğradı.';
            break;
          default:
            errorCode = 'UNKNOWN';
            errorMessage = 'Bilinmeyen bir hata oluştu.';
        }

        reject({ code: errorCode, message: errorMessage } as LocationError);
      },
      geoOptions
    );
  });
}

// Watch position for continuous updates
export function watchLocation(
  onUpdate: (coords: LocationCoords) => void,
  onError?: (error: LocationError) => void
): number | null {
  if (!navigator.geolocation) {
    onError?.({
      code: 'NOT_SUPPORTED',
      message: 'Tarayıcınız konum servisini desteklemiyor',
    });
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      const coords: LocationCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        source: 'gps',
      };
      cacheLocation(coords);
      onUpdate(coords);
    },
    (error) => {
      let errorCode: LocationError['code'];
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorCode = 'PERMISSION_DENIED';
          break;
        case error.POSITION_UNAVAILABLE:
          errorCode = 'POSITION_UNAVAILABLE';
          break;
        case error.TIMEOUT:
          errorCode = 'TIMEOUT';
          break;
        default:
          errorCode = 'UNKNOWN';
      }
      onError?.({ code: errorCode, message: error.message });
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 10000,
    }
  );
}

// Clear watch
export function clearLocationWatch(watchId: number): void {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
}

// OPTIMIZED: Get current location with parallel requests
export async function getCurrentLocation(options?: {
  useIPFallback?: boolean;
  useDefaultFallback?: boolean;
  timeout?: number;
  useCache?: boolean;
}): Promise<LocationCoords> {
  const useIPFallback = options?.useIPFallback ?? true;
  const useDefaultFallback = options?.useDefaultFallback ?? true;
  const useCache = options?.useCache ?? true;

  // 1. Check cache first (instant)
  if (useCache) {
    const cached = getCachedLocation();
    if (cached) {
      console.log('Using cached location');
      // Still try to get fresh location in background
      getCurrentLocation({ ...options, useCache: false }).then(fresh => {
        cacheLocation(fresh);
      }).catch(() => {});
      return cached;
    }
  }

  // 2. Check permission status first
  const permissionStatus = await checkLocationPermission();
  
  if (permissionStatus === 'denied') {
    // Permission denied - skip GPS, go straight to IP
    if (useIPFallback) {
      const ipLocation = await getLocationByIP();
      if (ipLocation) {
        cacheLocation(ipLocation);
        return ipLocation;
      }
    }
    if (useDefaultFallback) {
      return ISTANBUL_CENTER;
    }
    throw { code: 'PERMISSION_DENIED', message: 'Konum izni reddedildi' } as LocationError;
  }

  // 3. Run GPS and IP in PARALLEL - first valid result wins
  const gpsPromise = getQuickGPSLocation(options?.timeout ?? 5000)
    .then(result => {
      console.log('GPS succeeded first');
      return result;
    })
    .catch(err => {
      console.warn('Quick GPS failed:', err.code);
      throw err;
    });

  const ipPromise = useIPFallback 
    ? getLocationByIP().then(result => {
        if (!result) throw new Error('IP location failed');
        console.log('IP succeeded');
        return result;
      })
    : Promise.reject(new Error('IP fallback disabled'));

  try {
    // Race GPS vs IP - fastest wins
    const result = await Promise.any([gpsPromise, ipPromise]);
    cacheLocation(result);
    return result;
  } catch {
    // Both failed, try high accuracy GPS as last resort
    try {
      const highAccuracyGPS = await getGPSLocation({ timeout: 8000 });
      cacheLocation(highAccuracyGPS);
      return highAccuracyGPS;
    } catch (gpsError) {
      console.warn('High accuracy GPS also failed:', gpsError);
    }
  }

  // 4. Final fallback
  if (useDefaultFallback) {
    console.log('Using default Istanbul location');
    return ISTANBUL_CENTER;
  }

  throw {
    code: 'POSITION_UNAVAILABLE',
    message: 'Konum alınamadı',
  } as LocationError;
}

// Check if geolocation permission is granted
export async function checkLocationPermission(): Promise<'granted' | 'denied' | 'prompt' | 'unsupported'> {
  if (!navigator.geolocation) {
    return 'unsupported';
  }

  if (navigator.permissions && navigator.permissions.query) {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state as 'granted' | 'denied' | 'prompt';
    } catch {
      return 'prompt';
    }
  }

  return 'prompt';
}

// Distance calculation (Haversine formula)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}
