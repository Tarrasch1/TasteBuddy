// Rozet Sistemi / Badge System
// TasteBuddy Achievement System

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji
  category: BadgeCategory;
  tier: BadgeTier;
  requirement: BadgeRequirement;
  points: number;
}

export type BadgeCategory = 
  | 'reviews'      // Değerlendirme rozetleri
  | 'exploration'  // Keşif rozetleri
  | 'social'       // Sosyal rozetler
  | 'expertise'    // Uzmanlık rozetleri
  | 'special';     // Özel rozetler

export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface BadgeRequirement {
  type: 'count' | 'streak' | 'category' | 'rating' | 'special';
  target: number;
  metric?: string;
}

export interface UserBadge {
  badgeId: string;
  earnedAt: string;
  progress?: number; // 0-100 for in-progress badges
}

// Rozet Tanımları
export const BADGES: Badge[] = [
  // ==================== DEĞERLENDIRME ROZETLERI ====================
  {
    id: 'first-review',
    name: 'İlk Adım',
    description: 'İlk değerlendirmeni yap',
    icon: '🌟',
    category: 'reviews',
    tier: 'bronze',
    requirement: { type: 'count', target: 1, metric: 'reviews' },
    points: 10,
  },
  {
    id: 'reviewer-10',
    name: 'Acemi Eleştirmen',
    description: '10 değerlendirme yap',
    icon: '📝',
    category: 'reviews',
    tier: 'bronze',
    requirement: { type: 'count', target: 10, metric: 'reviews' },
    points: 25,
  },
  {
    id: 'reviewer-50',
    name: 'Deneyimli Eleştirmen',
    description: '50 değerlendirme yap',
    icon: '✍️',
    category: 'reviews',
    tier: 'silver',
    requirement: { type: 'count', target: 50, metric: 'reviews' },
    points: 50,
  },
  {
    id: 'reviewer-100',
    name: 'Uzman Eleştirmen',
    description: '100 değerlendirme yap',
    icon: '🖊️',
    category: 'reviews',
    tier: 'gold',
    requirement: { type: 'count', target: 100, metric: 'reviews' },
    points: 100,
  },
  {
    id: 'reviewer-500',
    name: 'Efsanevi Eleştirmen',
    description: '500 değerlendirme yap',
    icon: '📖',
    category: 'reviews',
    tier: 'platinum',
    requirement: { type: 'count', target: 500, metric: 'reviews' },
    points: 250,
  },
  {
    id: 'reviewer-1000',
    name: 'Eleştirmen Üstadı',
    description: '1000 değerlendirme yap',
    icon: '👑',
    category: 'reviews',
    tier: 'diamond',
    requirement: { type: 'count', target: 1000, metric: 'reviews' },
    points: 500,
  },
  {
    id: 'detailed-reviewer',
    name: 'Detaycı',
    description: '50+ kelime ile 10 değerlendirme yaz',
    icon: '📚',
    category: 'reviews',
    tier: 'silver',
    requirement: { type: 'count', target: 10, metric: 'detailed_reviews' },
    points: 50,
  },
  {
    id: 'photo-lover',
    name: 'Fotoğrafçı',
    description: '25 fotoğraflı değerlendirme yap',
    icon: '📸',
    category: 'reviews',
    tier: 'silver',
    requirement: { type: 'count', target: 25, metric: 'photo_reviews' },
    points: 50,
  },

  // ==================== KEŞİF ROZETLERİ ====================
  {
    id: 'explorer-5',
    name: 'Meraklı',
    description: '5 farklı mekan keşfet',
    icon: '🔍',
    category: 'exploration',
    tier: 'bronze',
    requirement: { type: 'count', target: 5, metric: 'unique_venues' },
    points: 15,
  },
  {
    id: 'explorer-25',
    name: 'Kaşif',
    description: '25 farklı mekan keşfet',
    icon: '🗺️',
    category: 'exploration',
    tier: 'silver',
    requirement: { type: 'count', target: 25, metric: 'unique_venues' },
    points: 40,
  },
  {
    id: 'explorer-100',
    name: 'Gezgin',
    description: '100 farklı mekan keşfet',
    icon: '🌍',
    category: 'exploration',
    tier: 'gold',
    requirement: { type: 'count', target: 100, metric: 'unique_venues' },
    points: 100,
  },
  {
    id: 'neighborhood-master',
    name: 'Mahalle Ustası',
    description: 'Bir mahallede 10+ mekan değerlendir',
    icon: '🏘️',
    category: 'exploration',
    tier: 'silver',
    requirement: { type: 'count', target: 10, metric: 'neighborhood_venues' },
    points: 50,
  },
  {
    id: 'city-master',
    name: 'Şehir Ustası',
    description: '5 farklı ilçede mekan değerlendir',
    icon: '🌆',
    category: 'exploration',
    tier: 'gold',
    requirement: { type: 'count', target: 5, metric: 'unique_districts' },
    points: 75,
  },
  {
    id: 'night-owl',
    name: 'Gece Kuşu',
    description: 'Gece 22:00 - 04:00 arası 10 değerlendirme yap',
    icon: '🦉',
    category: 'exploration',
    tier: 'bronze',
    requirement: { type: 'count', target: 10, metric: 'night_reviews' },
    points: 30,
  },
  {
    id: 'early-bird',
    name: 'Erken Kalkan',
    description: 'Sabah 06:00 - 09:00 arası 10 değerlendirme yap',
    icon: '🐤',
    category: 'exploration',
    tier: 'bronze',
    requirement: { type: 'count', target: 10, metric: 'morning_reviews' },
    points: 30,
  },

  // ==================== SOSYAL ROZETLER ====================
  {
    id: 'social-butterfly',
    name: 'Sosyal Kelebek',
    description: '10 arkadaş edin',
    icon: '🦋',
    category: 'social',
    tier: 'bronze',
    requirement: { type: 'count', target: 10, metric: 'friends' },
    points: 20,
  },
  {
    id: 'influencer',
    name: 'Etkileyici',
    description: '50 takipçi kazan',
    icon: '⭐',
    category: 'social',
    tier: 'silver',
    requirement: { type: 'count', target: 50, metric: 'followers' },
    points: 50,
  },
  {
    id: 'popular',
    name: 'Popüler',
    description: '100 takipçi kazan',
    icon: '🔥',
    category: 'social',
    tier: 'gold',
    requirement: { type: 'count', target: 100, metric: 'followers' },
    points: 100,
  },
  {
    id: 'helpful',
    name: 'Yardımsever',
    description: 'Değerlendirmelerin 50 beğeni alsın',
    icon: '👍',
    category: 'social',
    tier: 'silver',
    requirement: { type: 'count', target: 50, metric: 'likes_received' },
    points: 40,
  },
  {
    id: 'trending',
    name: 'Trend Topic',
    description: 'Bir değerlendirmen 100+ beğeni alsın',
    icon: '📈',
    category: 'social',
    tier: 'gold',
    requirement: { type: 'count', target: 100, metric: 'single_review_likes' },
    points: 75,
  },
  {
    id: 'commenter',
    name: 'Yorumcu',
    description: '25 yorum yap',
    icon: '💬',
    category: 'social',
    tier: 'bronze',
    requirement: { type: 'count', target: 25, metric: 'comments' },
    points: 25,
  },

  // ==================== UZMANLIK ROZETLERİ ====================
  {
    id: 'kebab-master',
    name: 'Kebap Ustası',
    description: '20 kebapçı değerlendir',
    icon: '🥙',
    category: 'expertise',
    tier: 'silver',
    requirement: { type: 'category', target: 20, metric: 'kebab' },
    points: 50,
  },
  {
    id: 'coffee-expert',
    name: 'Kahve Uzmanı',
    description: '20 kafe değerlendir',
    icon: '☕',
    category: 'expertise',
    tier: 'silver',
    requirement: { type: 'category', target: 20, metric: 'cafe' },
    points: 50,
  },
  {
    id: 'dessert-lover',
    name: 'Tatlı Aşığı',
    description: '20 tatlıcı değerlendir',
    icon: '🍰',
    category: 'expertise',
    tier: 'silver',
    requirement: { type: 'category', target: 20, metric: 'dessert' },
    points: 50,
  },
  {
    id: 'pizza-pro',
    name: 'Pizza Profesörü',
    description: '15 pizzacı değerlendir',
    icon: '🍕',
    category: 'expertise',
    tier: 'silver',
    requirement: { type: 'category', target: 15, metric: 'pizza' },
    points: 45,
  },
  {
    id: 'burger-buff',
    name: 'Burger Tutkunu',
    description: '15 burger mekanı değerlendir',
    icon: '🍔',
    category: 'expertise',
    tier: 'silver',
    requirement: { type: 'category', target: 15, metric: 'burger' },
    points: 45,
  },
  {
    id: 'seafood-savant',
    name: 'Deniz Ürünleri Uzmanı',
    description: '15 balık restoranı değerlendir',
    icon: '🐟',
    category: 'expertise',
    tier: 'silver',
    requirement: { type: 'category', target: 15, metric: 'seafood' },
    points: 45,
  },
  {
    id: 'fine-dining',
    name: 'Gurme',
    description: '10 fine dining restoran değerlendir',
    icon: '🍷',
    category: 'expertise',
    tier: 'gold',
    requirement: { type: 'category', target: 10, metric: 'fine_dining' },
    points: 75,
  },
  {
    id: 'street-food-fan',
    name: 'Sokak Lezzetleri Fanı',
    description: '30 sokak yemeği mekanı değerlendir',
    icon: '🌮',
    category: 'expertise',
    tier: 'gold',
    requirement: { type: 'category', target: 30, metric: 'street_food' },
    points: 75,
  },

  // ==================== ÖZEL ROZETLER ====================
  {
    id: 'streak-7',
    name: 'Haftalık Seri',
    description: '7 gün üst üste değerlendirme yap',
    icon: '🔥',
    category: 'special',
    tier: 'silver',
    requirement: { type: 'streak', target: 7, metric: 'daily_reviews' },
    points: 50,
  },
  {
    id: 'streak-30',
    name: 'Aylık Seri',
    description: '30 gün üst üste değerlendirme yap',
    icon: '💎',
    category: 'special',
    tier: 'gold',
    requirement: { type: 'streak', target: 30, metric: 'daily_reviews' },
    points: 150,
  },
  {
    id: 'perfectionist',
    name: 'Mükemmeliyetçi',
    description: '10 mekan için 5 yıldız ver',
    icon: '⭐',
    category: 'special',
    tier: 'bronze',
    requirement: { type: 'rating', target: 10, metric: '5_star_reviews' },
    points: 25,
  },
  {
    id: 'honest-critic',
    name: 'Dürüst Eleştirmen',
    description: '10 mekan için 1-2 yıldız ver',
    icon: '🎯',
    category: 'special',
    tier: 'bronze',
    requirement: { type: 'rating', target: 10, metric: 'low_rating_reviews' },
    points: 25,
  },
  {
    id: 'first-discover',
    name: 'İlk Kaşif',
    description: 'Henüz değerlendirilmemiş bir mekanı ilk değerlendir',
    icon: '🏆',
    category: 'special',
    tier: 'gold',
    requirement: { type: 'special', target: 1, metric: 'first_review_venue' },
    points: 100,
  },
  {
    id: 'anniversary',
    name: 'Yıldönümü',
    description: 'TasteBuddy\'de 1 yılı tamamla',
    icon: '🎂',
    category: 'special',
    tier: 'gold',
    requirement: { type: 'special', target: 365, metric: 'days_active' },
    points: 100,
  },
  {
    id: 'beta-tester',
    name: 'Beta Test Kullanıcısı',
    description: 'Beta döneminde katıl',
    icon: '🧪',
    category: 'special',
    tier: 'platinum',
    requirement: { type: 'special', target: 1, metric: 'beta_user' },
    points: 200,
  },
];

