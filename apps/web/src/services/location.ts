// Location Service - Enhanced geolocation with fallbacks

export interface LocationCoords {
  lat: number;
  lng: number;
  accuracy?: number;
  source: 'gps' | 'ip' | 'manual' | 'fallback';
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

// IP-based geolocation service (free, no API key needed)
export async function getLocationByIP(): Promise<LocationCoords | null> {
  // Try ipapi.co first (HTTPS, 1000 requests/day free)
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    if (data.latitude && data.longitude && !data.error) {
      return {
        lat: data.latitude,
        lng: data.longitude,
        accuracy: 5000, // IP geolocation is ~5km accuracy
        source: 'ip',
      };
    }
  } catch (error) {
    console.warn('ipapi.co failed, trying alternative...');
  }

  // Fallback to ipwho.is (HTTPS, unlimited free tier)
  try {
    const response = await fetch('https://ipwho.is/');
    const data = await response.json();
    
    if (data.success && data.latitude && data.longitude) {
      return {
        lat: data.latitude,
        lng: data.longitude,
        accuracy: 5000,
        source: 'ip',
      };
    }
  } catch (error) {
    console.warn('ipwho.is also failed');
  }

  // Final fallback to ip-api.com via HTTPS proxy workaround
  try {
    const response = await fetch('https://freeipapi.com/api/json');
    const data = await response.json();
    
    if (data.latitude && data.longitude) {
      return {
        lat: data.latitude,
        lng: data.longitude,
        accuracy: 5000,
        source: 'ip',
      };
    }
  } catch (error) {
    console.warn('All IP geolocation services failed');
  }

  return null;
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
      timeout: options?.timeout ?? 15000,
      maximumAge: options?.maximumAge ?? 60000,
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
            errorMessage = 'Konum izni reddedildi. Tarayıcı ayarlarından konum iznini etkinleştirin.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorCode = 'POSITION_UNAVAILABLE';
            errorMessage = 'Konum bilgisi alınamadı. GPS\'inizi kontrol edin.';
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
      onUpdate({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        source: 'gps',
      });
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
      timeout: 10000,
      maximumAge: 30000,
    }
  );
}

// Clear watch
export function clearLocationWatch(watchId: number): void {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
}

// Main function: Get current location with fallbacks
export async function getCurrentLocation(options?: {
  useIPFallback?: boolean;
  useDefaultFallback?: boolean;
  timeout?: number;
}): Promise<LocationCoords> {
  const useIPFallback = options?.useIPFallback ?? true;
  const useDefaultFallback = options?.useDefaultFallback ?? true;

  // Try GPS first
  try {
    const gpsLocation = await getGPSLocation({ timeout: options?.timeout });
    console.log('Got GPS location:', gpsLocation);
    return gpsLocation;
  } catch (gpsError) {
    console.warn('GPS location failed:', gpsError);
    
    // If permission denied and no fallback, throw
    if ((gpsError as LocationError).code === 'PERMISSION_DENIED' && !useIPFallback) {
      throw gpsError;
    }
  }

  // Try IP-based geolocation as fallback
  if (useIPFallback) {
    console.log('Trying IP-based geolocation...');
    const ipLocation = await getLocationByIP();
    if (ipLocation) {
      console.log('Got IP location:', ipLocation);
      return ipLocation;
    }
  }

  // Use default fallback
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
