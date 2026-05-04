'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Trophy, Star, MapPin, TrendingUp, Crown, Medal, Award,
  Utensils, Coffee, Home, Compass, User, ChevronRight, Filter, Users, BookOpen
} from 'lucide-react';
import { AppTopNav, AppBottomNav } from '@/components/app-nav';

interface LeaderboardVenue {
  rank: number;
  id: string;
  name: string;
  slug: string;
  category: { name: string; icon: string };
  address: string;
  averageRating: number;
  reviewCount: number;
  change: 'up' | 'down' | 'same';
}

interface LeaderboardItem {
  rank: number;
  id: string;
  name: string;
  venueName: string;
  venueSlug: string;
  category: string;
  averageRating: number;
  reviewCount: number;
  change: 'up' | 'down' | 'same';
}

// Demo leaderboard data
const TOP_VENUES: LeaderboardVenue[] = [
  { rank: 1, id: '2', name: 'Karaköy Güllüoğlu', slug: 'karakoy-gulluoglu', category: { name: 'Tatlıcı', icon: '🍯' }, address: 'Karaköy, İstanbul', averageRating: 4.8, reviewCount: 5230, change: 'same' },
  { rank: 2, id: '3', name: 'Mikla', slug: 'mikla-restaurant', category: { name: 'Fine Dining', icon: '🍽️' }, address: 'Beyoğlu, İstanbul', averageRating: 4.7, reviewCount: 890, change: 'up' },
  { rank: 3, id: '11', name: 'Balıkçı Sabahattin', slug: 'balikci-sabahattin', category: { name: 'Balık Restoranı', icon: '🐟' }, address: 'Sultanahmet, İstanbul', averageRating: 4.6, reviewCount: 2340, change: 'up' },
  { rank: 4, id: '4', name: 'Kronotrop Coffee', slug: 'kronotrop-coffee', category: { name: 'Kafe', icon: '☕' }, address: 'Cihangir, İstanbul', averageRating: 4.6, reviewCount: 1820, change: 'down' },
  { rank: 5, id: '5', name: 'Çiya Sofrası', slug: 'ciya-sofrasi', category: { name: 'Türk Mutfağı', icon: '🍲' }, address: 'Kadıköy, İstanbul', averageRating: 4.5, reviewCount: 3210, change: 'same' },
  { rank: 6, id: '8', name: 'Karaköy Lokantası', slug: 'karakoy-lokantasi', category: { name: 'Meyhane', icon: '🍻' }, address: 'Karaköy, İstanbul', averageRating: 4.5, reviewCount: 2870, change: 'up' },
  { rank: 7, id: '1', name: 'Nusr-Et Steakhouse', slug: 'nusr-et-steakhouse', category: { name: 'Steakhouse', icon: '🥩' }, address: 'Etiler, İstanbul', averageRating: 4.5, reviewCount: 2450, change: 'down' },
  { rank: 8, id: '14', name: 'Gram', slug: 'gram', category: { name: 'Brunch', icon: '🥞' }, address: 'Galata, İstanbul', averageRating: 4.5, reviewCount: 2150, change: 'same' },
  { rank: 9, id: '7', name: 'Sunset Grill & Bar', slug: 'sunset-grill-bar', category: { name: 'Fine Dining', icon: '🌅' }, address: 'Ulus, İstanbul', averageRating: 4.4, reviewCount: 1290, change: 'up' },
  { rank: 10, id: '12', name: 'Hayvore', slug: 'hayvore-asmalimescit', category: { name: 'Karadeniz Mutfağı', icon: '🧀' }, address: 'Asmalımescit, İstanbul', averageRating: 4.4, reviewCount: 1890, change: 'same' },
];

