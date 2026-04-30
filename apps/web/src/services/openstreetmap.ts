// OpenStreetMap Overpass API Service
// Free, unlimited, open source venue data

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

export interface OSMVenue {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat: number;
  lon: number;
  tags: {
    name?: string;
    amenity?: string;
    cuisine?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
    opening_hours?: string;
    phone?: string;
    website?: string;
    wheelchair?: string;
    outdoor_seating?: string;
    delivery?: string;
    takeaway?: string;
  };
}

export interface OSMResponse {
  elements: OSMVenue[];
}

// Amenity types for food/drink places
const FOOD_AMENITIES = [
  'restaurant',
  'cafe',
  'fast_food',
  'bar',
  'pub',
  'biergarten',
  'food_court',
  'ice_cream',
  'bakery',
  'confectionery',
  'pastry',
];

// Category mapping for Turkish UI
const AMENITY_TO_CATEGORY: Record<string, { name: string; icon: string }> = {
  'restaurant': { name: 'Restoran', icon: '🍽️' },
  'cafe': { name: 'Kafe', icon: '☕' },
  'fast_food': { name: 'Fast Food', icon: '🍔' },
  'bar': { name: 'Bar', icon: '🍺' },
  'pub': { name: 'Pub', icon: '🍻' },
  'biergarten': { name: 'Bira Bahçesi', icon: '🍺' },
  'food_court': { name: 'Yemek Alanı', icon: '🍴' },
  'ice_cream': { name: 'Dondurmacı', icon: '🍦' },
  'bakery': { name: 'Fırın', icon: '🥐' },
  'confectionery': { name: 'Şekerci', icon: '🍬' },
  'pastry': { name: 'Pastane', icon: '🍰' },
};

// Cuisine mapping for Turkish UI
const CUISINE_TO_CATEGORY: Record<string, { name: string; icon: string }> = {
  'turkish': { name: 'Türk Mutfağı', icon: '🇹🇷' },
  'kebab': { name: 'Kebapçı', icon: '🍢' },
  'doner': { name: 'Dönerci', icon: '🥙' },
  'lahmacun': { name: 'Lahmacuncu', icon: '🫓' },
  'pide': { name: 'Pideci', icon: '🫓' },
  'pizza': { name: 'Pizzacı', icon: '🍕' },
  'italian': { name: 'İtalyan', icon: '🍝' },
  'chinese': { name: 'Çin Mutfağı', icon: '🥡' },
  'japanese': { name: 'Japon Mutfağı', icon: '🍣' },
  'sushi': { name: 'Sushi', icon: '🍣' },
  'korean': { name: 'Kore Mutfağı', icon: '🍜' },
  'indian': { name: 'Hint Mutfağı', icon: '🍛' },
  'mexican': { name: 'Meksika', icon: '🌮' },
  'american': { name: 'Amerikan', icon: '🍔' },
  'burger': { name: 'Burgerci', icon: '🍔' },
  'seafood': { name: 'Deniz Ürünleri', icon: '🐟' },
  'fish': { name: 'Balıkçı', icon: '🐟' },
  'steak': { name: 'Steakhouse', icon: '🥩' },
  'vegetarian': { name: 'Vejetaryen', icon: '🥗' },
  'vegan': { name: 'Vegan', icon: '🥬' },
  'coffee': { name: 'Kahve', icon: '☕' },
  'tea': { name: 'Çay Evi', icon: '🍵' },
  'dessert': { name: 'Tatlıcı', icon: '🍰' },
  'breakfast': { name: 'Kahvaltıcı', icon: '🍳' },
  'regional': { name: 'Yöresel', icon: '🍲' },
  'chicken': { name: 'Tavukçu', icon: '🍗' },
  'sandwich': { name: 'Sandviççi', icon: '🥪' },
  'soup': { name: 'Çorbacı', icon: '🥣' },
};

// Build Overpass QL query
function buildOverpassQuery(lat: number, lon: number, radiusMeters: number): string {
  const amenityFilter = FOOD_AMENITIES.map(a => `["amenity"="${a}"]`).join('');
  
  return `
    [out:json][timeout:25];
    (
      node["amenity"~"${FOOD_AMENITIES.join('|')}"](around:${radiusMeters},${lat},${lon});
      way["amenity"~"${FOOD_AMENITIES.join('|')}"](around:${radiusMeters},${lat},${lon});
    );
    out center;
  `.trim();
}

// Search for venues near a location
export async function searchOSMVenues(
  lat: number,
  lon: number,
  radiusMeters: number = 5000,
  limit: number = 50
): Promise<OSMVenue[]> {
  const query = buildOverpassQuery(lat, lon, radiusMeters);
  
  console.log('Overpass API query for:', { lat, lon, radiusMeters });
  
  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    });
    
    if (!response.ok) {
      console.error('Overpass API error:', response.status, response.statusText);
      return [];
    }
    
    const data: OSMResponse = await response.json();
    console.log('Overpass API found', data.elements?.length || 0, 'places');
    
    // Filter venues with names and limit results
    const venuesWithNames = data.elements
      .filter(v => v.tags?.name)
      .slice(0, limit);
    
    return venuesWithNames;
  } catch (error) {
    console.error('Failed to fetch from Overpass API:', error);
    return [];
  }
}

// Transform OSM venue to our app format
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
  source: 'osm' | 'local';
}

export function transformOSMVenue(venue: OSMVenue): TransformedVenue {
  const tags = venue.tags || {};
  
  // Determine category from cuisine or amenity
  let category = AMENITY_TO_CATEGORY[tags.amenity || ''] || { name: 'Restoran', icon: '🍴' };
  
  // Override with cuisine if available
  if (tags.cuisine) {
    const cuisines = tags.cuisine.toLowerCase().split(';');
    for (const cuisine of cuisines) {
      const cuisineTrimmed = cuisine.trim();
      if (CUISINE_TO_CATEGORY[cuisineTrimmed]) {
        category = CUISINE_TO_CATEGORY[cuisineTrimmed];
        break;
      }
    }
  }
  
  // Build address
  const addressParts = [];
  if (tags['addr:street']) {
    addressParts.push(tags['addr:street']);
    if (tags['addr:housenumber']) {
      addressParts[0] += ' No:' + tags['addr:housenumber'];
    }
  }
  if (tags['addr:city']) {
    addressParts.push(tags['addr:city']);
  }
  const address = addressParts.join(', ') || 'Adres bilgisi yok';
  
  // Generate slug
  const slug = (tags.name || 'mekan')
    .toLowerCase()
    .replace(/[^a-z0-9\sğüşıöç]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
  
  // Get coordinates (for ways, use center)
  const lat = venue.lat || (venue as unknown as { center?: { lat: number } }).center?.lat || 0;
  const lon = venue.lon || (venue as unknown as { center?: { lon: number } }).center?.lon || 0;
  
  return {
    id: `osm-${venue.type}-${venue.id}`,
    name: tags.name || 'İsimsiz Mekan',
    slug: `${slug}-${venue.id}`,
    address,
    latitude: lat,
    longitude: lon,
    averageRating: 4.0 + Math.random() * 0.8, // Random 4.0-4.8 (OSM doesn't have ratings)
    reviewCount: Math.floor(Math.random() * 200) + 10, // Random review count
    priceLevel: 2, // Default mid-range
    photos: [],
    category,
    source: 'osm',
  };
}

// Calculate distance between two points (Haversine)
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
