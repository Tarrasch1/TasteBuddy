'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Utensils, MapPin, Star, Heart, Settings, LogOut, User,
  Loader2, Award, Calendar, Edit2, Share2, ChevronRight,
  Filter, Camera, MessageCircle, TrendingUp, Map, Home, Compass, Trophy, BookOpen
} from 'lucide-react';
import { AppTopNav, AppBottomNav } from '@/components/app-nav';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import {
  BADGES, DEMO_USER_BADGES, DEMO_BADGE_PROGRESS,
  getBadgeById, getTierBgColor, getTierBorderColor, getTierColor,
  getCategoryName, getCategoryIcon, calculateTotalPoints, getUserLevel,
  type Badge, type UserBadge, type BadgeCategory
} from '@/lib/badges';

// Dynamic import for Map to avoid SSR issues
const ProfileMap = dynamic(() => import('@/components/profile-map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-muted rounded-xl flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  ),
});

// Demo user stats
const DEMO_USER_STATS = {
  reviewCount: 47,
  venueCount: 35,
  friendCount: 28,
  followerCount: 42,
  savedCount: 15,
  likeCount: 156,
  joinDate: '2024-01-15',
};

// Demo reviews for profile with coordinates
const DEMO_USER_REVIEWS = [
  {
    id: '1',
    type: 'venue',
    venueName: 'Karadeniz Pide Salonu',
    venueSlug: 'karadeniz-pide-salonu',
    itemName: null,
    rating: 5,
    comment: 'En iyi pide burada! Kuşbaşılı kaşarlı pide muhteşem. Hamuru ince ve çıtır, malzemeler taze.',
    category: 'pide',
    photoUrl: '/demo/pide.jpg',
    createdAt: '2024-04-10T14:30:00Z',
    likes: 24,
    comments: 5,
    latitude: 41.0082,
    longitude: 28.9784,
  },
  {
    id: '2',
    type: 'item',
    venueName: 'Tadım Lahmacun',
    venueSlug: 'tadim-lahmacun',
    itemName: 'Lahmacun',
    rating: 4,
    comment: 'Çok lezzetli ve ince hamurlu. Acısı tam kıvamında.',
    category: 'lahmacun',
    photoUrl: null,
    createdAt: '2024-04-08T19:15:00Z',
    likes: 12,
    comments: 2,
    latitude: 41.0370,
    longitude: 28.9850,
  },
  {
    id: '3',
    type: 'venue',
    venueName: 'Mandabatmaz',
    venueSlug: 'mandabatmaz',
    itemName: null,
    rating: 5,
    comment: 'İstanbul\'un en iyi Türk kahvesi. Köpük kıvamı mükemmel!',
    category: 'cafe',
    photoUrl: '/demo/coffee.jpg',
    createdAt: '2024-04-05T10:00:00Z',
    likes: 45,
    comments: 8,
    latitude: 41.0316,
    longitude: 28.9747,
  },
  {
    id: '4',
    type: 'item',
    venueName: 'Baylan Pastanesi',
    venueSlug: 'baylan-pastanesi',
    itemName: 'Kup Griye',
    rating: 5,
    comment: 'Efsanevi tatlı! Mutlaka denenmeli.',
    category: 'dessert',
    photoUrl: '/demo/dessert.jpg',
    createdAt: '2024-04-02T16:45:00Z',
    likes: 38,
    comments: 6,
    latitude: 40.9903,
    longitude: 29.0293,
  },
  {
    id: '5',
    type: 'venue',
    venueName: 'Sultanahmet Köftecisi',
    venueSlug: 'sultanahmet-koftecisi',
    itemName: null,
    rating: 4,
    comment: 'Klasik köfte, piyaz, ekmek üçlüsü. Kuyruk olsa da beklemeye değer.',
    category: 'kebab',
    photoUrl: null,
    createdAt: '2024-03-28T13:00:00Z',
    likes: 18,
    comments: 3,
    latitude: 41.0054,
    longitude: 28.9768,
  },
  {
    id: '6',
    type: 'venue',
    venueName: 'Karaköy Güllüoğlu',
    venueSlug: 'karakoy-gulluoglu',
    itemName: null,
    rating: 5,
    comment: 'Baklava için en iyi adres! Fıstıklı baklava efsane.',
    category: 'dessert',
    photoUrl: null,
    createdAt: '2024-03-20T15:30:00Z',
    likes: 56,
    comments: 12,
    latitude: 41.0226,
    longitude: 28.9774,
  },
  {
    id: '7',
    type: 'venue',
    venueName: 'Burger King Taksim',
    venueSlug: 'burger-king-taksim',
    itemName: null,
    rating: 2,
    comment: 'Çok kalabalıktı, sipariş geç geldi. Normal fast food.',
    category: 'fast-food',
    photoUrl: null,
    createdAt: '2024-03-15T20:00:00Z',
    likes: 3,
    comments: 1,
    latitude: 41.0370,
    longitude: 28.9850,
  },
  {
    id: '8',
    type: 'venue',
    venueName: 'Çiya Sofrası',
    venueSlug: 'ciya-sofrasi',
    itemName: null,
    rating: 5,
    comment: 'Anadolu mutfağının en iyisi! Her şey taze ve lezzetli.',
    category: 'turkish',
    photoUrl: null,
    createdAt: '2024-03-10T13:00:00Z',
    likes: 72,
    comments: 15,
    latitude: 40.9903,
    longitude: 29.0293,
  },
  {
    id: '9',
    type: 'venue',
    venueName: 'Orta Dünya Kahve',
    venueSlug: 'orta-dunya-kahve',
    itemName: null,
    rating: 3,
    comment: 'Kahve fena değil ama fiyatlar biraz yüksek.',
    category: 'cafe',
    photoUrl: null,
    createdAt: '2024-03-05T11:00:00Z',
    likes: 8,
    comments: 2,
    latitude: 41.0478,
    longitude: 29.0095,
  },
];

