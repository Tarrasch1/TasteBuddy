'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Utensils, Star, MapPin, Heart, Sparkles, ChevronRight,
  Home, Compass, Trophy, User, ThumbsUp, ThumbsDown,
  RefreshCw, Loader2, BookOpen
} from 'lucide-react';
import { AppTopNav, AppBottomNav } from '@/components/app-nav';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

// Öneri kategorileri
type RecommendationCategory = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'coffee' | 'dessert' | 'nightlife';

interface RecommendedVenue {
  id: string;
  name: string;
  slug: string;
  category: { name: string; icon: string };
  address: string;
  averageRating: number;
  reviewCount: number;
  priceLevel: number;
  matchScore: number; // 0-100 kullanıcıya uygunluk skoru
  matchReason: string;
  tags: string[];
  distance?: string;
  photos: string[];
}

// Kullanıcı tercihleri
interface UserPreferences {
  favoriteCuisines: string[];
  priceRange: number[];
  dietaryPrefs: string[];
}

const USER_PREFERENCES: UserPreferences = {
  favoriteCuisines: ['Türk Mutfağı', 'Kafe', 'Fine Dining'],
  priceRange: [2, 4],
  dietaryPrefs: [],
};

const RECOMMENDATION_CATEGORIES: { id: RecommendationCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'Tümü', icon: '✨' },
  { id: 'breakfast', label: 'Kahvaltı', icon: '🥐' },
  { id: 'lunch', label: 'Öğle Yemeği', icon: '🍽️' },
  { id: 'dinner', label: 'Akşam Yemeği', icon: '🍷' },
  { id: 'coffee', label: 'Kahve', icon: '☕' },
  { id: 'dessert', label: 'Tatlı', icon: '🍰' },
  { id: 'nightlife', label: 'Gece Hayatı', icon: '🍸' },
];

