'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Utensils, MapPin, Star, Heart, Bell, Settings, 
  LogOut, User, Loader2, TrendingUp, Users 
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { socialApi, userApi } from '@/lib/api';
import { toast } from 'sonner';

interface Activity {
  id: string;
  type: string;
  data: any;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasHydrated } = useAuthStore();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    reviewCount: 0,
    friendCount: 0,
    savedCount: 0,
  });

  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadDashboard();
  }, [isAuthenticated, hasHydrated]);

  const loadDashboard = async () => {
    try {
      const [feedResponse, friendsResponse, savedVenuesResponse] = await Promise.all([
        socialApi.getFeed({ limit: 10 }),
        socialApi.getFriends({ limit: 1 }),
        socialApi.getSavedVenues({ limit: 1 }),
      ]);
      
      setActivities(feedResponse?.data || []);
      setStats({
        reviewCount: 0, // Would come from user profile
        friendCount: (friendsResponse as any)?.pagination?.total || 0,
        savedCount: (savedVenuesResponse as any)?.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      logout();
      toast.success('Başarıyla çıkış yapıldı');
      router.push('/');
    } catch (error) {
      toast.error('Çıkış yapılamadı');
    }
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
          <NavLink href="/dashboard" icon={<TrendingUp />} label="Akış" active />
          <NavLink href="/explore" icon={<MapPin />} label="Keşfet" />
          <NavLink href="/dashboard/saved" icon={<Heart />} label="Kaydedilenler" />
          <NavLink href="/dashboard/friends" icon={<Users />} label="Arkadaşlar" />
          <NavLink href="/dashboard/notifications" icon={<Bell />} label="Bildirimler" />
          <NavLink href="/dashboard/profile" icon={<User />} label="Profil" />
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
        {/* Header */}
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold">Akış</h1>
            
            <div className="flex items-center gap-4">
              <Link href="/dashboard/notifications" className="relative p-2 hover:bg-muted rounded-full">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Link>
              
              <Link href="/dashboard/profile" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.displayName}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className="hidden md:block font-medium">{user?.displayName}</span>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Değerlendirmeler" value={stats.reviewCount} icon={<Star />} />
            <StatCard label="Arkadaşlar" value={stats.friendCount} icon={<Users />} />
            <StatCard label="Kaydedilenler" value={stats.savedCount} icon={<Heart />} />
          </div>

          {/* Activity Feed */}
          <div className="bg-card border rounded-xl">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Son Aktiviteler</h2>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Henüz aktivite yok</p>
                <Link
                  href="/explore"
                  className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Keşfetmeye Başla
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
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

function StatCard({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
}) {
  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-muted-foreground [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const getActivityText = () => {
    switch (activity.type) {
      case 'ITEM_REVIEW':
        return `${activity.data.itemName || 'bir ürünü'} değerlendirdi`;
      case 'VENUE_REVIEW':
        return `${activity.data.venueName || 'bir mekanı'} değerlendirdi`;
      case 'NEW_FRIEND':
        return 'yeni bir arkadaş edindi';
      default:
        return 'bir şey yaptı';
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors">
      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center shrink-0">
        {activity.user.avatarUrl ? (
          <Image
            src={activity.user.avatarUrl}
            alt={activity.user.displayName}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <User className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p>
          <span className="font-medium">{activity.user.displayName}</span>
          <span className="text-muted-foreground"> {getActivityText()}</span>
        </p>
        
        {activity.data.rating && (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{activity.data.rating}</span>
          </div>
        )}
        
        {activity.data.comment && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            "{activity.data.comment}"
          </p>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(activity.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
