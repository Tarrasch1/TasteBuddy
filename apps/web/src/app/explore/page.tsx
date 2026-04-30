'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Star, Loader2, Map, List, Navigation, User, LogOut, Settings, Bookmark, Bell, X, TrendingUp, ChevronRight, Flame, Sparkles, Heart, ThumbsUp } from 'lucide-react';
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

// İstanbul ilçeleri
const DISTRICTS = [
  { id: 'all', name: 'Tüm İlçeler' },
  { id: 'besiktas', name: 'Beşiktaş' },
  { id: 'kadikoy', name: 'Kadıköy' },
  { id: 'beyoglu', name: 'Beyoğlu' },
  { id: 'sisli', name: 'Şişli' },
  { id: 'uskudar', name: 'Üsküdar' },
  { id: 'fatih', name: 'Fatih' },
  { id: 'sariyer', name: 'Sarıyer' },
  { id: 'bakirkoy', name: 'Bakırköy' },
];

// Haftanın Popüler Lezzetleri
const WEEKLY_POPULAR = [
  {
    id: 'wp1',
    type: 'item' as const,
    name: 'Kuşbaşılı Kaşarlı Pide',
    venueName: 'Karadeniz Pide Salonu',
    venueSlug: 'karadeniz-pide-salonu',
    rating: 4.9,
    reviewCount: 234,
    icon: '🥟',
    trend: '+15%',
  },
  {
    id: 'wp2',
    type: 'item' as const,
    name: 'Künefe',
    venueName: 'İmam Çağdaş',
    venueSlug: 'imam-cagdas',
    rating: 4.8,
    reviewCount: 189,
    icon: '🍯',
    trend: '+22%',
  },
  {
    id: 'wp3',
    type: 'venue' as const,
    name: 'Çiya Sofrası',
    venueName: 'Çiya Sofrası',
    venueSlug: 'ciya-sofrasi',
    rating: 4.7,
    reviewCount: 312,
    icon: '🍲',
    trend: '+8%',
  },
  {
    id: 'wp4',
    type: 'item' as const,
    name: 'Double Cheeseburger',
    venueName: 'Şef\'s Burger',
    venueSlug: 'sefs-burger',
    rating: 4.6,
    reviewCount: 156,
    icon: '🍔',
    trend: '+12%',
  },
  {
    id: 'wp5',
    type: 'item' as const,
    name: 'Filtre Kahve',
    venueName: 'Kronotrop',
    venueSlug: 'kronotrop-coffee',
    rating: 4.8,
    reviewCount: 278,
    icon: '☕',
    trend: '+5%',
  },
];

// Kullanıcının geçmiş değerlendirmelerine dayalı tercihler (Demo)
const USER_PREFERENCES = {
  favoriteCategories: ['Türk Mutfağı', 'Kafe', 'Tatlıcı'], // En çok değerlendirilen kategoriler
  avgRating: 4.2, // Ortalama verilen puan
  pricePreference: [2, 3], // Tercih edilen fiyat aralığı
  frequentAreas: ['Beyoğlu', 'Kadıköy', 'Beşiktaş'], // Sık gittiği bölgeler
  recentHighRatings: ['pide', 'kebab', 'kahve', 'baklava'], // Yüksek puan verdiği yemekler
};