// Utility functions
export function getBadgeById(id: string): Badge | undefined {
  return BADGES.find(b => b.id === id);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGES.filter(b => b.category === category);
}

export function getBadgesByTier(tier: BadgeTier): Badge[] {
  return BADGES.filter(b => b.tier === tier);
}

export function getTierColor(tier: BadgeTier): string {
  const colors: Record<BadgeTier, string> = {
    bronze: 'from-amber-600 to-amber-800',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-300 to-cyan-500',
    diamond: 'from-purple-400 to-pink-500',
  };
  return colors[tier];
}

export function getTierBgColor(tier: BadgeTier): string {
  const colors: Record<BadgeTier, string> = {
    bronze: 'bg-amber-100',
    silver: 'bg-gray-100',
    gold: 'bg-yellow-100',
    platinum: 'bg-cyan-100',
    diamond: 'bg-purple-100',
  };
  return colors[tier];
}

export function getTierBorderColor(tier: BadgeTier): string {
  const colors: Record<BadgeTier, string> = {
    bronze: 'border-amber-400',
    silver: 'border-gray-400',
    gold: 'border-yellow-400',
    platinum: 'border-cyan-400',
    diamond: 'border-purple-400',
  };
  return colors[tier];
}

export function getCategoryName(category: BadgeCategory): string {
  const names: Record<BadgeCategory, string> = {
    reviews: 'Değerlendirme',
    exploration: 'Keşif',
    social: 'Sosyal',
    expertise: 'Uzmanlık',
    special: 'Özel',
  };
  return names[category];
}