// Demo öneriler
const RECOMMENDED_VENUES: RecommendedVenue[] = [
  {
    id: 'r1', name: 'Çiya Sofrası', slug: 'ciya-sofrasi',
    category: { name: 'Türk Mutfağı', icon: '🍲' },
    address: 'Kadıköy, İstanbul', averageRating: 4.7, reviewCount: 3210,
    priceLevel: 2, matchScore: 98,
    matchReason: 'Türk Mutfağı sevgine ve değerlendirmelerine göre tam sana göre!',
    tags: ['lunch', 'dinner', 'Anadolu Mutfağı', 'Geleneksel'],
    distance: '1.2 km', photos: [],
  },
  {
    id: 'r2', name: 'Kronotrop Coffee', slug: 'kronotrop-coffee',
    category: { name: 'Kafe', icon: '☕' },
    address: 'Cihangir, İstanbul', averageRating: 4.6, reviewCount: 1820,
    priceLevel: 3, matchScore: 95,
    matchReason: 'Kahve tutkunları için mükemmel! Arkadaşların da tavsiye ediyor.',
    tags: ['coffee', 'Specialty Coffee', '3. Dalga'],
    distance: '800 m', photos: [],
  },
  {
    id: 'r3', name: 'Mikla', slug: 'mikla-restaurant',
    category: { name: 'Fine Dining', icon: '🍽️' },
    address: 'Beyoğlu, İstanbul', averageRating: 4.8, reviewCount: 890,
    priceLevel: 4, matchScore: 92,
    matchReason: 'Fine Dining tercihlerine ve yüksek puanlama eğilimine uygun.',
    tags: ['dinner', 'Fine Dining', 'Boğaz Manzarası'],
    distance: '3.5 km', photos: [],
  },
  {
    id: 'r4', name: 'Karaköy Güllüoğlu', slug: 'karakoy-gulluoglu',
    category: { name: 'Tatlıcı', icon: '🍯' },
    address: 'Karaköy, İstanbul', averageRating: 4.8, reviewCount: 5230,
    priceLevel: 2, matchScore: 90,
    matchReason: 'Tatlı değerlendirmelerinde yüksek puan verin, bu mekana bayılacaksınız!',
    tags: ['dessert', 'Baklava', 'Geleneksel Tatlı'],
    distance: '2.1 km', photos: [],
  },
  {
    id: 'r5', name: 'Gram', slug: 'gram',
    category: { name: 'Brunch', icon: '🥞' },
    address: 'Galata, İstanbul', averageRating: 4.5, reviewCount: 2150,
    priceLevel: 3, matchScore: 88,
    matchReason: 'Sağlıklı beslenme tercihlerin ve brunch sevgin ile uyumlu.',
    tags: ['breakfast', 'Brunch', 'Sağlıklı'],
    distance: '1.8 km', photos: [],
  },
  {
    id: 'r6', name: 'Mandabatmaz', slug: 'mandabatmaz',
    category: { name: 'Kafe', icon: '☕' },
    address: 'Beyoğlu, İstanbul', averageRating: 4.7, reviewCount: 1560,
    priceLevel: 1, matchScore: 87,
    matchReason: 'Türk kahvesi severler için efsane! Benzer zevklere sahip kullanıcıların favorisi.',
    tags: ['coffee', 'Türk Kahvesi', 'Geleneksel'],
    distance: '2.5 km', photos: [],
  },
  {
    id: 'r7', name: 'Sunset Grill & Bar', slug: 'sunset-grill-bar',
    category: { name: 'Fine Dining', icon: '🌅' },
    address: 'Ulus, İstanbul', averageRating: 4.4, reviewCount: 1290,
    priceLevel: 4, matchScore: 85,
    matchReason: 'Akşam yemeği ve manzara sevenler için ideal.',
    tags: ['dinner', 'nightlife', 'Kokteyl', 'Manzara'],
    distance: '5.2 km', photos: [],
  },
  {
    id: 'r8', name: 'Karaköy Lokantası', slug: 'karakoy-lokantasi',
    category: { name: 'Meyhane', icon: '🍻' },
    address: 'Karaköy, İstanbul', averageRating: 4.5, reviewCount: 2870,
    priceLevel: 3, matchScore: 83,
    matchReason: 'Meyhane deneyimi arayanlar için mükemmel bir tercih.',
    tags: ['dinner', 'nightlife', 'Meze', 'Rakı'],
    distance: '2.0 km', photos: [],
  },
  {
    id: 'r9', name: 'Balıkçı Sabahattin', slug: 'balikci-sabahattin',
    category: { name: 'Balık Restoranı', icon: '🐟' },
    address: 'Sultanahmet, İstanbul', averageRating: 4.6, reviewCount: 2340,
    priceLevel: 3, matchScore: 80,
    matchReason: 'Deniz ürünleri meraklıları arasında en yüksek puanlı mekan.',
    tags: ['lunch', 'dinner', 'Balık', 'Deniz Ürünleri'],
    distance: '3.8 km', photos: [],
  },
  {
    id: 'r10', name: 'Espresso Lab', slug: 'espresso-lab',
    category: { name: 'Kafe', icon: '☕' },
    address: 'Nişantaşı, İstanbul', averageRating: 4.5, reviewCount: 980,
    priceLevel: 3, matchScore: 78,
    matchReason: 'Specialty coffee sevenler için harika bir alternatif.',
    tags: ['coffee', 'Specialty Coffee', 'Çalışma Mekanı'],
    distance: '4.1 km', photos: [],
  },
  {
    id: 'r11', name: 'Hayvore', slug: 'hayvore-asmalimescit',
    category: { name: 'Karadeniz Mutfağı', icon: '🧀' },
    address: 'Asmalımescit, İstanbul', averageRating: 4.4, reviewCount: 1890,
    priceLevel: 2, matchScore: 76,
    matchReason: 'Farklı mutfakları keşfetmeyi seven biri olarak denemelisiniz!',
    tags: ['breakfast', 'lunch', 'Karadeniz', 'Kuymak'],
    distance: '2.8 km', photos: [],
  },
  {
    id: 'r12', name: 'Baylan Pastanesi', slug: 'baylan-pastanesi',
    category: { name: 'Pastane', icon: '🎂' },
    address: 'Kadıköy, İstanbul', averageRating: 4.6, reviewCount: 1430,
    priceLevel: 2, matchScore: 74,
    matchReason: 'Kup Griye efsanesi! Tatlı severlerin mutlaka gitmesi gereken yer.',
    tags: ['dessert', 'Pastane', 'Nostalji'],
    distance: '1.5 km', photos: [],
  },
];

// Kategori eşleştirme
const CATEGORY_TAG_MAP: Record<RecommendationCategory, string[]> = {
  all: [],
  breakfast: ['breakfast'],
  lunch: ['lunch'],
  dinner: ['dinner'],
  coffee: ['coffee'],
  dessert: ['dessert'],
  nightlife: ['nightlife'],
};

