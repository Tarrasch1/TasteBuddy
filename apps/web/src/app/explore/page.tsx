'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Star, Loader2, Map, List, Navigation, User, LogOut, Settings, Bookmark, Bell, X } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useDebounce } from '@/hooks/use-debounce';
import type { MapVenue } from '@/components/venue-map';

// Dynamic import for Map to avoid SSR issues
const VenueMap = dynamic(() => import('@/components/venue-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] md:h-[500px] bg-muted rounded-xl flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
});

interface Venue {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  reviewCount: number;
  priceLevel: number;
  photos: { url: string }[];
  category: { name: string; icon: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

// İstanbul'daki popüler mekanlar (gerçek koordinatlar)
const DEMO_VENUES: Venue[] = [
  {
    id: '1',
    name: 'Nusr-Et Steakhouse',
    slug: 'nusr-et-steakhouse',
    description: 'Ünlü et restoranı',
    address: 'Etiler Mah. Nispetiye Cad. No:87',
    city: 'İstanbul',
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
    description: 'Efsanevi baklava',
    address: 'Rıhtım Cad. Katlı Otopark Altı No:3-4',
    city: 'İstanbul',
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
    description: 'Anadolu mutfağının modern yorumu',
    address: 'The Marmara Pera, Meşrutiyet Cad. No:15',
    city: 'İstanbul',
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
    description: '3. dalga kahve deneyimi',
    address: 'Cihangir Mah. Akarsu Yokuşu Cad. No:3',
    city: 'İstanbul',
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
    description: 'Anadolu yemekleri',
    address: 'Caferağa Mah. Güneşlibahçe Sok. No:43',
    city: 'İstanbul',
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
    description: 'Dünya mutfağından lezzetler',
    address: 'Zorlu Center, Levazım Mah.',
    city: 'İstanbul',
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
    description: 'Boğaz manzaralı fine dining',
    address: 'Yol Sokak No:2, Ulus Parkı',
    city: 'İstanbul',
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
    description: 'Modern Türk meyhane mutfağı',
    address: 'Kemankeş Cad. No:37, Karaköy',
    city: 'İstanbul',
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
    description: 'Fast food zinciri',
    address: 'İstiklal Cad. No:8, Beyoğlu',
    city: 'İstanbul',
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
    description: 'Boğaz manzaralı kahve',
    address: 'Cevdet Paşa Cad. No:34, Bebek',
    city: 'İstanbul',
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
    description: 'Tarihi balık restoranı',
    address: 'Seyit Hasan Kuyu Sok. No:1, Sultanahmet',
    city: 'İstanbul',
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
    description: 'İtalyan usulü pizza',
    address: 'Bağdat Cad. No:456, Kadıköy',
    city: 'İstanbul',
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
    description: 'Asya mutfağı',
    address: 'Kanyon AVM, Levent',
    city: 'İstanbul',
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
    description: 'Healthy food & smoothies',
    address: 'Abdi İpekçi Cad. No:32, Nişantaşı',
    city: 'İstanbul',
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
    description: 'Geleneksel köfte',
    address: 'Hamidiye Cad. No:14, Eminönü',
    city: 'İstanbul',
    latitude: 41.0169,
    longitude: 28.9700,
    averageRating: 4.2,
    reviewCount: 4120,
    priceLevel: 1,
    photos: [],
    category: { name: 'Türk Mutfağı', icon: '🍖' },
  },
];

const DEMO_CATEGORIES: Category[] = [
  { id: '1', name: 'Türk Mutfağı', slug: 'turk-mutfagi', icon: '🍖' },
  { id: '2', name: 'Kafe', slug: 'kafe', icon: '☕' },
  { id: '3', name: 'Fast Food', slug: 'fast-food', icon: '🍔' },
  { id: '4', name: 'Deniz Ürünleri', slug: 'deniz-urunleri', icon: '🐟' },
  { id: '5', name: 'İtalyan Mutfağı', slug: 'italyan-mutfagi', icon: '🍕' },
  { id: '6', name: 'Japon Mutfağı', slug: 'japon-mutfagi', icon: '🍜' },
  { id: '7', name: 'Fine Dining', slug: 'fine-dining', icon: '🍽️' },
  { id: '8', name: 'Tatlıcı', slug: 'tatlici', icon: '🍯' },
  { id: '9', name: 'Meyhane', slug: 'meyhane', icon: '🍻' },
  { id: '10', name: 'Sağlıklı', slug: 'saglikli', icon: '🥗' },
];

export default function ExplorePage() {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated, logout } = useAuthStore();
  const [venues, setVenues] = useState<Venue[]>(DEMO_VENUES); // Start with venues loaded
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Debounce search query for better performance (150ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 150);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Could not get location:', error);
          // Default to Istanbul center
          setUserLocation({ lat: 41.0082, lng: 28.9784 });
        }
      );
    }
  };

  const filteredVenues = useMemo(() => {
    let result = [...venues];
    
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        result = result.filter(v => v.category.name === category.name);
      }
    }
    
    // Use debounced search query for filtering
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.address.toLowerCase().includes(query) ||
        v.category.name.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [venues, selectedCategory, debouncedSearchQuery, categories]);

  const mapVenues: MapVenue[] = useMemo(() => {
    return filteredVenues.map(v => ({
      id: v.id,
      name: v.name,
      slug: v.slug,
      address: v.address,
      latitude: v.latitude,
      longitude: v.longitude,
      averageRating: v.averageRating,
      reviewCount: v.reviewCount,
      priceLevel: v.priceLevel,
      category: v.category,
      photos: v.photos,
    }));
  }, [filteredVenues]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleVenueClick = (venue: MapVenue) => {
    const fullVenue = venues.find(v => v.id === venue.id);
    if (fullVenue) {
      setSelectedVenue(fullVenue);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="h-16 flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-primary shrink-0">
              TasteBuddy
            </Link>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mekan, kategori veya adres ara..."
                className="w-full pl-10 pr-10 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </form>
            
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background text-muted-foreground hover:bg-muted'
                }`}
                title="Liste Görünümü"
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 transition-colors ${
                  viewMode === 'map' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-background text-muted-foreground hover:bg-muted'
                }`}
                title="Harita Görünümü"
              >
                <Map className="h-5 w-5" />
              </button>
            </div>
            
            <Link href="/nearby" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">Yakınımda</span>
            </Link>
            
            {/* Auth Section */}
            {!hasHydrated ? (
              <div className="w-20 h-8 bg-muted animate-pulse rounded-lg" />
            ) : isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                    {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-medium max-w-[80px] truncate">
                    {user.displayName || user.username}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-background border rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="font-medium truncate">{user.displayName || user.username}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    
                    <Link
                      href="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                    >
                      <User className="h-4 w-4" />
                      <span>Profilim</span>
                    </Link>
                    
                    <Link
                      href="/dashboard/saved"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                    >
                      <Bookmark className="h-4 w-4" />
                      <span>Kaydedilenler</span>
                    </Link>
                    
                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                    >
                      <Bell className="h-4 w-4" />
                      <span>Bildirimler</span>
                    </Link>
                    
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Ayarlar</span>
                    </Link>
                    
                    <div className="border-t mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 w-full hover:bg-muted transition-colors text-red-600"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Çıkış Yap</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground">
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              !selectedCategory
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors flex items-center gap-2 ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredVenues.length} mekan bulundu
            {searchQuery && searchQuery !== debouncedSearchQuery && (
              <span className="ml-2 text-primary">aranıyor...</span>
            )}
            {debouncedSearchQuery && (
              <span className="ml-1">(&quot;{debouncedSearchQuery}&quot; için)</span>
            )}
          </p>
          {userLocation && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Konum alındı
            </p>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : viewMode === 'map' ? (
          <div className="space-y-4">
            <VenueMap
              venues={mapVenues}
              userLocation={userLocation}
              onVenueClick={handleVenueClick}
              className="h-[500px] md:h-[600px]"
            />
            
            {selectedVenue && (
              <div className="md:hidden bg-card border rounded-xl p-4 shadow-lg">
                <VenueCard venue={selectedVenue} />
              </div>
            )}
            
            <div className="hidden md:block">
              <h3 className="font-semibold mb-4">Haritadaki Mekanlar</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVenues.slice(0, 6).map((venue) => (
                  <VenueCardCompact key={venue.id} venue={venue} />
                ))}
              </div>
            </div>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Mekan bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function VenueCard({ venue }: { venue: Venue }) {
  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="group block bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="relative h-48 bg-muted">
        {venue.photos?.[0] ? (
          <Image
            src={venue.photos[0].url}
            alt={venue.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-muted to-muted/50">
            {venue.category.icon}
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          {venue.averageRating.toFixed(1)}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {venue.name}
          </h3>
          <span className="text-sm text-muted-foreground shrink-0">
            {Array(venue.priceLevel).fill('₺').join('')}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
          <span>{venue.category.icon}</span>
          {venue.category.name}
        </p>
        
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {venue.address}
        </p>
        
        <p className="text-xs text-muted-foreground mt-2">
          {venue.reviewCount} değerlendirme
        </p>
      </div>
    </Link>
  );
}

function VenueCardCompact({ venue }: { venue: Venue }) {
  return (
    <Link
      href={`/venues/${venue.slug}`}
      className="flex gap-3 p-3 bg-card border rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl shrink-0">
        {venue.category.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{venue.name}</h4>
        <p className="text-xs text-muted-foreground">{venue.category.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-1 text-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {venue.averageRating.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            {Array(venue.priceLevel).fill('₺').join('')}
          </span>
        </div>
      </div>
    </Link>
  );
}
