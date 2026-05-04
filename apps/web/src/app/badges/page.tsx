'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Utensils, MapPin, Star, Award, User, Loader2,
  ChevronLeft, TrendingUp, Lock, Home, Compass, Trophy, BookOpen
} from 'lucide-react';
import { AppTopNav, AppBottomNav } from '@/components/app-nav';
import { useAuthStore } from '@/stores/auth-store';
import {
  BADGES, DEMO_USER_BADGES, DEMO_BADGE_PROGRESS,
  getBadgeById, getTierBgColor, getTierBorderColor, getTierColor,
  getCategoryName, getCategoryIcon, calculateTotalPoints, getUserLevel,
  type Badge, type BadgeCategory, type BadgeTier
} from '@/lib/badges';

export default function BadgesPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'all'>('all');
  const [selectedTier, setSelectedTier] = useState<BadgeTier | 'all'>('all');
  const [showBadgeModal, setShowBadgeModal] = useState<Badge | null>(null);

  const earnedBadges = DEMO_USER_BADGES;
  const totalPoints = calculateTotalPoints(earnedBadges);
  const userLevel = getUserLevel(totalPoints);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setTimeout(() => setIsLoading(false), 300);
  }, [isAuthenticated, hasHydrated, router]);

  // Filter badges
  const filteredBadges = BADGES.filter(badge => {
    if (selectedCategory !== 'all' && badge.category !== selectedCategory) {
      return false;
    }
    if (selectedTier !== 'all' && badge.tier !== selectedTier) {
      return false;
    }
    return true;
  });

  // Group by category
  const badgesByCategory = filteredBadges.reduce((acc, badge) => {
    if (!acc[badge.category]) {
      acc[badge.category] = [];
    }
    acc[badge.category].push(badge);
    return acc;
  }, {} as Record<string, Badge[]>);

  const categories: BadgeCategory[] = ['reviews', 'exploration', 'social', 'expertise', 'special'];
  const tiers: BadgeTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

  if (!hasHydrated || !isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <AppTopNav />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Seviye {userLevel.level}</h2>
              <p className="text-white/80">{userLevel.title}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{totalPoints}</p>
              <p className="text-white/80 text-sm">toplam puan</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">{earnedBadges.length}</p>
              <p className="text-white/80 text-sm">Kazanılan</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{BADGES.length - earnedBadges.length}</p>
              <p className="text-white/80 text-sm">Kilitli</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.round((earnedBadges.length / BADGES.length) * 100)}%</p>
              <p className="text-white/80 text-sm">Tamamlanan</p>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="bg-card border rounded-xl p-4 mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Yaklaşan Rozetler
          </h3>
          <div className="space-y-4">
            {DEMO_BADGE_PROGRESS.map((progress) => {
              const badge = getBadgeById(progress.badgeId);
              if (!badge) return null;
              return (
                <div
                  key={badge.id}
                  className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setShowBadgeModal(badge)}
                >
                  <div className={`w-12 h-12 rounded-xl ${getTierBgColor(badge.tier)} ${getTierBorderColor(badge.tier)} border-2 flex items-center justify-center text-2xl`}>
                    {badge.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{badge.name}</span>
                      <span className="text-sm text-muted-foreground">%{progress.progress}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as BadgeCategory | 'all')}
            className="text-sm border rounded-lg px-3 py-2 bg-background"
          >
            <option value="all">Tüm Kategoriler</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryIcon(cat)} {getCategoryName(cat)}
              </option>
            ))}
          </select>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as BadgeTier | 'all')}
            className="text-sm border rounded-lg px-3 py-2 bg-background"
          >
            <option value="all">Tüm Seviyeler</option>
            {tiers.map((tier) => (
              <option key={tier} value={tier} className="capitalize">
                {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Badge Grid by Category */}
        <div className="space-y-6">
          {selectedCategory === 'all' ? (
            Object.entries(badgesByCategory).map(([category, badges]) => (
              <div key={category} className="bg-card border rounded-xl p-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="text-xl">{getCategoryIcon(category as BadgeCategory)}</span>
                  {getCategoryName(category as BadgeCategory)}
                  <span className="text-sm text-muted-foreground font-normal">
                    ({earnedBadges.filter(ub => {
                      const b = getBadgeById(ub.badgeId);
                      return b?.category === category;
                    }).length}/{badges.length})
                  </span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {badges.map((badge) => {
                    const isEarned = earnedBadges.some(ub => ub.badgeId === badge.id);
                    return (
                      <button
                        key={badge.id}
                        onClick={() => setShowBadgeModal(badge)}
                        className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                          isEarned
                            ? `${getTierBgColor(badge.tier)} ${getTierBorderColor(badge.tier)} hover:scale-105`
                            : 'bg-muted/30 border-muted opacity-60 grayscale hover:opacity-80'
                        }`}
                      >
                        {!isEarned && (
                          <div className="absolute top-2 right-2">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="text-3xl block mb-2">{badge.icon}</span>
                        <p className="font-medium text-sm line-clamp-1">{badge.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {badge.points}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-card border rounded-xl p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="text-xl">{getCategoryIcon(selectedCategory)}</span>
                {getCategoryName(selectedCategory)}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredBadges.map((badge) => {
                  const isEarned = earnedBadges.some(ub => ub.badgeId === badge.id);
                  return (
                    <button
                      key={badge.id}
                      onClick={() => setShowBadgeModal(badge)}
                      className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                        isEarned
                          ? `${getTierBgColor(badge.tier)} ${getTierBorderColor(badge.tier)} hover:scale-105`
                          : 'bg-muted/30 border-muted opacity-60 grayscale hover:opacity-80'
                      }`}
                    >
                      {!isEarned && (
                        <div className="absolute top-2 right-2">
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-3xl block mb-2">{badge.icon}</span>
                      <p className="font-medium text-sm line-clamp-1">{badge.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {badge.points}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
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
            <div className={`w-24 h-24 rounded-xl ${getTierBgColor(showBadgeModal.tier)} ${getTierBorderColor(showBadgeModal.tier)} border-2 flex items-center justify-center text-5xl mx-auto mb-4`}>
              {showBadgeModal.icon}
            </div>
            <h3 className="text-xl font-bold text-center mb-1">{showBadgeModal.name}</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {showBadgeModal.description}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm mb-4">
              <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${getTierColor(showBadgeModal.tier)} text-white font-medium capitalize`}>
                {showBadgeModal.tier}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {showBadgeModal.points} puan
              </span>
            </div>
            <div className="text-center text-sm text-muted-foreground mb-4">
              Kategori: {getCategoryIcon(showBadgeModal.category)} {getCategoryName(showBadgeModal.category)}
            </div>
            {earnedBadges.find(ub => ub.badgeId === showBadgeModal.id) ? (
              <div className="text-center py-3 bg-green-50 text-green-600 rounded-lg flex items-center justify-center gap-2">
                <Award className="h-5 w-5" />
                Bu rozeti kazandın!
              </div>
            ) : (
              <div className="text-center py-3 bg-muted rounded-lg flex items-center justify-center gap-2 text-muted-foreground">
                <Lock className="h-5 w-5" />
                Henüz kazanılmadı
              </div>
            )}
            <button
              onClick={() => setShowBadgeModal(null)}
              className="w-full mt-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
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