// Sana Uygun Öneriler (kullanıcı tercihlerine dayalı)
const FOR_YOU_RECOMMENDATIONS = [
  {
    id: 'fy1',
    type: 'venue' as const,
    name: 'Karadeniz Pide Salonu',
    slug: 'karadeniz-pide-salonu',
    description: 'Pide sevgini biliyoruz! Bu mekân tam sana göre.',
    reason: 'Pide kategorisinde yüksek puanlar verdin',
    rating: 4.9,
    reviewCount: 456,
    priceLevel: 2,
    category: { name: 'Türk Mutfağı', icon: '🥟' },
    matchScore: 98,
    photo: null,
  },
  {
    id: 'fy2',
    type: 'item' as const,
    name: 'Türk Kahvesi',
    venueName: 'Mandabatmaz',
    slug: 'mandabatmaz',
    description: 'Kahve tutkunları buraya! Köpüğüyle ünlü.',
    reason: 'Kafe kategorisini çok seviyorsun',
    rating: 4.8,
    reviewCount: 892,
    priceLevel: 1,
    category: { name: 'Kafe', icon: '☕' },
    matchScore: 95,
    photo: null,
  },
  {
    id: 'fy3',
    type: 'item' as const,
    name: 'Burma Kadayıf',
    venueName: 'Karaköy Güllüoğlu',
    slug: 'karakoy-gulluoglu',
    description: 'Tatlı severlere özel! Efsane lezzet.',
    reason: 'Tatlı kategorisinde 5 yıldız vermiştin',
    rating: 4.9,
    reviewCount: 2341,
    priceLevel: 2,
    category: { name: 'Tatlıcı', icon: '🍯' },
    matchScore: 94,
    photo: null,
  },
  {
    id: 'fy4',
    type: 'venue' as const,
    name: 'Çiya Sofrası',
    slug: 'ciya-sofrasi',
    description: 'Anadolu lezzetleri senin için!',
    reason: 'Türk Mutfağı favorin olmuş',
    rating: 4.7,
    reviewCount: 3210,
    priceLevel: 2,
    category: { name: 'Türk Mutfağı', icon: '🍲' },
    matchScore: 92,
    photo: null,
  },
  {
    id: 'fy5',
    type: 'item' as const,
    name: 'V60 Filtre Kahve',
    venueName: 'Kronotrop Coffee',
    slug: 'kronotrop-coffee',
    description: 'Filtre kahve keyfi burada bambaşka!',
    reason: 'Kronotrop\'a benzer mekânları beğendin',
    rating: 4.6,
    reviewCount: 1820,
    priceLevel: 2,
    category: { name: 'Kafe', icon: '☕' },
    matchScore: 90,
    photo: null,
  },
  {
    id: 'fy6',
    type: 'venue' as const,
    name: 'Köfteci Yusuf',
    slug: 'kofteci-yusuf-eminonu',
    description: 'Klasik köfte severlere! Hızlı ve lezzetli.',
    reason: 'Kebap & köfte değerlendirmelerin yüksek',
    rating: 4.2,
    reviewCount: 4120,
    priceLevel: 1,
    category: { name: 'Türk Mutfağı', icon: '🍖' },
    matchScore: 88,
    photo: null,
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated, logout } = useAuthStore();
  const [venues, setVenues] = useState<Venue[]>(DEMO_VENUES); // Start with venues loaded
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showWeeklyPopular, setShowWeeklyPopular] = useState(true);
  const [showForYou, setShowForYou] = useState(true);
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

    // Filter by district (basic address matching for demo)
    if (selectedDistrict && selectedDistrict !== 'all') {
      const districtName = DISTRICTS.find(d => d.id === selectedDistrict)?.name.toLowerCase();
      if (districtName) {
        result = result.filter(v => 
          v.address.toLowerCase().includes(districtName) ||
          // Map some locations to districts for demo
          (selectedDistrict === 'besiktas' && (v.address.includes('Etiler') || v.address.includes('Bebek') || v.address.includes('Ulus'))) ||
          (selectedDistrict === 'kadikoy' && (v.address.includes('Kadıköy') || v.address.includes('Caferağa') || v.address.includes('Bağdat'))) ||
          (selectedDistrict === 'beyoglu' && (v.address.includes('Beyoğlu') || v.address.includes('İstiklal') || v.address.includes('Cihangir') || v.address.includes('Karaköy') || v.address.includes('Pera'))) ||
          (selectedDistrict === 'sisli' && (v.address.includes('Nişantaşı') || v.address.includes('Şişli') || v.address.includes('Levent') || v.address.includes('Kanyon'))) ||
          (selectedDistrict === 'fatih' && v.address.includes('Sultanahmet'))
        );
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
  }, [venues, selectedCategory, selectedDistrict, debouncedSearchQuery, categories]);

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

        {/* District Filter */}
        <div className="flex items-center gap-2 mb-6">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">İlçe:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 bg-background"
          >
            {DISTRICTS.map((district) => (
              <option key={district.id} value={district.id}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* For You - Personalized Recommendations */}
        {isAuthenticated && showForYou && !searchQuery && !selectedCategory && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Sana Uygun
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Değerlendirmelerine göre özel öneriler
                </p>
              </div>
              <button
                onClick={() => setShowForYou(false)}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                Gizle
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {/* User taste summary */}
            <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ThumbsUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-purple-900">Senin Damak Profili</p>
                  <p className="text-sm text-purple-700">47 değerlendirme, 35 farklı mekan</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {USER_PREFERENCES.favoriteCategories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium bg-white/80 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200 flex items-center gap-1"
                  >
                    <Heart className="h-3 w-3 fill-purple-400 text-purple-400" />
                    {cat}
                  </span>
                ))}
                <span className="text-xs font-medium bg-white/80 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200">
                  Ort. {USER_PREFERENCES.avgRating}★
                </span>
              </div>
            </div>

            {/* Recommendation cards */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {FOR_YOU_RECOMMENDATIONS.map((item) => (
                <Link
                  key={item.id}
                  href={`/venues/${item.slug}`}
                  className="flex-shrink-0 w-72 bg-gradient-to-br from-purple-50 via-white to-pink-50 border border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{item.category.icon}</span>
                    <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      %{item.matchScore} uyum
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  {'venueName' in item && item.venueName && (
                    <p className="text-sm text-muted-foreground">{item.venueName}</p>
                  )}
                  <p className="text-sm text-purple-700 mt-2 line-clamp-2 italic">
                    &quot;{item.description}&quot;
                  </p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {item.reason}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-100">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{item.rating}</span>
                      <span className="text-muted-foreground text-sm">({item.reviewCount})</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {'₺'.repeat(item.priceLevel)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Popular Section */}
        {showWeeklyPopular && !searchQuery && !selectedCategory && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Haftanın Popüler Lezzetleri
              </h2>
              <button
                onClick={() => setShowWeeklyPopular(false)}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                Gizle
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {WEEKLY_POPULAR.map((item) => (
                <Link
                  key={item.id}
                  href={`/venues/${item.venueSlug}`}
                  className="flex-shrink-0 w-56 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {item.trend}
                    </span>
                  </div>
                  <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">{item.venueName}</p>
                  <div className="flex items-center gap-2 mt-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{item.rating}</span>
                    </div>
                    <span className="text-muted-foreground">({item.reviewCount})</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

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