export default function ExplorePage() {
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<RecommendationCategory>('all');
  const [likedVenues, setLikedVenues] = useState<Set<string>>(new Set());
  const [dislikedVenues, setDislikedVenues] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredVenues = selectedCategory === 'all'
    ? RECOMMENDED_VENUES
    : RECOMMENDED_VENUES.filter(v =>
        v.tags.some(tag => CATEGORY_TAG_MAP[selectedCategory]?.includes(tag))
      );

  // Beğenilmemiş mekanları filtrele
  const visibleVenues = filteredVenues
    .filter(v => !dislikedVenues.has(v.id))
    .sort((a, b) => b.matchScore - a.matchScore);

  const handleLike = (venueId: string) => {
    setLikedVenues(prev => {
      const next = new Set(prev);
      if (next.has(venueId)) {
        next.delete(venueId);
      } else {
        next.add(venueId);
      }
      return next;
    });
    toast.success('Tercihleriniz güncellendi!');
  };

  const handleDislike = (venueId: string) => {
    setDislikedVenues(prev => {
      const next = new Set(prev);
      next.add(venueId);
      return next;
    });
    toast.success('Bu mekan önerilerinizden kaldırıldı');
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDislikedVenues(new Set());
      setIsRefreshing(false);
      toast.success('Öneriler yenilendi!');
    }, 1000);
  };

  const getPriceLabel = (level: number) => '₺'.repeat(level);

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 dark:bg-green-950/30';
    if (score >= 80) return 'text-blue-600 bg-blue-50 dark:bg-blue-950/30';
    if (score >= 70) return 'text-orange-600 bg-orange-50 dark:bg-orange-950/30';
    return 'text-muted-foreground bg-muted';
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <AppTopNav />

      <main className="container mx-auto px-4 py-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Sana Uygun Öneriler</h1>
              <p className="opacity-90 text-sm">Değerlendirmelerine ve tercihlerine göre kişiselleştirilmiş öneriler</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {USER_PREFERENCES.favoriteCuisines.map((cuisine) => (
              <span key={cuisine} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                {cuisine}
              </span>
            ))}
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
              {getPriceLabel(USER_PREFERENCES.priceRange[0])} - {getPriceLabel(USER_PREFERENCES.priceRange[1])}
            </span>
          </div>
        </div>

        {/* Kategori filtreleri */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {RECOMMENDATION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border hover:bg-muted'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Yenile butonu */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {visibleVenues.length} öneri bulundu
          </p>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Yenile
          </button>
        </div>

        {/* Öneri listesi */}
        <div className="space-y-4">
          {isRefreshing ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : visibleVenues.length === 0 ? (
            <div className="text-center py-16 bg-card border rounded-xl">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Bu kategoride öneri bulunamadı</h3>
              <p className="text-muted-foreground mb-4">Farklı bir kategori deneyin veya önerileri yenileyin.</p>
              <button
                onClick={handleRefresh}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Önerileri Yenile
              </button>
            </div>
          ) : (
            visibleVenues.map((venue, index) => (
              <div
                key={venue.id}
                className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Match Score Bar */}
                <div className="h-1 bg-muted">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${venue.matchScore}%` }}
                  />
                </div>

                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Venue Icon */}
                    <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl flex items-center justify-center text-3xl">
                      {venue.category.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/venues/${venue.slug}`}
                          className="font-semibold text-lg hover:text-primary transition-colors truncate"
                        >
                          {venue.name}
                        </Link>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getMatchColor(venue.matchScore)}`}>
                          %{venue.matchScore} uyum
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {venue.address}
                        </span>
                        {venue.distance && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">
                            {venue.distance}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{venue.averageRating}</span>
                          <span className="text-xs text-muted-foreground">({venue.reviewCount.toLocaleString()})</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{venue.category.name}</span>
                        <span className="text-sm text-green-600">{getPriceLabel(venue.priceLevel)}</span>
                      </div>

                      {/* Match Reason */}
                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-sm text-muted-foreground">{venue.matchReason}</p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {venue.tags.filter(t => !CATEGORY_TAG_MAP.all.includes(t) && !['breakfast', 'lunch', 'dinner', 'coffee', 'dessert', 'nightlife'].includes(t)).map((tag) => (
                          <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/venues/${venue.slug}`}
                          className="flex-1 text-center bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Detayları Gör
                        </Link>
                        <button
                          onClick={() => handleLike(venue.id)}
                          className={`p-2 rounded-lg border transition-colors ${
                            likedVenues.has(venue.id)
                              ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-950/30 dark:border-red-800'
                              : 'hover:bg-muted'
                          }`}
                          title="Beğen"
                        >
                          <Heart className={`h-5 w-5 ${likedVenues.has(venue.id) ? 'fill-red-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDislike(venue.id)}
                          className="p-2 rounded-lg border hover:bg-muted transition-colors"
                          title="İlgilenmiyorum"
                        >
                          <ThumbsDown className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tercih güncelleme */}
        <div className="mt-8 bg-card border rounded-xl p-6 text-center">
          <h3 className="font-semibold mb-2">Daha iyi öneriler mi istiyorsun?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Değerlendirme yaptıkça öneriler sana daha uygun hale gelir. Ayrıca tercihlerini güncelleyebilirsin.
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-lg hover:bg-muted/80 transition-colors text-sm"
          >
            Tercihlerimi Güncelle
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