export function getCategoryIcon(category: BadgeCategory): string {
  const icons: Record<BadgeCategory, string> = {
    reviews: '📝',
    exploration: '🗺️',
    social: '👥',
    expertise: '🎓',
    special: '✨',
  };
  return icons[category];
}

export function calculateTotalPoints(earnedBadges: UserBadge[]): number {
  return earnedBadges.reduce((total, ub) => {
    const badge = getBadgeById(ub.badgeId);
    return total + (badge?.points || 0);
  }, 0);
}

export function getUserLevel(points: number): { level: number; title: string; nextLevelPoints: number } {
  const levels = [
    { minPoints: 0, level: 1, title: 'Çaylak' },
    { minPoints: 50, level: 2, title: 'Amatör' },
    { minPoints: 150, level: 3, title: 'Meraklı' },
    { minPoints: 300, level: 4, title: 'Deneyimli' },
    { minPoints: 500, level: 5, title: 'Uzman' },
    { minPoints: 800, level: 6, title: 'Usta' },
    { minPoints: 1200, level: 7, title: 'Guru' },
    { minPoints: 1800, level: 8, title: 'Efsane' },
    { minPoints: 2500, level: 9, title: 'Üstat' },
    { minPoints: 3500, level: 10, title: 'Lezzet Tanrısı' },
  ];

  let currentLevel = levels[0];
  let nextLevelPoints = levels[1]?.minPoints || 0;

  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].minPoints) {
      currentLevel = levels[i];
      nextLevelPoints = levels[i + 1]?.minPoints || levels[i].minPoints;
    }
  }

  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelPoints,
  };
}

