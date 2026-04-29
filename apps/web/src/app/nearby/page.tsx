'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapPin, Star, Loader2, Navigation, ChevronLeft, Map, List, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Dynamic import for Map
const VenueMap = dynamic(() => import('@/components/venue-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-muted rounded-xl flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
});

interface NearbyVenue {
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
}

// Haversine formula for distance calculation (km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// İstanbul'daki tüm mekanlar (gerçek koordinatlar)
const ALL_VENUES: Omit<NearbyVenue, 'distance'>[] = [
  {
    id: '1',
    name: 'Nusr-Et Steakhouse',
    slug: 'nusr-et-steakhouse',
    address: 'Etiler Mah. Nispetiye Cad. No:87',
    latitude: 41.0789,
    longitude: 29.0328,
    averageRating: 4.5,
    reviewCount: 2450,
    priceLevel: 4,
    photos: [],
    category: { name: 'Türk Mutfağı', icon: '🥩' },
  },
  {
    id: '2',
    name: 'Karaköy Güllüoğlu',
    slug: 'karakoy-gulluoglu',
    address: 'Rıhtım Cad. Katlı Otopark Altı No:3-4',
    latitude: 41.0226,
    longitude: 28.9774,
    averageRating: 4.8,
    reviewCount: 5230,
    priceLevel: 2,
    photos: [],
    category: { name: 'Tatlıcı', icon: '🍯' },
  },
  {
    id: '3',
    name: 'Mikla',
    slug: 'mikla-restaurant',
    address: 'The Marmara Pera, Meşrutiyet Cad. No:15',
    latitude: 41.0316,
    longitude: 28.9747,
    averageRating: 4.7,
    reviewCount: 890,
    priceLevel: 4,
    photos: [],
    category: { name: 'Fine Dining', icon: '🍽️' },
  },
  {
    id: '4',
    name: 'Kronotrop Coffee',
    slug: 'kronotrop-coffee',
    address: 'Cihangir Mah. Akarsu Yokuşu Cad. No:3',
    latitude: 41.0308,
    longitude: 28.9839,
    averageRating: 4.6,
    reviewCount: 1820,
    priceLevel: 2,
    photos: [],
    category: { name: 'Kafe', icon: '☕' },
  },
  {
    id: '5',
    name: 'Çiya Sofrası',
    slug: 'ciya-sofrasi',
    address: 'Caferağa Mah. Güneşlibahçe Sok. No:43',
    latitude: 40.9903,
    longitude: 29.0293,
    averageRating: 4.5,
    reviewCount: 3210,
    priceLevel: 2,
    photos: [],
    category: { name: 'Türk Mutfağı', icon: '🍲' },
  },
  {
    id: '6',
    name: 'Big Chefs',
    slug: 'big-chefs-zorlu',
    address: 'Zorlu Center, Levazım Mah.',
    latitude: 41.0677,
    longitude: 29.0165,
    averageRating: 4.3,
    reviewCount: 4560,
    priceLevel: 3,
    photos: [],
    category: { name: 'Dünya Mutfağı', icon: '🌍' },
  },
  {
    id: '7',
    name: 'Sunset Grill & Bar',
    slug: 'sunset-grill-bar',
    address: 'Yol Sokak No:2, Ulus Parkı',
    latitude: 41.0731,
    longitude: 29.0483,
    averageRating: 4.4,
    reviewCount: 1290,
    priceLevel: 4,
    photos: [],
    category: { name: 'Fine Dining', icon: '🌅' },
  },
  {
    id: '8',
    name: 'Karaköy Lokantası',
    slug: 'karakoy-lokantasi',
    address: 'Kemankeş Cad. No:37, Karaköy',
    latitude: 41.0234,
    longitude: 28.9761,
    averageRating: 4.5,
    reviewCount: 2870,
    priceLevel: 3,
    photos: [],
    category: { name: 'Meyhane', icon: '🍻' },
  },
  {
    id: '9',
    name: 'Burger King - Taksim',
    slug: 'burger-king-taksim',
    address: 'İstiklal Cad. No:8, Beyoğlu',
    latitude: 41.0370,
    longitude: 28.9850,
    averageRating: 3.8,
    reviewCount: 890,
    priceLevel: 1,
    photos: [],
    category: { name: 'Fast Food', icon: '🍔' },
  },
  {
    id: '10',
    name: 'Starbucks - Bebek',
    slug: 'starbucks-bebek',
    address: 'Cevdet Paşa Cad. No:34, Bebek',
    latitude: 41.0762,
    longitude: 29.0433,
    averageRating: 4.2,
    reviewCount: 1560,
    priceLevel: 2,
    photos: [],
    category: { name: 'Kafe', icon: '☕' },
  },
  {
    id: '11',
    name: 'Balıkçı Sabahattin',
    slug: 'balikci-sabahattin',
    address: 'Seyit Hasan Kuyu Sok. No:1, Sultanahmet',
    latitude: 41.0054,
    longitude: 28.9768,
    averageRating: 4.6,
    reviewCount: 1890,
    priceLevel: 3,
    photos: [],
    category: { name: 'Deniz Ürünleri', icon: '🐟' },
  },
  {
    id: '12',
    name: 'Pizza Il Forno',
    slug: 'pizza-il-forno',
    address: 'Bağdat Cad. No:456, Kadıköy',
    latitude: 40.9780,
    longitude: 29.0582,
    averageRating: 4.4,
    reviewCount: 2340,
    priceLevel: 2,
    photos: [],
    category: { name: 'İtalyan Mutfağı', icon: '🍕' },
  },
  {
    id: '13',
    name: 'Wagamama',
    slug: 'wagamama-istanbul',
    address: 'Kanyon AVM, Levent',
    latitude: 41.0792,
    longitude: 29.0108,
    averageRating: 4.3,
    reviewCount: 1670,
    priceLevel: 3,
    photos: [],
    category: { name: 'Japon Mutfağı', icon: '🍜' },
  },
  {
    id: '14',
    name: 'Gram - Nişantaşı',
    slug: 'gram-nisantasi',
    address: 'Abdi İpekçi Cad. No:32, Nişantaşı',
    latitude: 41.0478,
    longitude: 28.9914,
    averageRating: 4.5,
    reviewCount: 980,
    priceLevel: 3,
    photos: [],
    category: { name: 'Sağlıklı', icon: '🥗' },
  },
  {
    id: '15',
    name: 'Köfteci Yusuf',
    slug: 'kofteci-yusuf-eminonu',
    address: 'Hamidiye Cad. No:14, Eminönü',
    latitude: 41.0169,
    longitude: 28.9700,
    averageRating: 4.2,
    reviewCount: 4120,
    priceLevel: 1,
    photos: [],
    category: { name: 'Türk Mutfağı', icon: '🍖' },
  },
  // Ek mekanlar
  {
    id: '16',
    name: 'Hayvore',
    slug: 'hayvore-asmalimescit',
    address: 'Asmalımescit Mah. Turnacıbaşı Cad. No:4',
    latitude: 41.0323,
    longitude: 28.9762,
    averageRating: 4.4,
    reviewCount: 1890,
    priceLevel: 2,
    photos: [],
    category: { name: 'Karadeniz Mutfağı', icon: '🧀' },
  },
  {
    id: '17',
    name: 'İstanbul Modern Cafe',
    slug: 'istanbul-modern-cafe',
    address: 'Meclis-i Mebusan Cad. Liman Sahası',
    latitude: 41.0264,
    longitude: 28.9826,
    averageRating: 4.3,
    reviewCount: 980,
    priceLevel: 3,
    photos: [],
    category: { name: 'Kafe', icon: '🎨' },
  },
  {
    id: '18',
    name: 'Privato Cafe',
    slug: 'privato-cafe',
    address: 'Cihangir Mah. Akarsu Cad. No:1',
    latitude: 41.0315,
    longitude: 28.9851,
    averageRating: 4.4,
    reviewCount: 1670,
    priceLevel: 2,
    photos: [],
    category: { name: 'Kafe', icon: '☕' },
  },
  {
    id: '19',
    name: 'Gram',
    slug: 'gram',
    address: 'Şahkulu Mah. Galip Dede Cad. No:8, Galata',
    latitude: 41.0251,
    longitude: 28.9742,
    averageRating: 4.5,
    reviewCount: 2150,
    priceLevel: 2,
    photos: [],
    category: { name: 'Brunch', icon: '🥞' },
  },
  {
    id: '20',
    name: 'Mandabatmaz',
    slug: 'mandabatmaz',
    address: 'Olivia Geçidi No:1, Beyoğlu',
    latitude: 41.0335,
    longitude: 28.9765,
    averageRating: 4.7,
    reviewCount: 3450,
    priceLevel: 1,
    photos: [],
    category: { name: 'Türk Kahvesi', icon: '☕' },
  },
  {
    id: '21',
    name: 'Tarihi Karaköy Balıkçısı',
    slug: 'tarihi-karakoy-balikcisi',
    address: 'Kemankeş Cad. No:52, Karaköy',
    latitude: 41.0218,
    longitude: 28.9752,
    averageRating: 4.3,
    reviewCount: 2890,
    priceLevel: 2,
    photos: [],
    category: { name: 'Deniz Ürünleri', icon: '🐟' },
  },
  {
    id: '22',
    name: 'Neolokal',
    slug: 'neolokal',
    address: 'Bankalar Cad. No:2, Karaköy',
    latitude: 41.0227,
    longitude: 28.9745,
    averageRating: 4.6,
    reviewCount: 720,
    priceLevel: 4,
    photos: [],
    category: { name: 'Fine Dining', icon: '🍽️' },
  },
  {
    id: '23',
    name: 'Kantin',
    slug: 'kantin-nisantasi',
    address: 'Akkavak Sok. No:30, Nişantaşı',
    latitude: 41.0485,
    longitude: 28.9936,
    averageRating: 4.4,
    reviewCount: 1560,
    priceLevel: 3,
    photos: [],
    category: { name: 'Modern Türk', icon: '🍴' },
  },
  {
    id: '24',
    name: 'Pepo',
    slug: 'pepo-beyoglu',
    address: 'Meşrutiyet Cad. No:21, Beyoğlu',
    latitude: 41.0312,
    longitude: 28.9748,
    averageRating: 4.3,
    reviewCount: 890,
    priceLevel: 2,
    photos: [],
    category: { name: 'Kafe', icon: '☕' },
  },
  {
    id: '25',
    name: 'Under',
    slug: 'under-karakoy',
    address: 'Kemankeş Cad. No:7, Karaköy',
    latitude: 41.0222,
    longitude: 28.9758,
    averageRating: 4.5,
    reviewCount: 1230,
    priceLevel: 3,
    photos: [],
    category: { name: 'Bar & Restoran', icon: '🍸' },
  },
  {
    id: '26',
    name: 'Lokanta Maya',
    slug: 'lokanta-maya',
    address: 'Kemankeş Cad. No:35, Karaköy',
    latitude: 41.0231,
    longitude: 28.9759,
    averageRating: 4.4,
    reviewCount: 1890,
    priceLevel: 3,
    photos: [],
    category: { name: 'Modern Türk', icon: '🍽️' },
  },
  {
    id: '27',
    name: 'House Cafe Ortaköy',
    slug: 'house-cafe-ortakoy',
    address: 'Salhane Sok. No:1, Ortaköy',
    latitude: 41.0483,
    longitude: 29.0271,
    averageRating: 4.2,
    reviewCount: 2340,
    priceLevel: 3,
    photos: [],
    category: { name: 'Kafe', icon: '☕' },
  },
  {
    id: '28',
    name: 'Bebek Balıkçısı',
    slug: 'bebek-balikcisi',
    address: 'Cevdet Paşa Cad. No:26, Bebek',
    latitude: 41.0755,
    longitude: 29.0428,
    averageRating: 4.5,
    reviewCount: 1670,
    priceLevel: 4,
    photos: [],
    category: { name: 'Deniz Ürünleri', icon: '🐟' },
  },
  {
    id: '29',
    name: 'Ara Cafe',
    slug: 'ara-cafe',
    address: 'Tosbağa Sok. No:2, Galata',
    latitude: 41.0258,
    longitude: 28.9738,
    averageRating: 4.3,
    reviewCount: 1240,
    priceLevel: 2,
    photos: [],
    category: { name: 'Kafe', icon: '📷' },
  },
  {
    id: '30',
    name: 'Beyaz Fırın',
    slug: 'beyaz-firin',
    address: 'İstiklal Cad. No:85, Beyoğlu',
    latitude: 41.0345,
    longitude: 28.9780,
    averageRating: 4.4,
    reviewCount: 3670,
    priceLevel: 2,
    photos: [],
    category: { name: 'Fırın & Pastane', icon: '🥐' },
  },
];