type ReviewFilter = 'all' | '5' | '4' | '3' | '2' | '1';
type CategoryFilter = 'all' | string;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reviews' | 'badges' | 'saved' | 'map'>('reviews');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showBadgeModal, setShowBadgeModal] = useState<Badge | null>(null);
  const [userReviews, setUserReviews] = useState(DEMO_USER_REVIEWS);

  // Calculate user badges and level
  const earnedBadges = DEMO_USER_BADGES;
  const totalPoints = calculateTotalPoints(earnedBadges);
  const userLevel = getUserLevel(totalPoints);
  const progressPercent = Math.min(
    ((totalPoints / userLevel.nextLevelPoints) * 100),
    100
  );

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Load user reviews from localStorage
    const loadUserReviews = () => {
      const userReviewsKey = 'tastebuddy_user_reviews';
      const savedReviews = localStorage.getItem(userReviewsKey);
      
      if (savedReviews) {
        const parsedReviews = JSON.parse(savedReviews);
        // Transform localStorage reviews to profile format
        const transformedReviews = parsedReviews.map((review: any) => ({
          id: review.id,
          type: review.type || 'venue',
          venueName: review.venueName,
          venueSlug: review.venueSlug,
          itemName: review.itemName,
          rating: review.rating,
          comment: review.comment,
          category: review.venueCategory?.name?.toLowerCase() || 'other',
          photoUrl: review.photos?.[0] || null,
          photos: review.photos || [],
          createdAt: review.createdAt,
          likes: 0,
          comments: 0,
          latitude: 41.0082, // Default Istanbul coords
          longitude: 28.9784,
        }));
        
        // Merge with demo reviews, user reviews first
        setUserReviews([...transformedReviews, ...DEMO_USER_REVIEWS]);
      }
    };
    
    loadUserReviews();

    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, [isAuthenticated, hasHydrated, router]);

  const handleLogout = () => {
    logout();
    toast.success('Başarıyla çıkış yapıldı');
    router.push('/');
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Profil linki kopyalandı!');
  };

  // Filter reviews
  const filteredReviews = userReviews.filter(review => {
    if (reviewFilter !== 'all' && review.rating !== parseInt(reviewFilter)) {
      return false;
    }
    if (categoryFilter !== 'all' && review.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  // Get unique categories from reviews
  const reviewCategories = [...new Set(userReviews.map(r => r.category))];

  // Group badges by category
  const badgesByCategory = earnedBadges.reduce((acc, ub) => {
    const badge = getBadgeById(ub.badgeId);
    if (badge) {
      if (!acc[badge.category]) {
        acc[badge.category] = [];
      }
      acc[badge.category].push({ ...badge, earnedAt: ub.earnedAt });
    }
    return acc;
  }, {} as Record<string, (Badge & { earnedAt: string })[]>);

  if (!hasHydrated || !isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppTopNav />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-card border rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto md:mx-0">
                <span className="text-4xl md:text-5xl font-bold text-white">
                  {user?.displayName?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <button className="absolute bottom-0 right-0 md:right-auto md:bottom-0 md:left-24 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{user?.displayName}</h1>
                <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-medium rounded-full">
                  Seviye {userLevel.level} • {userLevel.title}
                </span>
              </div>
              <p className="text-muted-foreground mb-1">@{user?.username || 'kullanici'}</p>
              <p className="text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(DEMO_USER_STATS.joinDate).toLocaleDateString('tr-TR', {
                  month: 'long',
                  year: 'numeric'
                })} tarihinden beri üye
              </p>

              {/* Level Progress */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>{totalPoints} puan</span>
                  <span className="text-muted-foreground">{userLevel.nextLevelPoints} puana kadar</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{userReviews.length}</p>
                  <p className="text-xs text-muted-foreground">Değerlendirme</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{new Set(userReviews.map(r => r.venueSlug)).size}</p>
                  <p className="text-xs text-muted-foreground">Mekan</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{earnedBadges.length}</p>
                  <p className="text-xs text-muted-foreground">Rozet</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{DEMO_USER_STATS.followerCount}</p>
                  <p className="text-xs text-muted-foreground">Takipçi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="flex justify-center md:justify-start mt-6">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
              <Edit2 className="h-4 w-4" />
              Profili Düzenle
            </button>
          </div>
        </div>

        {/* Badge Showcase - Featured Badges */}
        <div className="bg-card border rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Öne Çıkan Rozetler
            </h2>
            <button
              onClick={() => setActiveTab('badges')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Tümünü Gör
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {earnedBadges.slice(0, 6).map((ub) => {
              const badge = getBadgeById(ub.badgeId);
              if (!badge) return null;
              return (
                <button
                  key={badge.id}
                  onClick={() => setShowBadgeModal(badge)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl ${getTierBgColor(badge.tier)} ${getTierBorderColor(badge.tier)} border-2 flex items-center justify-center text-2xl hover:scale-110 transition-transform`}
                  title={badge.name}
                >
                  {badge.icon}
                </button>
              );
            })}
            {earnedBadges.length > 6 && (
              <button
                onClick={() => setActiveTab('badges')}
                className="flex-shrink-0 w-16 h-16 rounded-xl bg-muted border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                +{earnedBadges.length - 6}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Değerlendirmeler
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'map'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center justify-center gap-1">
              <Map className="h-4 w-4" />
              Harita
            </span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'badges'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Rozetler ({earnedBadges.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'saved'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Kaydedilenler
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'reviews' && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Filtrele:</span>
              </div>
              <select
                value={reviewFilter}
                onChange={(e) => setReviewFilter(e.target.value as ReviewFilter)}
                className="text-sm border rounded-lg px-3 py-1.5 bg-background"
              >
                <option value="all">Tüm Puanlar</option>
                <option value="5">5 Yıldız</option>
                <option value="4">4 Yıldız</option>
                <option value="3">3 Yıldız</option>
                <option value="2">2 Yıldız</option>
                <option value="1">1 Yıldız</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-sm border rounded-lg px-3 py-1.5 bg-background"
              >
                <option value="all">Tüm Kategoriler</option>
                {reviewCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 bg-card border rounded-xl">
                  <p className="text-muted-foreground">Bu filtreye uygun değerlendirme bulunamadı.</p>
                </div>
              ) : (
                filteredReviews.map((review) => (
                  <div key={review.id} className="bg-card border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{review.venueName}</h3>
                        {review.itemName && (
                          <p className="text-sm text-muted-foreground">{review.itemName}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm mb-3">{review.comment}</p>
                    {review.photoUrl && (
                      <div className="mb-3">
                        <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {review.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {review.comments}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-6">
            {/* Badge Progress */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Yaklaşan Rozetler
              </h3>
              <div className="space-y-3">
                {DEMO_BADGE_PROGRESS.slice(0, 3).map((progress) => {
                  const badge = getBadgeById(progress.badgeId);
                  if (!badge) return null;
                  return (
                    <div key={badge.id} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getTierBgColor(badge.tier)} flex items-center justify-center text-lg`}>
                        {badge.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{badge.name}</span>
                          <span className="text-muted-foreground">%{progress.progress}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${getTierColor(badge.tier)} transition-all duration-500`}
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Earned Badges by Category */}
            {Object.entries(badgesByCategory).map(([category, badges]) => (
              <div key={category} className="bg-card border rounded-xl p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span>{getCategoryIcon(category as BadgeCategory)}</span>
                  {getCategoryName(category as BadgeCategory)} Rozetleri
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {badges.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => setShowBadgeModal(badge)}
                      className={`aspect-square rounded-xl ${getTierBgColor(badge.tier)} ${getTierBorderColor(badge.tier)} border-2 flex flex-col items-center justify-center p-2 hover:scale-105 transition-transform`}
                    >
                      <span className="text-2xl mb-1">{badge.icon}</span>
                      <span className="text-xs font-medium text-center line-clamp-2">{badge.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* All Badges Preview */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-4">Tüm Rozetler ({BADGES.length})</h3>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {BADGES.map((badge) => {
                  const isEarned = earnedBadges.some(ub => ub.badgeId === badge.id);
                  return (
                    <button
                      key={badge.id}
                      onClick={() => setShowBadgeModal(badge)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xl ${
                        isEarned
                          ? `${getTierBgColor(badge.tier)} ${getTierBorderColor(badge.tier)} border`
                          : 'bg-muted/50 opacity-50 grayscale'
                      } hover:scale-110 transition-transform`}
                      title={badge.name}
                    >
                      {badge.icon}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            {/* Map Legend */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Değerlendirme Haritası
              </h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Yüksek Puan (4-5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>Orta Puan (3-3.9)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Düşük Puan (1-2.9)</span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border">
              <ProfileMap reviews={userReviews} />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-green-500">
                  {userReviews.filter(r => r.rating >= 4).length}
                </p>
                <p className="text-sm text-muted-foreground">Yüksek Puan</p>
              </div>
              <div className="bg-card border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-yellow-500">
                  {userReviews.filter(r => r.rating >= 3 && r.rating < 4).length}
                </p>
                <p className="text-sm text-muted-foreground">Orta Puan</p>
              </div>
              <div className="bg-card border rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-red-500">
                  {userReviews.filter(r => r.rating < 3).length}
                </p>
                <p className="text-sm text-muted-foreground">Düşük Puan</p>
              </div>
            </div>

            {/* Location List */}
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-3">Ziyaret Edilen Mekanlar</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userReviews.map((review) => (
                  <Link
                    key={review.id}
                    href={`/venues/${review.venueSlug}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        review.rating >= 4 ? 'bg-green-500' :
                        review.rating >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-sm">{review.venueName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className={`h-4 w-4 ${
                        review.rating >= 4 ? 'fill-green-500 text-green-500' :
                        review.rating >= 3 ? 'fill-yellow-500 text-yellow-500' : 'fill-red-500 text-red-500'
                      }`} />
                      <span className="text-sm font-medium">{review.rating}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="text-center py-12 bg-card border rounded-xl">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Kaydedilen Mekanlar</h3>
            <p className="text-muted-foreground mb-4">
              Kaydettiğin mekanlar burada görünecek.
            </p>
            <Link
              href="/explore"
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Keşfetmeye Başla
            </Link>
          </div>
        )}
      </main>

      {/* Badge Modal */}
      {showBadgeModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBadgeModal(null)}
        >
          <div
            className="bg-card rounded-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-20 h-20 rounded-xl ${getTierBgColor(showBadgeModal.tier)} ${getTierBorderColor(showBadgeModal.tier)} border-2 flex items-center justify-center text-4xl mx-auto mb-4`}>
              {showBadgeModal.icon}
            </div>
            <h3 className="text-xl font-bold text-center mb-1">{showBadgeModal.name}</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {showBadgeModal.description}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(showBadgeModal.tier)} text-white font-medium capitalize`}>
                {showBadgeModal.tier}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {showBadgeModal.points} puan
              </span>
            </div>
            {earnedBadges.find(ub => ub.badgeId === showBadgeModal.id) && (
              <p className="text-center text-sm text-green-600 mt-4 flex items-center justify-center gap-1">
                <Award className="h-4 w-4" />
                Bu rozeti kazandın!
              </p>
            )}
            <button
              onClick={() => setShowBadgeModal(null)}
              className="w-full mt-6 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      <AppBottomNav />
    </div>
  );
}