// Demo data for testing
export const DEMO_USER_BADGES: UserBadge[] = [
  { badgeId: 'first-review', earnedAt: '2024-01-15T10:30:00Z' },
  { badgeId: 'reviewer-10', earnedAt: '2024-02-20T14:45:00Z' },
  { badgeId: 'explorer-5', earnedAt: '2024-01-20T09:15:00Z' },
  { badgeId: 'explorer-25', earnedAt: '2024-03-10T16:30:00Z' },
  { badgeId: 'social-butterfly', earnedAt: '2024-02-28T11:00:00Z' },
  { badgeId: 'kebab-master', earnedAt: '2024-03-15T18:20:00Z' },
  { badgeId: 'coffee-expert', earnedAt: '2024-03-25T08:45:00Z' },
  { badgeId: 'streak-7', earnedAt: '2024-04-01T20:00:00Z' },
  { badgeId: 'beta-tester', earnedAt: '2024-01-01T00:00:00Z' },
];

// Badges the user is close to earning (for progress display)
export const DEMO_BADGE_PROGRESS: { badgeId: string; progress: number }[] = [
  { badgeId: 'reviewer-50', progress: 72 }, // 36/50 reviews
  { badgeId: 'explorer-100', progress: 45 }, // 45/100 venues
  { badgeId: 'influencer', progress: 60 }, // 30/50 followers
  { badgeId: 'helpful', progress: 80 }, // 40/50 likes
  { badgeId: 'streak-30', progress: 33 }, // 10/30 days
];