export default function NearbyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [maxDistance, setMaxDistance] = useState<number>(50); // km
  const [locationStatus, setLocationStatus] = useState<'checking' | 'granted' | 'denied' | 'fallback' | 'unavailable'>('checking');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  // Check permission status on mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    setIsLoading(true);
    setLocationError(null);
    
    // Check if geolocation is available
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setLocationError('Tarayıcınız konum servisini desteklemiyor');
      setShowLocationPrompt(true);
      setIsLoading(false);
      return;
    }

    // Check permission status if available (modern browsers)
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        
        if (result.state === 'granted') {
          // Permission already granted, get location
          getCurrentLocation();
        } else if (result.state === 'denied') {
          // Permission denied
          setLocationStatus('denied');
          setLocationError('Konum izni reddedildi. Yakınınızdaki mekanları görmek için konum iznine ihtiyacımız var.');
          setShowLocationPrompt(true);
          setIsLoading(false);
        } else {
          // Permission prompt will be shown
          setShowLocationPrompt(true);
          setIsLoading(false);
        }
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          if (result.state === 'granted') {
            setShowLocationPrompt(false);
            getCurrentLocation();
          } else if (result.state === 'denied') {
            setLocationStatus('denied');
            setLocationError('Konum izni reddedildi');
            setShowLocationPrompt(true);
          }
        });
      } catch (error) {
        // Permissions API not fully supported, show prompt
        setShowLocationPrompt(true);
        setIsLoading(false);
      }
    } else {
      // No Permissions API, show prompt directly
      setShowLocationPrompt(true);
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    setIsLoading(true);
    setLocationError(null);
    setShowLocationPrompt(false);
    
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setLocationError('Tarayıcınız konum servisini desteklemiyor');
      setShowLocationPrompt(true);
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationStatus('granted');
        setIsLoading(false);
        toast.success('Konumunuz başarıyla alındı!');
      },
      (error) => {
        console.log('Geolocation error:', error.code, error.message);
        
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus('denied');
          setLocationError('Konum izni reddedildi. Tarayıcı ayarlarından konum iznini etkinleştirin.');
          setShowLocationPrompt(true);
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationStatus('fallback');
          setLocationError('Konum bilgisi alınamadı. GPS\'inizi kontrol edin veya varsayılan konum kullanın.');
          setShowLocationPrompt(true);
        } else if (error.code === error.TIMEOUT) {
          setLocationStatus('fallback');
          setLocationError('Konum alma zaman aşımına uğradı. Tekrar deneyin veya varsayılan konum kullanın.');
          setShowLocationPrompt(true);
        }
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  const useFallbackLocation = () => {
    // Istanbul center as fallback
    setUserLocation({ lat: 41.0082, lng: 28.9784 });
    setLocationStatus('fallback');
    setShowLocationPrompt(false);
    toast.info('İstanbul merkez konumu kullanılıyor');
  };

  // Calculate distances and sort venues
  const nearbyVenues = useMemo(() => {
    if (!userLocation) return [];
    
    const venuesWithDistance = ALL_VENUES.map(venue => ({
      ...venue,
      distance: calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        venue.latitude, 
        venue.longitude
      ),
    }));
    
    // Filter by max distance and sort by distance
    return venuesWithDistance
      .filter(venue => venue.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }, [userLocation, maxDistance]);

  // Map venues format
  const mapVenues = useMemo(() => {
    return nearbyVenues.map(venue => ({
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      address: venue.address,
      latitude: venue.latitude,
      longitude: venue.longitude,
      averageRating: venue.averageRating,
      reviewCount: venue.reviewCount,
      priceLevel: venue.priceLevel,
      category: venue.category,
    }));
  }, [nearbyVenues]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/explore" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
            Geri
          </Link>
          <h1 className="text-lg font-semibold">Yakınımdaki Mekanlar</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={getCurrentLocation}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Konumu Yenile"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-muted'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background hover:bg-muted'
                }`}
              >
                <Map className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Location Permission Prompt */}
        {showLocationPrompt && !userLocation && (
          <div className="mb-6 p-6 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800 rounded-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mb-4">
                <Navigation className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Konumunuza Erişim İzni Gerekli</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md">
                {locationError || 'Yakınınızdaki restoranları ve kafeleri gösterebilmemiz için konum iznine ihtiyacımız var.'}
              </p>
              
              {locationStatus === 'denied' ? (
                <div className="space-y-3 w-full max-w-sm">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Konum İzni Reddedildi</p>
                    <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                      Tarayıcı ayarlarından TasteBuddy için konum iznini etkinleştirin, ardından sayfayı yenileyin.
                    </p>
                  </div>
                  <button
                    onClick={useFallbackLocation}
                    className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    İstanbul Merkez Kullan
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={getCurrentLocation}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 py-3 px-6 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Konum Alınıyor...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4" />
                        Konumumu Kullan
                      </>
                    )}
                  </button>
                  <button
                    onClick={useFallbackLocation}
                    className="py-3 px-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                  >
                    İstanbul Merkez Kullan
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback Location Warning Banner */}
        {locationStatus === 'fallback' && userLocation && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <MapPin className="h-4 w-4" />
              <span>Varsayılan konum kullanılıyor (İstanbul Merkez)</span>
            </div>
            <button
              onClick={getCurrentLocation}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Gerçek konumumu kullan
            </button>
          </div>
        )}

        {/* Location Info */}
        {userLocation && locationStatus === 'granted' && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Navigation className="h-4 w-4" />
              <span>Konumunuz alındı ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mesafe:</span>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="text-sm border rounded-lg px-2 py-1 bg-background"
              >
                <option value={1}>1 km</option>
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km (Tümü)</option>
              </select>
            </div>
          </div>
        )}

        {/* Distance Filter for Fallback Mode */}
        {userLocation && locationStatus === 'fallback' && (
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mesafe:</span>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="text-sm border rounded-lg px-2 py-1 bg-background"
              >
                <option value={1}>1 km</option>
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km (Tümü)</option>
              </select>
            </div>
          </div>
        )}

        {/* Results Count */}
        {!isLoading && userLocation && nearbyVenues.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {nearbyVenues.length} mekan bulundu ({maxDistance} km içinde)
          </p>
        )}

        {isLoading && !showLocationPrompt ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Yakınındaki mekanlar aranıyor...</p>
          </div>
        ) : !userLocation ? (
          // Don't show anything if we're still waiting for location permission
          null
        ) : viewMode === 'map' ? (
          <div className="rounded-xl overflow-hidden">
            <VenueMap
              venues={mapVenues}
              center={userLocation ? [userLocation.lat, userLocation.lng] : [41.0082, 28.9784]}
              zoom={13}
              userLocation={userLocation}
              className="h-[500px]"
            />
          </div>
        ) : nearbyVenues.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Bu mesafe içinde mekan bulunamadı</p>
            <button
              onClick={() => setMaxDistance(50)}
              className="text-primary hover:underline"
            >
              Tüm mekanları göster
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {nearbyVenues.map((venue) => (
              <Link
                key={venue.id}
                href={`/venues/${venue.slug}`}
                className="flex gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow bg-card"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center text-3xl shrink-0">
                  {venue.category.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold truncate">{venue.name}</h3>
                    <div className="flex items-center gap-1 text-sm shrink-0 bg-yellow-50 px-2 py-0.5 rounded-full">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{venue.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{venue.category.name}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">{venue.address}</p>
                  
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="flex items-center gap-1 font-medium text-primary">
                      <MapPin className="h-3 w-3" />
                      {venue.distance! < 1 
                        ? `${(venue.distance! * 1000).toFixed(0)} m`
                        : `${venue.distance!.toFixed(1)} km`
                      }
                    </span>
                    <span className="text-muted-foreground">{Array(venue.priceLevel).fill('₺').join('')}</span>
                    <span className="text-muted-foreground">{venue.reviewCount} değerlendirme</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
