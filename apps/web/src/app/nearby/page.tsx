'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapPin, Star, Loader2, Navigation, ChevronLeft, Map, List, RefreshCw, Wifi, WifiOff, Search } from 'lucide-react';
import { toast } from 'sonner';
import { searchPlaces, transformFoursquarePlace, TransformedVenue, ALL_FOOD_CATEGORIES } from '@/services/foursquare';
import { getCurrentLocation, LocationCoords, calculateDistance, formatDistance } from '@/services/location';

// Dynamic import for Map
const VenueMap = dynamic(() => import('@/components/venue-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-muted rounded-xl flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
});

// Demo venues generator - creates venues around user's location
function getDemoVenues(location: LocationCoords): TransformedVenue[] {
  const demoData = [
    { name: 'Starbucks', icon: '☕', category: 'Kafe', price: 3, rating: 4.2 },
    { name: 'Burger King', icon: '🍔', category: 'Fast Food', price: 2, rating: 3.8 },
    { name: 'Pizza Hut', icon: '🍕', category: 'Pizzacı', price: 2, rating: 4.0 },
    { name: 'Köfteci Yusuf', icon: '🍖', category: 'Türk Mutfağı', price: 2, rating: 4.3 },
    { name: 'Simit Sarayı', icon: '🥯', category: 'Fırın', price: 1, rating: 4.1 },
    { name: 'McDonald\'s', icon: '🍟', category: 'Fast Food', price: 2, rating: 3.9 },
    { name: 'Kahve Dünyası', icon: '☕', category: 'Kafe', price: 2, rating: 4.4 },
    { name: 'Günaydın Kebap', icon: '🍢', category: 'Kebapçı', price: 3, rating: 4.5 },
    { name: 'Big Chefs', icon: '🍽️', category: 'Dünya Mutfağı', price: 3, rating: 4.2 },
    { name: 'Cookshop', icon: '🥗', category: 'Sağlıklı', price: 3, rating: 4.3 },
    { name: 'Midpoint', icon: '🍔', category: 'Amerikan', price: 2, rating: 4.0 },
    { name: 'Nusret', icon: '🥩', category: 'Steakhouse', price: 4, rating: 4.6 },
    { name: 'Domino\'s Pizza', icon: '🍕', category: 'Pizzacı', price: 2, rating: 4.0 },
    { name: 'Popeyes', icon: '🍗', category: 'Fast Food', price: 2, rating: 4.1 },
    { name: 'Tavuk Dünyası', icon: '🍗', category: 'Fast Food', price: 2, rating: 4.0 },
    { name: 'Espresso Lab', icon: '☕', category: 'Kafe', price: 3, rating: 4.5 },
    { name: 'Balıkçı Kahraman', icon: '🐟', category: 'Deniz Ürünleri', price: 3, rating: 4.4 },
    { name: 'Hacı Bekir', icon: '🍬', category: 'Tatlıcı', price: 2, rating: 4.7 },
    { name: 'Mado', icon: '🍦', category: 'Dondurmacı', price: 2, rating: 4.3 },
    { name: 'Happy Moon\'s', icon: '🌙', category: 'Dünya Mutfağı', price: 3, rating: 4.1 },
  ];

  // Generate venues around user's location
  return demoData.map((demo, index) => {
    // Random offset within ~2km radius
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;
    const lat = location.lat + latOffset;
    const lng = location.lng + lngOffset;
    
    const distance = calculateDistance(location.lat, location.lng, lat, lng);
    
    return {
      id: `demo-${index}`,
      name: demo.name,
      slug: demo.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
      address: `Yakınınızda (Demo)`,
      latitude: lat,
      longitude: lng,
      distance: distance,
      averageRating: demo.rating,
      reviewCount: Math.floor(Math.random() * 500) + 50,
      priceLevel: demo.price,
      photos: [],
      category: { name: demo.category, icon: demo.icon },
      source: 'local' as const,
    };
  }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
}

export default function NearbyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [maxDistance, setMaxDistance] = useState<number>(5); // km
  const [locationStatus, setLocationStatus] = useState<'checking' | 'granted' | 'denied' | 'fallback' | 'ip' | 'cached' | 'unavailable'>('checking');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [venues, setVenues] = useState<TransformedVenue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dataSource, setDataSource] = useState<'api' | 'fallback'>('api');

  // Fetch location and then venues
  const fetchLocationAndVenues = useCallback(async (forceGPS = false) => {
    setIsLoading(true);
    setLocationError(null);
    setShowLocationPrompt(false);

    try {
      // Get location with smart fallbacks
      const location = await getCurrentLocation({
        useIPFallback: !forceGPS,
        useDefaultFallback: !forceGPS,
        timeout: forceGPS ? 10000 : 5000,
        useCache: !forceGPS, // Don't use cache when forcing GPS
      });

      setUserLocation(location);
      
      if (location.source === 'gps') {
        setLocationStatus('granted');
        toast.success('GPS konumunuz alındı!');
      } else if (location.source === 'cached') {
        setLocationStatus('cached');
        toast.success('Önbellek konumu kullanılıyor');
      } else if (location.source === 'ip') {
        setLocationStatus('ip');
        toast.info('IP tabanlı konum kullanılıyor');
      } else {
        setLocationStatus('fallback');
        toast.info('Varsayılan konum kullanılıyor');
      }

      // Fetch venues from Foursquare
      await fetchVenues(location);
    } catch (error: unknown) {
      console.error('Location error:', error);
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as { message: string }).message 
        : 'Konum alınamadı';
      setLocationError(errorMessage);
      setShowLocationPrompt(true);
      setIsLoading(false);
      
      if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'PERMISSION_DENIED') {
        setLocationStatus('denied');
      }
    }
  }, []);

  // Fetch venues from Foursquare API
  const fetchVenues = async (location: LocationCoords) => {
    setIsSearching(true);
    
    try {
      const places = await searchPlaces({
        ll: `${location.lat},${location.lng}`,
        radius: maxDistance * 1000, // Convert to meters
        limit: 50,
        sort: 'DISTANCE',
        categories: ALL_FOOD_CATEGORIES,
        query: searchQuery || undefined,
      });

      if (places.length > 0) {
        const transformedVenues = places.map(transformFoursquarePlace);
        
        // Calculate accurate distances
        const venuesWithDistance = transformedVenues.map(venue => ({
          ...venue,
          distance: calculateDistance(
            location.lat,
            location.lng,
            venue.latitude,
            venue.longitude
          ),
        }));

        // Sort by distance
        venuesWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        setVenues(venuesWithDistance);
        setDataSource('api');
        console.log(`Found ${venuesWithDistance.length} venues from Foursquare`);
      } else {
        // No results from API, use demo fallback data
        console.log('No API results, using demo data');
        const demoVenues = getDemoVenues(location);
        setVenues(demoVenues);
        setDataSource('fallback');
        toast.info('Demo mekanlar gösteriliyor (API bağlantısı yok)');
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error);
      // Use demo data on error
      const demoVenues = getDemoVenues(location);
      setVenues(demoVenues);
      setDataSource('fallback');
      toast.error('API bağlantısı başarısız, demo veriler gösteriliyor');
    } finally {
      setIsSearching(false);
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLocationAndVenues();
  }, [fetchLocationAndVenues]);

  // Refetch when distance changes
  useEffect(() => {
    if (userLocation && !isLoading) {
      fetchVenues(userLocation);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxDistance]);

  // Handle search
  const handleSearch = () => {
    if (userLocation) {
      fetchVenues(userLocation);
    }
  };

  // Use fallback Istanbul location
  const useFallbackLocation = async () => {
    const fallbackLocation: LocationCoords = {
      lat: 41.0082,
      lng: 28.9784,
      source: 'fallback',
    };
    setUserLocation(fallbackLocation);
    setLocationStatus('fallback');
    setShowLocationPrompt(false);
    toast.info('İstanbul merkez konumu kullanılıyor');
    await fetchVenues(fallbackLocation);
  };

  // Force GPS location
  const forceGPSLocation = () => {
    fetchLocationAndVenues(true);
  };

  // Filter venues by distance
  const filteredVenues = useMemo(() => {
    return venues.filter(venue => (venue.distance || 0) <= maxDistance);
  }, [venues, maxDistance]);

  // Map venues format
  const mapVenues = useMemo(() => {
    return filteredVenues.map(venue => ({
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
  }, [filteredVenues]);

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
              onClick={() => fetchLocationAndVenues()}
              disabled={isLoading || isSearching}
              className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              title="Konumu Yenile"
            >
              <RefreshCw className={`h-4 w-4 ${(isLoading || isSearching) ? 'animate-spin' : ''}`} />
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
                      Tarayıcı ayarlarından TasteBuddy için konum iznini etkinleştirin.
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
                    onClick={forceGPSLocation}
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

        {/* Location Status Banners */}
        {userLocation && (
          <div className="mb-4 space-y-2">
            {/* IP Location Banner */}
            {locationStatus === 'ip' && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <Wifi className="h-4 w-4" />
                  <span>IP tabanlı konum kullanılıyor (yaklaşık konum)</span>
                </div>
                <button
                  onClick={forceGPSLocation}
                  disabled={isLoading}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium disabled:opacity-50"
                >
                  GPS kullan
                </button>
              </div>
            )}

            {/* Fallback Location Banner */}
            {locationStatus === 'fallback' && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <WifiOff className="h-4 w-4" />
                  <span>Varsayılan konum kullanılıyor (İstanbul Merkez)</span>
                </div>
                <button
                  onClick={forceGPSLocation}
                  disabled={isLoading}
                  className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline font-medium disabled:opacity-50"
                >
                  Gerçek konumumu kullan
                </button>
              </div>
            )}

            {/* GPS Success Banner */}
            {locationStatus === 'granted' && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                  <Navigation className="h-4 w-4" />
                  <span>GPS konumunuz aktif ✓</span>
                  {userLocation.accuracy && (
                    <span className="text-xs opacity-75">
                      (±{Math.round(userLocation.accuracy)}m)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Cached Location Banner */}
            {locationStatus === 'cached' && (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-purple-700 dark:text-purple-300">
                  <Navigation className="h-4 w-4" />
                  <span>Önbellek konumu kullanılıyor ⚡</span>
                </div>
                <button
                  onClick={forceGPSLocation}
                  disabled={isLoading}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline font-medium disabled:opacity-50"
                >
                  Yenile
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search and Filter Bar */}
        {userLocation && !showLocationPrompt && (
          <div className="mb-4 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Mekan ara (ör: kahve, pizza, kebap...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            
            {/* Distance Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Mesafe:</span>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="text-sm border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value={1}>1 km</option>
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
              
              <button
                onClick={handleSearch}
                disabled={isSearching}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ara'}
              </button>
            </div>
          </div>
        )}

        {/* Results Count & Data Source */}
        {!isLoading && userLocation && filteredVenues.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredVenues.length} mekan bulundu ({maxDistance} km içinde)
            </p>
            <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
              {dataSource === 'api' ? '🌐 Foursquare' : '📦 Demo'}
            </span>
          </div>
        )}

        {/* Loading State */}
        {(isLoading || isSearching) && !showLocationPrompt ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">
              {isLoading ? 'Konum alınıyor...' : 'Mekanlar aranıyor...'}
            </p>
          </div>
        ) : !userLocation ? (
          null
        ) : viewMode === 'map' ? (
          <div className="rounded-xl overflow-hidden">
            <VenueMap
              venues={mapVenues}
              center={[userLocation.lat, userLocation.lng]}
              zoom={14}
              userLocation={{ lat: userLocation.lat, lng: userLocation.lng }}
              className="h-[500px]"
            />
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Aramanızla eşleşen mekan bulunamadı' : 'Bu mesafe içinde mekan bulunamadı'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); handleSearch(); }}
                  className="text-primary hover:underline"
                >
                  Aramayı temizle
                </button>
              )}
              <button
                onClick={() => setMaxDistance(50)}
                className="text-primary hover:underline"
              >
                Mesafeyi artır
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVenues.map((venue) => (
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
                      {formatDistance(venue.distance || 0)}
                    </span>
                    <span className="text-muted-foreground">
                      {Array(venue.priceLevel || 2).fill('₺').join('')}
                    </span>
                    {venue.reviewCount > 0 && (
                      <span className="text-muted-foreground">{venue.reviewCount} değerlendirme</span>
                    )}
                    {venue.source === 'foursquare' && (
                      <span className="text-xs text-blue-500">🌐</span>
                    )}
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
