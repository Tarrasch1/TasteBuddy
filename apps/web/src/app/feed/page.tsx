'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, MessageCircle, Bookmark, Share2, MoreHorizontal,
  Star, MapPin, Utensils, Coffee, Camera, Award, TrendingUp,
  Users, Bell, Search, Home, Compass, Trophy, User, ChevronRight,
  ThumbsUp, Send, X, Filter, Plus
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import AddReviewModal, { type NewReviewData } from '@/components/add-review-modal';

interface FeedItem {
  id: string;
  type: 'venue_review' | 'item_review' | 'badge_earned' | 'new_save' | 'friend_activity';
  user: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
  createdAt: string;
  // For reviews
  venue?: {
    id: string;
    name: string;
    slug: string;
    category: string;
    address: string;
  };
  item?: {
    id: string;
    name: string;
    category: string;
  };
  rating?: number;
  content?: string;
  photos?: string[];
  // For badges
  badge?: {
    id: string;
    name: string;
    icon: string;
    description: string;
  };
  // Engagement
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  comments?: Comment[];
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  likeCount: number;
}

// Demo feed data
const DEMO_FEED: FeedItem[] = [
  {
    id: 'f1',
    type: 'venue_review',
    user: {
      id: 'u1',
      displayName: 'Ayşe Yılmaz',
      username: 'ayseyilmaz',
      avatarUrl: undefined,
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
    venue: {
      id: '2',
      name: 'Karaköy Güllüoğlu',
      slug: 'karakoy-gulluoglu',
      category: 'Tatlıcı',
      address: 'Karaköy, İstanbul',
    },
    rating: 5,
    content: 'Fıstıklı baklava efsane! Her zamanki gibi harika. Şerbeti tam kıvamında, fıstığı bol. İstanbul\'a her geldiğimde mutlaka uğruyorum. 🍯✨',
    photos: [],
    likeCount: 124,
    commentCount: 3,
    isLiked: false,
    isSaved: false,
    comments: [
      { id: 'c1', userId: 'u3', userName: 'Burak Özdemir', content: 'Ben de bayılıyorum! Kaymak da eklemeyi unutma 🤤', createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), likeCount: 5 },
      { id: 'c2', userId: 'u4', userName: 'Zeynep Kılıç', content: 'Şerbetli mi su mu tercih ediyorsun?', createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), likeCount: 2 },
      { id: 'c3', userId: 'u1', userName: 'Ayşe Yılmaz', content: '@zeynepkilic sus tercih ediyorum, daha hafif oluyor bence', createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), likeCount: 3 },
    ],
  },
  {
    id: 'f2',
    type: 'badge_earned',
    user: {
      id: 'u2',
      displayName: 'Mehmet Kaya',
      username: 'mehmetkaya',
      avatarUrl: undefined,
      isVerified: false,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    badge: {
      id: 'b1',
      name: 'Kahve Uzmanı',
      icon: '☕',
      description: '50 farklı kahve değerlendirmesi yaptın!',
    },
    likeCount: 45,
    commentCount: 8,
    isLiked: true,
    isSaved: false,
  },
  {
    id: 'f3',
    type: 'item_review',
    user: {
      id: 'u3',
      displayName: 'Zeynep Demir',
      username: 'zeynepdemir',
      avatarUrl: undefined,
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    venue: {
      id: '1',
      name: 'Nusr-Et Steakhouse',
      slug: 'nusr-et-steakhouse',
      category: 'Steakhouse',
      address: 'Etiler, İstanbul',
    },
    item: {
      id: 'i1',
      name: 'Lokum Et',
      category: 'Ana Yemek',
    },
    rating: 4.5,
    content: 'Lokum et gerçekten adına yakışıyor. Ağızda eriyor! Fiyatı biraz yüksek ama özel günler için kesinlikle değer. 🥩',
    photos: [],
    likeCount: 89,
    commentCount: 12,
    isLiked: false,
    isSaved: true,
  },
  {
    id: 'f4',
    type: 'venue_review',
    user: {
      id: 'u4',
      displayName: 'Ali Öztürk',
      username: 'aliozturk',
      avatarUrl: undefined,
      isVerified: false,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    venue: {
      id: '4',
      name: 'Kronotrop Coffee',
      slug: 'kronotrop-coffee',
      category: 'Kafe',
      address: 'Cihangir, İstanbul',
    },
    rating: 4,
    content: 'Filter kahveleri mükemmel. V60 tavsiye ederim. Mekan biraz kalabalık olabiliyor ama atmosfer güzel. Kahve severler için kaçırılmayacak bir yer.',
    photos: [],
    likeCount: 67,
    commentCount: 5,
    isLiked: false,
    isSaved: false,
  },
  {
    id: 'f5',
    type: 'badge_earned',
    user: {
      id: 'u5',
      displayName: 'Elif Arslan',
      username: 'elifarslan',
      avatarUrl: undefined,
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    badge: {
      id: 'b2',
      name: 'Gurme Kaşif',
      icon: '🏆',
      description: '25 farklı mekan keşfettin!',
    },
    likeCount: 92,
    commentCount: 15,
    isLiked: true,
    isSaved: false,
  },
  {
    id: 'f6',
    type: 'item_review',
    user: {
      id: 'u6',
      displayName: 'Can Yıldız',
      username: 'canyildiz',
      avatarUrl: undefined,
      isVerified: false,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    venue: {
      id: '5',
      name: 'Çiya Sofrası',
      slug: 'ciya-sofrasi',
      category: 'Türk Mutfağı',
      address: 'Kadıköy, İstanbul',
    },
    item: {
      id: 'i2',
      name: 'Analı Kızlı',
      category: 'Ana Yemek',
    },
    rating: 5,
    content: 'Mardin\'e özgü bu lezzeti İstanbul\'da bulmak harika. Yaprak sarma ve köfte uyumu muhteşem. Kesinlikle denenmeli! 🍲',
    photos: [],
    likeCount: 156,
    commentCount: 4,
    isLiked: true,
    isSaved: true,
    comments: [
      { id: 'c4', userId: 'u8', userName: 'Ahmet Şahin', content: 'En sevdiğim mekan!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), likeCount: 8 },
      { id: 'c5', userId: 'u9', userName: 'Elif Demir', content: 'Analı kızlı için değer 👌', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(), likeCount: 4 },
      { id: 'c6', userId: 'u10', userName: 'Murat Can', content: 'Hafta sonu gideceğim artık!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), likeCount: 2 },
      { id: 'c7', userId: 'u6', userName: 'Can Yıldız', content: '@muratcan kesinlikle git, pişman olmazsın', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), likeCount: 1 },
    ],
  },
  {
    id: 'f7',
    type: 'venue_review',
    user: {
      id: 'u7',
      displayName: 'Selin Ak',
      username: 'selinak',
      avatarUrl: undefined,
      isVerified: true,
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    venue: {
      id: '3',
      name: 'Mikla',
      slug: 'mikla-restaurant',
      category: 'Fine Dining',
      address: 'Beyoğlu, İstanbul',
    },
    rating: 5,
    content: 'Boğaz manzarası eşliğinde unutulmaz bir akşam yemeği. Tadım menüsü her kursunda sürpriz. Şef Mehmet Gürs\'ün yaratıcılığı her tabakta hissediliyor. 🍽️✨',
    photos: [],
    likeCount: 234,
    commentCount: 31,
    isLiked: false,
    isSaved: true,
  },
];

// Trending topics
const TRENDING = [
  { tag: '#KahveZamanı', count: 1250 },
  { tag: '#İstanbulLezzetleri', count: 980 },
  { tag: '#BrunchTime', count: 756 },
  { tag: '#TatlıKrizi', count: 543 },
  { tag: '#VeganLezzetler', count: 421 },
];

// Suggested users to follow
const SUGGESTED_USERS = [
  { id: 'su1', displayName: 'Gastro Guru', username: 'gastroguru', followers: 12500, isVerified: true },
  { id: 'su2', displayName: 'Kahve Delisi', username: 'kahvedelisi', followers: 8900, isVerified: false },
  { id: 'su3', displayName: 'Tatlı Aşkı', username: 'tatliasigi', followers: 6700, isVerified: true },
];

export default function FeedPage() {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated } = useAuthStore();
  const [feedItems, setFeedItems] = useState<FeedItem[]>(DEMO_FEED);
  const [isLoading, setIsLoading] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [filter, setFilter] = useState<'all' | 'reviews' | 'badges'>('all');
  const [showAddReview, setShowAddReview] = useState(false);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/');
    }
  }, [hasHydrated, isAuthenticated, router]);

  const handleLike = (itemId: string) => {
    setFeedItems(items =>
      items.map(item =>
        item.id === itemId
          ? {
              ...item,
              isLiked: !item.isLiked,
              likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1,
            }
          : item
      )
    );
  };

  const handleSave = (itemId: string) => {
    setFeedItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, isSaved: !item.isSaved }
          : item
      )
    );
    toast.success('Kaydedildi!');
  };

  const handleShare = (item: FeedItem) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/venues/${item.venue?.slug || ''}`
    );
    toast.success('Link kopyalandı!');
  };

  const handleComment = (itemId: string) => {
    if (!commentText.trim()) return;
    
    const newComment: Comment = {
      id: `c${Date.now()}`,
      userId: user?.id || 'current',
      userName: user?.displayName || 'Sen',
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
      likeCount: 0,
    };
    
    setFeedItems(items =>
      items.map(item =>
        item.id === itemId
          ? { 
              ...item, 
              commentCount: item.commentCount + 1,
              comments: [...(item.comments || []), newComment]
            }
          : item
      )
    );
    setCommentText('');
    setCommentingOn(null);
    toast.success('Yorum eklendi!');
  };

  const handleNewReview = (reviewData: NewReviewData) => {
    const newFeedItem: FeedItem = {
      id: reviewData.id,
      type: reviewData.type === 'item' ? 'item_review' : 'venue_review',
      user: {
        id: user?.id || 'current',
        displayName: reviewData.user,
        username: user?.username || 'user',
        avatarUrl: user?.avatarUrl,
        isVerified: false,
      },
      createdAt: reviewData.createdAt,
      venue: {
        id: reviewData.venueId,
        name: reviewData.venueName,
        slug: reviewData.venueSlug,
        category: reviewData.venueCategory.name,
        address: reviewData.venueAddress,
      },
      item: reviewData.type === 'item' && reviewData.itemName ? {
        id: `item_${Date.now()}`,
        name: reviewData.itemName,
        category: reviewData.venueCategory.name,
      } : undefined,
      rating: reviewData.rating,
      content: reviewData.comment || undefined,
      photos: reviewData.photos || undefined,
      likeCount: 0,
      commentCount: 0,
      isLiked: false,
      isSaved: false,
      comments: [],
    };

    setFeedItems(prev => [newFeedItem, ...prev]);
    setShowAddReview(false);
  };

  const toggleComments = (itemId: string) => {
    setExpandedComments(prev => prev === itemId ? null : itemId);
    if (expandedComments !== itemId) {
      setCommentingOn(itemId);
    }
  };

  const filteredFeed = feedItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'reviews') return item.type === 'venue_review' || item.type === 'item_review';
    if (filter === 'badges') return item.type === 'badge_earned';
    return true;
  });

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/feed" className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TasteBuddy</span>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-muted rounded-full px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Mekan, yemek veya kullanıcı ara..."
              className="bg-transparent border-none outline-none text-sm w-64"
            />
          </div>

          <div className="flex items-center gap-4">
            <Link href="/feed" className="p-2 hover:bg-muted rounded-lg text-primary">
              <Home className="h-5 w-5" />
            </Link>
            <Link href="/explore" className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
              <Compass className="h-5 w-5" />
            </Link>
            <Link href="/leaderboard" className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
              <Trophy className="h-5 w-5" />
            </Link>
            <Link href="/dashboard/notifications" className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>
            <Link href="/dashboard/profile" className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - User Info */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              {/* User Card */}
              <div className="bg-card border rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg">
                    {user?.displayName?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold">{user?.displayName || 'Kullanıcı'}</p>
                    <p className="text-sm text-muted-foreground">@{user?.username || 'username'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="font-semibold">24</p>
                    <p className="text-xs text-muted-foreground">Değerlendirme</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="font-semibold">156</p>
                    <p className="text-xs text-muted-foreground">Takipçi</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="font-semibold">89</p>
                    <p className="text-xs text-muted-foreground">Takip</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-card border rounded-xl p-4">
                <h3 className="font-semibold mb-3">Hızlı Erişim</h3>
                <nav className="space-y-1">
                  <Link href="/nearby" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">Yakınımdaki Mekanlar</span>
                  </Link>
                  <Link href="/dashboard/saved" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                    <Bookmark className="h-4 w-4 text-primary" />
                    <span className="text-sm">Kaydedilenler</span>
                  </Link>
                  <Link href="/dashboard/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                    <Award className="h-4 w-4 text-primary" />
                    <span className="text-sm">Rozetlerim</span>
                  </Link>
                </nav>
              </div>
            </div>
          </aside>

          {/* Main Feed */}
          <div className="lg:col-span-6 space-y-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-card border rounded-xl p-2">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilter('reviews')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'reviews' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Değerlendirmeler
              </button>
              <button
                onClick={() => setFilter('badges')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  filter === 'badges' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                Rozetler
              </button>
            </div>

            {/* Feed Items */}
            {filteredFeed.map((item) => (
              <article key={item.id} className="bg-card border rounded-xl overflow-hidden">
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
                      {item.user.displayName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">{item.user.displayName}</span>
                        {item.user.isVerified && (
                          <span className="text-primary">✓</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: tr })}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-muted rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-4 pb-3">
                  {item.type === 'badge_earned' && item.badge && (
                    <div className="text-center py-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl">
                      <div className="text-5xl mb-3">{item.badge.icon}</div>
                      <p className="text-sm text-muted-foreground mb-1">Yeni rozet kazandı!</p>
                      <p className="font-bold text-lg">{item.badge.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{item.badge.description}</p>
                    </div>
                  )}

                  {(item.type === 'venue_review' || item.type === 'item_review') && (
                    <>
                      {/* Venue/Item Info */}
                      <Link 
                        href={`/venues/${item.venue?.slug}`}
                        className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
                          {item.venue?.category === 'Kafe' ? '☕' :
                           item.venue?.category === 'Tatlıcı' ? '🍯' :
                           item.venue?.category === 'Steakhouse' ? '🥩' :
                           item.venue?.category === 'Fine Dining' ? '🍽️' : '🍴'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.venue?.name}</p>
                          {item.item && (
                            <p className="text-xs text-primary">{item.item.name}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{item.venue?.address}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                          <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs font-medium">{item.rating}</span>
                        </div>
                      </Link>

                      {/* Review Content */}
                      <p className="text-sm leading-relaxed">{item.content}</p>

                      {/* Photos */}
                      {item.photos && item.photos.length > 0 && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          {item.photos.map((photo, idx) => (
                            <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
                              <Image src={photo} alt="" fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center gap-1 text-sm ${
                        item.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                      } transition-colors`}
                    >
                      <Heart className={`h-5 w-5 ${item.isLiked ? 'fill-red-500' : ''}`} />
                      <span>{item.likeCount}</span>
                    </button>
                    <button
                      onClick={() => setCommentingOn(commentingOn === item.id ? null : item.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{item.commentCount}</span>
                    </button>
                    <button
                      onClick={() => handleShare(item)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleSave(item.id)}
                    className={`${
                      item.isSaved ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                    } transition-colors`}
                  >
                    <Bookmark className={`h-5 w-5 ${item.isSaved ? 'fill-primary' : ''}`} />
                  </button>
                </div>

                {/* Comment Input */}
                {commentingOn === item.id && (
                  <div className="px-4 py-3 border-t">
                    {/* Show existing comments */}
                    {item.comments && item.comments.length > 0 && (
                      <div className="mb-3 space-y-2">
                        {(expandedComments === item.id 
                          ? item.comments 
                          : item.comments.slice(-2)
                        ).map((comment) => (
                          <div key={comment.id} className="flex gap-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {comment.userName[0]}
                            </div>
                            <div className="flex-1 bg-muted rounded-lg px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{comment.userName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}
                                </span>
                              </div>
                              <p className="text-sm">{comment.content}</p>
                              <button className="text-xs text-muted-foreground hover:text-primary mt-1 flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {comment.likeCount > 0 && comment.likeCount}
                              </button>
                            </div>
                          </div>
                        ))}
                        {item.comments.length > 2 && expandedComments !== item.id && (
                          <button
                            onClick={() => setExpandedComments(item.id)}
                            className="text-sm text-primary hover:underline"
                          >
                            Tüm {item.comments.length} yorumu gör
                          </button>
                        )}
                        {expandedComments === item.id && item.comments.length > 2 && (
                          <button
                            onClick={() => setExpandedComments(null)}
                            className="text-sm text-muted-foreground hover:text-primary"
                          >
                            Yorumları gizle
                          </button>
                        )}
                      </div>
                    )}
                    
                    {/* Comment input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Yorum yaz..."
                        className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-2 ring-primary"
                        onKeyDown={(e) => e.key === 'Enter' && handleComment(item.id)}
                      />
                      <button
                        onClick={() => handleComment(item.id)}
                        disabled={!commentText.trim()}
                        className="p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          {/* Right Sidebar - Trending & Suggestions */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              {/* Trending */}
              <div className="bg-card border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Trend Konular</h3>
                </div>
                <div className="space-y-3">
                  {TRENDING.map((topic, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">{topic.tag}</span>
                      <span className="text-xs text-muted-foreground">{topic.count} paylaşım</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Users */}
              <div className="bg-card border rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Önerilen Hesaplar</h3>
                  <Link href="#" className="text-xs text-primary">Tümünü Gör</Link>
                </div>
                <div className="space-y-3">
                  {SUGGESTED_USERS.map((suggestedUser) => (
                    <div key={suggestedUser.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {suggestedUser.displayName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">{suggestedUser.displayName}</span>
                            {suggestedUser.isVerified && <span className="text-primary text-xs">✓</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{suggestedUser.followers.toLocaleString()} takipçi</p>
                        </div>
                      </div>
                      <button className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full hover:bg-primary/90">
                        Takip Et
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard Teaser */}
              <Link href="/leaderboard" className="block bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-xl p-4 hover:opacity-90 transition-opacity">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-5 w-5" />
                  <span className="font-semibold">Liderlik Tablosu</span>
                </div>
                <p className="text-sm opacity-90">İstanbul'un en popüler mekanlarını keşfet</p>
                <ChevronRight className="h-5 w-5 mt-2 ml-auto" />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Floating Action Button - Add Review */}
      <button
        onClick={() => setShowAddReview(true)}
        className="fixed bottom-20 lg:bottom-6 right-6 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 hover:scale-110 transition-all flex items-center justify-center group"
        title="Değerlendirme Ekle"
      >
        <Plus className="h-6 w-6 group-hover:rotate-90 transition-transform" />
      </button>

      {/* Add Review Modal */}
      <AddReviewModal 
        isOpen={showAddReview} 
        onClose={() => setShowAddReview(false)}
        onSuccess={handleNewReview}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="flex items-center justify-around py-3">
          <Link href="/feed" className="flex flex-col items-center text-primary">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Akış</span>
          </Link>
          <Link href="/explore" className="flex flex-col items-center text-muted-foreground">
            <Compass className="h-5 w-5" />
            <span className="text-xs mt-1">Keşfet</span>
          </Link>
          <Link href="/nearby" className="flex flex-col items-center text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span className="text-xs mt-1">Yakında</span>
          </Link>
          <Link href="/leaderboard" className="flex flex-col items-center text-muted-foreground">
            <Trophy className="h-5 w-5" />
            <span className="text-xs mt-1">Sıralama</span>
          </Link>
          <Link href="/dashboard/profile" className="flex flex-col items-center text-muted-foreground">
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
