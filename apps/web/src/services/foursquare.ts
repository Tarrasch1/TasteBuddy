// Foursquare Places API Service
const FOURSQUARE_API_KEY = process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY;
const BASE_URL = 'https://api.foursquare.com/v3';

// Debug: check if API key is present
if (typeof window !== 'undefined') {
  console.log('Foursquare API Key configured:', !!FOURSQUARE_API_KEY, FOURSQUARE_API_KEY ? `(${FOURSQUARE_API_KEY.slice(0, 8)}...)` : '');
}

export interface FoursquarePlace {
  fsq_id: string;
  name: string;
  geocodes: {
    main: {
      latitude: number;
      longitude: number;
    };
  };
  location: {
    address?: string;
    formatted_address?: string;
    locality?: string;
    region?: string;
    country?: string;
  };
  categories: {
    id: number;
    name: string;
    icon: {
      prefix: string;
      suffix: string;
    };
  }[];
  distance?: number;
  rating?: number;
  photos?: {
    id: string;
    prefix: string;
    suffix: string;
  }[];
  price?: number;
  stats?: {
    total_ratings?: number;
    total_tips?: number;
  };
}

export interface PlaceSearchParams {
  ll: string; // latitude,longitude
  radius?: number; // meters (max 100000)
  categories?: string; // comma-separated category IDs
  query?: string;
  limit?: number; // max 50
  sort?: 'RELEVANCE' | 'RATING' | 'DISTANCE' | 'POPULARITY';
}

// Foursquare restaurant/food categories
export const FOOD_CATEGORIES = {
  RESTAURANT: '13065',
  CAFE: '13032',
  BAKERY: '13002',
  BAR: '13003',
  FAST_FOOD: '13145',
  COFFEE_SHOP: '13035',
  DESSERT_SHOP: '13040',
  ICE_CREAM: '13046',
  JUICE_BAR: '13381',
  PIZZA: '13064',
  STEAKHOUSE: '13383',
  SEAFOOD: '13338',
  SUSHI: '13274',
  TURKISH: '13303',
  KEBAB: '13182',
};

// All food-related categories
export const ALL_FOOD_CATEGORIES = Object.values(FOOD_CATEGORIES).join(',');

// Category icon mapping for Turkish UI
export const getCategoryIcon = (categoryId: number): string => {
  const iconMap: Record<number, string> = {
    13065: '🍽️', // Restaurant
    13032: '☕', // Cafe
    13002: '🥐', // Bakery
    13003: '🍺', // Bar
    13145: '🍔', // Fast Food
    13035: '☕', // Coffee Shop
    13040: '🍰', // Dessert Shop
    13046: '🍦', // Ice Cream
    13381: '🥤', // Juice Bar
    13064: '🍕', // Pizza
    13383: '🥩', // Steakhouse
    13338: '🐟', // Seafood
    13274: '🍣', // Sushi
    13303: '🇹🇷', // Turkish
    13182: '🍢', // Kebab
  };
  return iconMap[categoryId] || '🍴';
};

// Category name mapping for Turkish UI
export const getCategoryNameTR = (categoryName: string): string => {
  const nameMap: Record<string, string> = {
    'Restaurant': 'Restoran',
    'Café': 'Kafe',
    'Cafe': 'Kafe',
    'Coffee Shop': 'Kahve Dükkanı',
    'Bakery': 'Fırın',
    'Bar': 'Bar',
    'Fast Food Restaurant': 'Fast Food',
    'Dessert Shop': 'Tatlıcı',
    'Ice Cream Shop': 'Dondurmacı',
    'Juice Bar': 'Meyve Suyu Bar',
    'Pizza Place': 'Pizzacı',
    'Steakhouse': 'Steakhouse',
    'Seafood Restaurant': 'Deniz Ürünleri',
    'Sushi Restaurant': 'Sushi',
    'Turkish Restaurant': 'Türk Mutfağı',
    'Kebab Restaurant': 'Kebapçı',
    'Breakfast Spot': 'Kahvaltıcı',
    'Brunch Restaurant': 'Brunch',
    'Middle Eastern Restaurant': 'Ortadoğu Mutfağı',
    'Mediterranean Restaurant': 'Akdeniz Mutfağı',
    'Italian Restaurant': 'İtalyan',
    'Asian Restaurant': 'Asya Mutfağı',
    'Chinese Restaurant': 'Çin Mutfağı',
    'Japanese Restaurant': 'Japon Mutfağı',
    'Mexican Restaurant': 'Meksika Mutfağı',
    'American Restaurant': 'Amerikan',
    'French Restaurant': 'Fransız',
    'Indian Restaurant': 'Hint',
    'Thai Restaurant': 'Tayland',
    'Korean Restaurant': 'Kore Mutfağı',
    'Burger Joint': 'Burgerci',
    'Sandwich Shop': 'Sandviççi',
    'Salad Shop': 'Salata Bar',
    'Soup Restaurant': 'Çorbacı',
    'Deli': 'Şarküteri',
    'Food Court': 'Yemek Alanı',
    'Food Truck': 'Yemek Kamyonu',
    'Gastropub': 'Gastropub',
    'Wine Bar': 'Şarap Bar',
    'Cocktail Bar': 'Kokteyl Bar',
    'Tea Room': 'Çay Evi',
    'Patisserie': 'Pastane',
    'Chocolate Shop': 'Çikolatacı',
    'Candy Store': 'Şekerci',
    'Donut Shop': 'Donutçu',
    'Frozen Yogurt Shop': 'Donmuş Yoğurt',
  };
  return nameMap[categoryName] || categoryName;
};