const TOP_ITEMS: LeaderboardItem[] = [
  { rank: 1, id: 'i1', name: 'Fıstıklı Baklava', venueName: 'Karaköy Güllüoğlu', venueSlug: 'karakoy-gulluoglu', category: 'Tatlı', averageRating: 4.9, reviewCount: 2340, change: 'same' },
  { rank: 2, id: 'i2', name: 'Lokum Et', venueName: 'Nusr-Et Steakhouse', venueSlug: 'nusr-et-steakhouse', category: 'Et', averageRating: 4.8, reviewCount: 890, change: 'up' },
  { rank: 3, id: 'i3', name: 'Tadım Menüsü', venueName: 'Mikla', venueSlug: 'mikla-restaurant', category: 'Menü', averageRating: 4.9, reviewCount: 234, change: 'same' },
  { rank: 4, id: 'i4', name: 'Şöbiyet', venueName: 'Karaköy Güllüoğlu', venueSlug: 'karakoy-gulluoglu', category: 'Tatlı', averageRating: 4.8, reviewCount: 1230, change: 'up' },
  { rank: 5, id: 'i5', name: 'Analı Kızlı', venueName: 'Çiya Sofrası', venueSlug: 'ciya-sofrasi', category: 'Ana Yemek', averageRating: 4.7, reviewCount: 567, change: 'down' },
  { rank: 6, id: 'i6', name: 'Filter Coffee', venueName: 'Kronotrop Coffee', venueSlug: 'kronotrop-coffee', category: 'Kahve', averageRating: 4.8, reviewCount: 890, change: 'up' },
  { rank: 7, id: 'i7', name: 'Mantı', venueName: 'Mikla', venueSlug: 'mikla-restaurant', category: 'Başlangıç', averageRating: 4.8, reviewCount: 289, change: 'same' },
  { rank: 8, id: 'i8', name: 'Tepsi Kebabı', venueName: 'Çiya Sofrası', venueSlug: 'ciya-sofrasi', category: 'Kebap', averageRating: 4.8, reviewCount: 890, change: 'up' },
  { rank: 9, id: 'i9', name: 'Kuymak', venueName: 'Hayvore', venueSlug: 'hayvore-asmalimescit', category: 'Kahvaltı', averageRating: 4.6, reviewCount: 567, change: 'down' },
  { rank: 10, id: 'i10', name: 'Kaburga', venueName: 'Nusr-Et Steakhouse', venueSlug: 'nusr-et-steakhouse', category: 'Et', averageRating: 4.7, reviewCount: 234, change: 'same' },
];

const CATEGORIES = [
  { id: 'all', name: 'Tümü', icon: '🏆' },
  { id: 'restaurant', name: 'Restoran', icon: '🍽️' },
  { id: 'cafe', name: 'Kafe', icon: '☕' },
  { id: 'dessert', name: 'Tatlıcı', icon: '🍰' },
  { id: 'fastfood', name: 'Fast Food', icon: '🍔' },
  { id: 'seafood', name: 'Deniz Ürünleri', icon: '🐟' },
];

const DISTRICTS = [
  { id: 'all', name: 'Tüm İstanbul' },
  { id: 'kadikoy', name: 'Kadıköy' },
  { id: 'besiktas', name: 'Beşiktaş' },
  { id: 'beyoglu', name: 'Beyoğlu' },
  { id: 'sisli', name: 'Şişli' },
  { id: 'uskudar', name: 'Üsküdar' },
];

// Arkadaşlar arası sıralama verisi
interface FriendRank {
  rank: number;
  id: string;
  displayName: string;
  username: string;
  reviewCount: number;
  avgRating: number;
  badges: number;
  favoriteCategory: string;
  change: 'up' | 'down' | 'same';
}

