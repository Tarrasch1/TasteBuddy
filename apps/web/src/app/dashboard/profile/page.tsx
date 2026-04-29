'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Star, MapPin, Calendar, Edit2, Camera, Loader2,
  Utensils, TrendingUp, Heart, Users, Bell, Settings, LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

interface UserStats {
  reviewCount: number;
  friendCount: number;
  savedCount: number;
  visitedCount: number;
}

interface RecentReview {
  id: string;
  venueName: string;
  venueSlug: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    reviewCount: 0,
    friendCount: 0,
    savedCount: 0,
    visitedCount: 0,
  });
  const [recentReviews, setRecentReviews] = useState<RecentReview[]>([]);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated, hasHydrated]);

  const loadProfile = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Demo data
      setStats({
        reviewCount: 23,
        friendCount: 12,
        savedCount: 8,
        visitedCount: 45,
      });
      
      setRecentReviews([
        {
          id: '1',
          venueName: 'Lezzet Durağı',
          venueSlug: 'lezzet-duragi',
          rating: 4.5,
          comment: 'Harika bir deneyimdi, özellikle kebaplar mükemmeldi!',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
          id: '2',
          venueName: 'Kahve Molası',
          venueSlug: 'kahve-molasi',
          rating: 5,
          comment: 'En iyi filter kahve burada!',
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        },
        {
          id: '3',
          venueName: 'Sushi Garden',
          venueSlug: 'sushi-garden',
          rating: 4,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card hidden lg:block">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TasteBuddy</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-2">
          <NavLink href="/dashboard" icon={<TrendingUp />} label="Akış" />
          <NavLink href="/explore" icon={<MapPin />} label="Keşfet" />
          <NavLink href="/dashboard/saved" icon={<Heart />} label="Kaydedilenler" />
          <NavLink href="/dashboard/friends" icon={<Users />} label="Arkadaşlar" />
          <NavLink href="/dashboard/notifications" icon={<Bell />} label="Bildirimler" />
          <NavLink href="/dashboard/profile" icon={<User />} label="Profil" active />
          <NavLink href="/dashboard/settings" icon={<Settings />} label="Ayarlar" />
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold">Profil</h1>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
              Düzenle
            </Link>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-full flex items-center justify-center">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground" />
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold">{user?.displayName}</h2>
                  <p className="text-muted-foreground">@{user?.username}</p>
                  <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center md:justify-start gap-1">
                    <Calendar className="h-4 w-4" />
                    {(user as any)?.createdAt 
                      ? `${formatDate((user as any).createdAt)} tarihinde katıldı`
                      : 'TasteBuddy üyesi'
                    }
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-card border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats.reviewCount}</p>
                  <p className="text-sm text-muted-foreground">Değerlendirme</p>
                </div>
                <div className="bg-card border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats.friendCount}</p>
                  <p className="text-sm text-muted-foreground">Arkadaş</p>
                </div>
                <div className="bg-card border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats.savedCount}</p>
                  <p className="text-sm text-muted-foreground">Kaydedilen</p>
                </div>
                <div className="bg-card border rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stats.visitedCount}</p>
                  <p className="text-sm text-muted-foreground">Ziyaret</p>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-card border rounded-xl">
                <div className="p-4 border-b">
                  <h3 className="font-semibold">Son Değerlendirmeler</h3>
                </div>
                
                {recentReviews.length === 0 ? (
                  <div className="p-8 text-center">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Henüz değerlendirme yapmadınız</p>
                    <Link
                      href="/explore"
                      className="inline-block mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Mekanları Keşfet
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentReviews.map((review) => (
                      <Link
                        key={review.id}
                        href={`/venues/${review.venueSlug}`}
                        className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg shrink-0">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium">{review.venueName}</h4>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              "{review.comment}"
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(review.createdAt)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function NavLink({ 
  href, 
  icon, 
  label, 
  active = false 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-primary/10 text-primary' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      <span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      {label}
    </Link>
  );
}