// Search for places near a location
export async function searchPlaces(params: PlaceSearchParams): Promise<FoursquarePlace[]> {
  console.log('Foursquare API Key:', FOURSQUARE_API_KEY ? `Present (${FOURSQUARE_API_KEY.slice(0, 10)}...)` : 'MISSING');
  
  if (!FOURSQUARE_API_KEY) {
    console.error('Foursquare API key is not configured - returning empty');
    return [];
  }

  const searchParams = new URLSearchParams({
    ll: params.ll,
    radius: String(params.radius || 5000),
    limit: String(params.limit || 50),
    sort: params.sort || 'DISTANCE',
  });

  // Only add categories if no query
  if (!params.query) {
    searchParams.append('categories', params.categories || ALL_FOOD_CATEGORIES);
  }

  if (params.query) {
    searchParams.append('query', params.query);
  }

  const url = `${BASE_URL}/places/search?${searchParams}`;
  console.log('Foursquare API request URL:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
        'Accept': 'application/json',
      },
    });

    console.log('Foursquare API response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Foursquare API error details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      
      // Parse error for user-friendly message
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Foursquare error message:', errorJson.message || errorJson.error);
      } catch {
        console.error('Raw error:', errorText);
      }
      
      return [];
    }

    const data = await response.json();
    console.log('Foursquare API success! Found', data.results?.length || 0, 'places');
    return data.results || [];
  } catch (error) {
    console.error('Failed to fetch places (network error):', error);
    return [];
  }
}

// Get place details
export async function getPlaceDetails(fsqId: string): Promise<FoursquarePlace | null> {
  if (!FOURSQUARE_API_KEY) {
    console.error('Foursquare API key is not configured');
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/places/${fsqId}?fields=fsq_id,name,geocodes,location,categories,rating,photos,price,stats`, {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Foursquare API error:', response.status, error);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch place details:', error);
    return null;
  }
}

// Get place photos
export async function getPlacePhotos(fsqId: string, limit: number = 4): Promise<string[]> {
  if (!FOURSQUARE_API_KEY) {
    return [];
  }

  try {
    const response = await fetch(`${BASE_URL}/places/${fsqId}/photos?limit=${limit}`, {
      headers: {
        'Authorization': FOURSQUARE_API_KEY,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return [];
    }

    const photos = await response.json();
    return photos.map((photo: { prefix: string; suffix: string }) => 
      `${photo.prefix}300x300${photo.suffix}`
    );
  } catch (error) {
    console.error('Failed to fetch place photos:', error);
    return [];
  }
}

// Transform Foursquare place to our app format
export interface TransformedVenue {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  averageRating: number;
  reviewCount: number;
  priceLevel: number;
  photos: { url: string }[];
  category: { name: string; icon: string };
  source: 'foursquare' | 'local';
}

export function transformFoursquarePlace(place: FoursquarePlace): TransformedVenue {
  const category = place.categories?.[0];
  const categoryName = category ? getCategoryNameTR(category.name) : 'Restoran';
  const categoryIcon = category ? getCategoryIcon(category.id) : '🍴';

  // Generate slug from name
  const slug = place.name
    .toLowerCase()
    .replace(/[^a-z0-9\sğüşıöç]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');

  return {
    id: place.fsq_id,
    name: place.name,
    slug: `${slug}-${place.fsq_id.slice(-6)}`,
    address: place.location?.formatted_address || place.location?.address || '',
    latitude: place.geocodes?.main?.latitude || 0,
    longitude: place.geocodes?.main?.longitude || 0,
    distance: place.distance ? place.distance / 1000 : undefined, // Convert to km
    averageRating: place.rating ? place.rating / 2 : 4.0, // Foursquare uses 10-point scale
    reviewCount: place.stats?.total_ratings || place.stats?.total_tips || 0,
    priceLevel: place.price || 2,
    photos: [],
    category: { name: categoryName, icon: categoryIcon },
    source: 'foursquare',
  };
}