const DEMO_FRIENDS: FriendRank[] = [
  { rank: 1, id: 'f1', displayName: 'Ayşe Yılmaz', username: 'ayseyilmaz', reviewCount: 156, avgRating: 4.3, badges: 12, favoriteCategory: 'Türk Mutfağı', change: 'same' },
  { rank: 2, id: 'f2', displayName: 'Mehmet Kaya', username: 'mehmetkaya', reviewCount: 142, avgRating: 4.1, badges: 10, favoriteCategory: 'Kafe', change: 'up' },
  { rank: 3, id: 'f3', displayName: 'Zeynep Demir', username: 'zeynepdemir', reviewCount: 128, avgRating: 4.5, badges: 9, favoriteCategory: 'Fine Dining', change: 'up' },
  { rank: 4, id: 'f4', displayName: 'Ali Öztürk', username: 'aliozturk', reviewCount: 98, avgRating: 3.9, badges: 7, favoriteCategory: 'Fast Food', change: 'down' },
  { rank: 5, id: 'f5', displayName: 'Elif Arslan', username: 'elifarslan', reviewCount: 87, avgRating: 4.4, badges: 8, favoriteCategory: 'Tatlıcı', change: 'same' },
  { rank: 6, id: 'f6', displayName: 'Can Yıldız', username: 'canyildiz', reviewCount: 76, avgRating: 4.2, badges: 6, favoriteCategory: 'Deniz Ürünleri', change: 'up' },
  { rank: 7, id: 'f7', displayName: 'Selin Ak', username: 'selinak', reviewCount: 65, avgRating: 4.6, badges: 5, favoriteCategory: 'Fine Dining', change: 'down' },
  { rank: 8, id: 'f8', displayName: 'Burak Özdemir', username: 'burakozdemir', reviewCount: 54, avgRating: 4.0, badges: 4, favoriteCategory: 'Kebap', change: 'same' },
];

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'venues' | 'items' | 'friends'>('venues');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews'>('rating');
  const [category, setCategory] = useState('all');
  const [district, setDistrict] = useState('all');
  const [friendSort, setFriendSort] = useState<'reviews' | 'rating' | 'badges'>('reviews');

  const sortedFriends = [...DEMO_FRIENDS].sort((a, b) => {
    if (friendSort === 'reviews') return b.reviewCount - a.reviewCount;
    if (friendSort === 'rating') return b.avgRating - a.avgRating;
    return b.badges - a.badges;
  }).map((f, idx) => ({ ...f, rank: idx + 1 }));

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-muted-foreground">{rank}</span>;
  };

  const getChangeIndicator = (change: 'up' | 'down' | 'same') => {
    if (change === 'up') return <span className="text-green-500 text-xs">▲</span>;
    if (change === 'down') return <span className="text-red-500 text-xs">▼</span>;
    return <span className="text-muted-foreground text-xs">-</span>;
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <AppTopNav />

      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold">İstanbul Liderlik Tablosu</h1>
              <p className="opacity-90">En çok değerlendirilen mekanlar ve ürünler</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">1,234</p>
              <p className="text-sm opacity-90">Mekan</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">45.6K</p>
              <p className="text-sm opacity-90">Değerlendirme</p>
            </div>
            <div className="bg-white/20 rounded-xl p-3 text-center">
              <p className="text-3xl font-bold">12.3K</p>
              <p className="text-sm opacity-90">Kullanıcı</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setTab('venues')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
              tab === 'venues' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border hover:bg-muted'
            }`}
          >
            <MapPin className="h-4 w-4 inline mr-2" />
            Mekanlar
          </button>
          <button
            onClick={() => setTab('items')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
              tab === 'items' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border hover:bg-muted'
            }`}
          >
            <Utensils className="h-4 w-4 inline mr-2" />
            Ürünler
          </button>
          <button
            onClick={() => setTab('friends')}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
              tab === 'friends' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-card border hover:bg-muted'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Arkadaşlar
          </button>
        </div>

        {/* Filters - only for venues/items */}
        {tab !== 'friends' && (
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rating' | 'reviews')}
            className="bg-card border rounded-lg px-3 py-2 text-sm"
          >
            <option value="rating">Puana Göre</option>
            <option value="reviews">Yorum Sayısına Göre</option>
          </select>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-card border rounded-lg px-3 py-2 text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>

          {/* District */}
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="bg-card border rounded-lg px-3 py-2 text-sm"
          >
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        )}

        {/* Friends Leaderboard */}
        {tab === 'friends' && (
          <div className="space-y-4">
            {/* Friends sort */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground">Sırala:</span>
              <select
                value={friendSort}
                onChange={(e) => setFriendSort(e.target.value as 'reviews' | 'rating' | 'badges')}
                className="bg-card border rounded-lg px-3 py-2 text-sm"
              >
                <option value="reviews">Değerlendirme Sayısı</option>
                <option value="rating">Ortalama Puan</option>
                <option value="badges">Rozet Sayısı</option>
              </select>
            </div>

            {/* My position highlight */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-300 dark:border-purple-700 rounded-xl p-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center w-10">
                  <span className="w-8 h-8 flex items-center justify-center text-lg font-bold text-purple-600 bg-purple-100 rounded-full">3</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-lg font-bold">
                  B
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">Sen</h3>
                  <p className="text-sm text-muted-foreground">@bugragazioglu</p>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Kendi sıralamanız</span>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold">128</p>
                  <p className="text-xs text-muted-foreground">değerlendirme</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">4.5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Friends list */}
            <div className="space-y-3">
              {sortedFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-4 bg-card border rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  {/* Rank */}
                  <div className="flex flex-col items-center w-10">
                    {getRankIcon(friend.rank)}
                    {getChangeIndicator(friend.change)}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
                    {friend.displayName[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{friend.displayName}</h3>
                    <p className="text-sm text-muted-foreground">@{friend.username}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">❤️ {friend.favoriteCategory}</span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">🏅 {friend.badges} rozet</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <p className="font-semibold">{friend.reviewCount}</p>
                    <p className="text-xs text-muted-foreground">değerlendirme</p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{friend.avgRating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard List - venues/items only */}
        {tab !== 'friends' && (
        <div className="space-y-3">
          {tab === 'venues' ? (
            TOP_VENUES
              .sort((a, b) => sortBy === 'rating' 
                ? b.averageRating - a.averageRating 
                : b.reviewCount - a.reviewCount
              )
              .map((venue, idx) => (
                <Link
                  key={venue.id}
                  href={`/venues/${venue.slug}`}
                  className="flex items-center gap-4 bg-card border rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  {/* Rank */}
                  <div className="flex flex-col items-center w-10">
                    {getRankIcon(idx + 1)}
                    {getChangeIndicator(venue.change)}
                  </div>

                  {/* Venue Icon */}
                  <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl flex items-center justify-center text-2xl">
                    {venue.category.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{venue.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{venue.address}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">{venue.category.name}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{venue.averageRating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{venue.reviewCount.toLocaleString()} yorum</p>
                  </div>
                </Link>
              ))
          ) : (
            TOP_ITEMS
              .sort((a, b) => sortBy === 'rating' 
                ? b.averageRating - a.averageRating 
                : b.reviewCount - a.reviewCount
              )
              .map((item, idx) => (
                <Link
                  key={item.id}
                  href={`/venues/${item.venueSlug}`}
                  className="flex items-center gap-4 bg-card border rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  {/* Rank */}
                  <div className="flex flex-col items-center w-10">
                    {getRankIcon(idx + 1)}
                    {getChangeIndicator(item.change)}
                  </div>

                  {/* Item Icon */}
                  <div className="w-14 h-14 shrink-0 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center text-2xl">
                    {item.category === 'Tatlı' ? '🍯' :
                     item.category === 'Et' ? '🥩' :
                     item.category === 'Kahve' ? '☕' :
                     item.category === 'Kebap' ? '🍢' :
                     item.category === 'Menü' ? '🍽️' : '🍴'}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    <p className="text-sm text-primary truncate">{item.venueName}</p>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">{item.category}</span>
                  </div>

                  {/* Stats */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 justify-end">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{item.averageRating}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.reviewCount.toLocaleString()} yorum</p>
                  </div>
                </Link>
              ))
          )}
        </div>
        )}

        {/* Top Users Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            En Aktif Değerlendiriciler
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { rank: 1, name: 'Ayşe Yılmaz', username: 'ayseyilmaz', reviews: 156, badges: 12 },
              { rank: 2, name: 'Mehmet Kaya', username: 'mehmetkaya', reviews: 142, badges: 10 },
              { rank: 3, name: 'Zeynep Demir', username: 'zeynepdemir', reviews: 128, badges: 9 },
            ].map((user) => (
              <div key={user.rank} className="bg-card border rounded-xl p-4 text-center">
                <div className="flex justify-center mb-3">
                  {getRankIcon(user.rank)}
                </div>
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold mb-3">
                  {user.name[0]}
                </div>
                <h3 className="font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
                <div className="flex items-center justify-center gap-4 mt-3 text-sm">
                  <div>
                    <p className="font-semibold">{user.reviews}</p>
                    <p className="text-xs text-muted-foreground">Değerlendirme</p>
                  </div>
                  <div>
                    <p className="font-semibold">{user.badges}</p>
                    <p className="text-xs text-muted-foreground">Rozet</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AppBottomNav />
    </div>
  );
}
