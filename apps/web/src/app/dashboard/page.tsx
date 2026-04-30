'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Utensils, MapPin, Star, Heart, Bell, Settings, 
  LogOut, User, Loader2, TrendingUp, Users, BarChart3,
  PieChart, Target, Award, Calendar, Flame, Coffee,
  ChevronRight, Sparkles, Trophy
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

const DEMO_USER_REVIEWS = [
  { id: '1', venueName: 'Karadeniz Pide', venueSlug: 'karadeniz-pide', rating: 5, category: 'pide', createdAt: '2024-04-10' },
  { id: '2', venueName: 'Mandabatmaz', venueSlug: 'mandabatmaz', rating: 5, category: 'cafe', createdAt: '2024-04-08' },
  { id: '3', venueName: 'Çiya Sofrası', venueSlug: 'ciya-sofrasi', rating: 5, category: 'turkish', createdAt: '2024-04-05' },
  { id: '4', venueName: 'Karaköy Güllüoğlu', venueSlug: 'karakoy-gulluoglu', rating: 5, category: 'dessert', createdAt: '2024-04-02' },
  { id: '5', venueName: 'Burger King', venueSlug: 'burger-king-taksim', rating: 2, category: 'fast-food', createdAt: '2024-03-28' },
  { id: '6', venueName: 'Kronotrop', venueSlug: 'kronotrop-coffee', rating: 4, category: 'cafe', createdAt: '2024-03-25' },
  { id: '7', venueName: 'Sultanahmet Köftecisi', venueSlug: 'sultanahmet-koftecisi', rating: 4, category: 'kebab', createdAt: '2024-03-20' },
  { id: '8', venueName: 'Big Chefs', venueSlug: 'big-chefs-zorlu', rating: 3, category: 'international', createdAt: '2024-03-15' },
  { id: '9', venueName: 'Mikla', venueSlug: 'mikla-restaurant', rating: 5, category: 'fine-dining', createdAt: '2024-03-10' },
];

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  'cafe': { label: 'Kafe', icon: '☕', color: 'bg-amber-500' },
  'turkish': { label: 'Türk Mutfağı', icon: '🍖', color: 'bg-red-500' },
  'dessert': { label: 'Tatlı', icon: '🍯', color: 'bg-pink-500' },
  'pide': { label: 'Pide & Lahmacun', icon: '🥟', color: 'bg-orange-500' },
  'kebab': { label: 'Kebap & Köfte', icon: '🍢', color: 'bg-rose-500' },
  'fast-food': { label: 'Fast Food', icon: '🍔', color: 'bg-yellow-500' },
  'fine-dining': { label: 'Fine Dining', icon: '🍽️', color: 'bg-purple-500' },
  'international': { label: 'Dünya Mutfağı', icon: '🌍', color: 'bg-blue-500' },
  'other': { label: 'Diğer', icon: '🍴', color: 'bg-gray-500' },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, hasHydrated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReviews: 0, totalVenues: 0, avgRating: 0,
    thisWeekReviews: 0, favoriteCategory: '', streak: 0,
  });

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    loadAnalytics();
  }, [isAuthenticated, hasHydrated, router]);

  const loadAnalytics = () => {
    const userReviewsKey = 'tastebuddy_user_reviews';
    const savedReviews = localStorage.getItem(userReviewsKey);
    const userReviews = savedReviews ? JSON.parse(savedReviews) : [];
    const allReviews = [...userReviews.map((r: any) => ({
      ...r, category: r.venueCategory?.name?.toLowerCase().replace(/\s+/g, '-') || 'other',
    })), ...DEMO_USER_REVIEWS];
    setReviews(allReviews);
    
    const totalReviews = allReviews.length;
    const uniqueVenues = new Set(allReviews.map((r: any) => r.venueSlug)).size;
    const avgRating = totalReviews > 0 ? allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews : 0;
    const oneWeekAgo = new Date(); oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekReviews = allReviews.filter((r: any) => new Date(r.createdAt) >= oneWeekAgo).length;
    const categoryCount: Record<string, number> = {};
    allReviews.forEach((r: any) => { const cat = r.category || 'other'; categoryCount[cat] = (categoryCount[cat] || 0) + 1; });
    const favoriteCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    setStats({ totalReviews, totalVenues: uniqueVenues, avgRating: Math.round(avgRating * 10) / 10, thisWeekReviews, favoriteCategory, streak: 5 });
    setIsLoading(false);
  };

  const handleLogout = () => { logout(); toast.success('Başarıyla çıkış yapıldı'); router.push('/'); };

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating, count: reviews.filter(r => r.rating === rating).length,
    percent: reviews.length > 0 ? Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100) : 0,
  }));

  const categoryDistribution = Object.entries(
    reviews.reduce((acc: Record<string, number>, r) => { const cat = r.category || 'other'; acc[cat] = (acc[cat] || 0) + 1; return acc; }, {})
  ).map(([category, count]) => ({
    category, count: count as number, percent: Math.round((count as number / reviews.length) * 100),
    ...CATEGORY_LABELS[category] || CATEGORY_LABELS['other'],
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const topVenues = Object.entries(
    reviews.reduce((acc: Record<string, { name: string; slug: string; count: number; totalRating: number }>, r) => {
      if (!acc[r.venueSlug]) { acc[r.venueSlug] = { name: r.venueName, slug: r.venueSlug, count: 0, totalRating: 0 }; }
      acc[r.venueSlug].count++; acc[r.venueSlug].totalRating += r.rating; return acc;
    }, {})
  ).map(([_, data]) => ({ ...data, avgRating: Math.round((data.totalRating / data.count) * 10) / 10 }))
   .sort((a, b) => b.count - a.count || b.avgRating - a.avgRating).slice(0, 5);

  if (!hasHydrated || !isAuthenticated) {
    return (<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>);
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card hidden lg:block">
        <div className="p-4 border-b"><Link href="/" className="flex items-center gap-2"><Utensils className="h-6 w-6 text-primary" /><span className="text-xl font-bold">TasteBuddy</span></Link></div>
        <nav className="p-4 space-y-2">
          <NavLink href="/dashboard" icon={<BarChart3 />} label="Analizlerim" active />
          <NavLink href="/feed" icon={<TrendingUp />} label="Akış" />
          <NavLink href="/explore" icon={<MapPin />} label="Keşfet" />
          <NavLink href="/dashboard/saved" icon={<Heart />} label="Kaydedilenler" />
          <NavLink href="/dashboard/friends" icon={<Users />} label="Arkadaşlar" />
          <NavLink href="/dashboard/notifications" icon={<Bell />} label="Bildirimler" />
          <NavLink href="/profile" icon={<User />} label="Profil" />
          <NavLink href="/dashboard/settings" icon={<Settings />} label="Ayarlar" />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
            <LogOut className="h-5 w-5" />Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="lg:ml-64">
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <div><h1 className="text-xl font-bold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />Kişisel Analizlerim</h1><p className="text-sm text-muted-foreground">Lezzet yolculuğun bir bakışta</p></div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/notifications" className="relative p-2 hover:bg-muted rounded-full"><Bell className="h-5 w-5 text-muted-foreground" /><span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" /></Link>
              <Link href="/profile" className="flex items-center gap-2"><div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">{user?.avatarUrl ? <Image src={user.avatarUrl} alt={user.displayName} width={32} height={32} className="rounded-full" /> : <User className="h-4 w-4 text-muted-foreground" />}</div><span className="hidden md:block font-medium">{user?.displayName}</span></Link>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {isLoading ? (<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard label="Toplam Değerlendirme" value={stats.totalReviews} icon={<Star className="h-5 w-5" />} color="bg-yellow-500" />
                <StatCard label="Farklı Mekan" value={stats.totalVenues} icon={<MapPin className="h-5 w-5" />} color="bg-blue-500" />
                <StatCard label="Ortalama Puan" value={stats.avgRating} icon={<Target className="h-5 w-5" />} color="bg-green-500" suffix="/5" />
                <StatCard label="Bu Hafta" value={stats.thisWeekReviews} icon={<Calendar className="h-5 w-5" />} color="bg-purple-500" />
                <StatCard label="Gün Serisi" value={stats.streak} icon={<Flame className="h-5 w-5" />} color="bg-orange-500" suffix=" gün" />
                <StatCard label="Rozet" value={8} icon={<Trophy className="h-5 w-5" />} color="bg-pink-500" />
              </div>

              <div className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center"><Sparkles className="h-6 w-6 text-primary" /></div><div><h2 className="text-lg font-bold">Lezzet Profilin</h2><p className="text-sm text-muted-foreground">Değerlendirmelerine göre lezzet tercihlerin</p></div></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/50 rounded-xl p-4"><p className="text-sm text-muted-foreground mb-1">Favori Kategori</p><p className="text-xl font-bold flex items-center gap-2">{CATEGORY_LABELS[stats.favoriteCategory]?.icon || '🍴'}{CATEGORY_LABELS[stats.favoriteCategory]?.label || 'Keşfediliyor'}</p></div>
                  <div className="bg-white/50 rounded-xl p-4"><p className="text-sm text-muted-foreground mb-1">Değerlendirme Stili</p><p className="text-xl font-bold">{stats.avgRating >= 4.5 ? '🌟 Pozitif' : stats.avgRating >= 3.5 ? '⚖️ Dengeli' : '🔍 Eleştirel'}</p></div>
                  <div className="bg-white/50 rounded-xl p-4"><p className="text-sm text-muted-foreground mb-1">Aktivite Seviyesi</p><p className="text-xl font-bold">{stats.thisWeekReviews >= 5 ? '🚀 Çok Aktif' : stats.thisWeekReviews >= 2 ? '💫 Aktif' : '😴 Sakin'}</p></div>
                  <div className="bg-white/50 rounded-xl p-4"><p className="text-sm text-muted-foreground mb-1">Keşif Skoru</p><p className="text-xl font-bold">{Math.round((stats.totalVenues / Math.max(stats.totalReviews, 1)) * 100)}% Kaşif</p></div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><PieChart className="h-5 w-5 text-primary" />Puan Dağılımı</h3>
                  <div className="space-y-3">
                    {ratingDistribution.map(({ rating, count, percent }) => (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-medium">{rating}</span></div>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden"><div className={`h-full transition-all duration-500 ${rating >= 4 ? 'bg-green-500' : rating === 3 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percent}%` }} /></div>
                        <span className="text-sm text-muted-foreground w-16 text-right">{count} ({percent}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border rounded-xl p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2"><Coffee className="h-5 w-5 text-primary" />Kategori Dağılımı</h3>
                  <div className="space-y-3">
                    {categoryDistribution.map(({ category, count, percent, label, icon, color }) => (
                      <div key={category} className="flex items-center gap-3">
                        <span className="text-xl w-8">{icon}</span>
                        <div className="flex-1"><div className="flex justify-between mb-1"><span className="text-sm font-medium">{label}</span><span className="text-sm text-muted-foreground">{count} değerlendirme</span></div><div className="h-2 bg-muted rounded-full overflow-hidden"><div className={`h-full ${color} transition-all duration-500`} style={{ width: `${percent}%` }} /></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4"><h3 className="font-semibold flex items-center gap-2"><Award className="h-5 w-5 text-primary" />En Çok Değerlendirdiğin Mekanlar</h3><Link href="/profile" className="text-sm text-primary hover:underline flex items-center gap-1">Tümünü Gör <ChevronRight className="h-4 w-4" /></Link></div>
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {topVenues.map((venue, index) => (
                    <Link key={venue.slug} href={`/venues/${venue.slug}`} className="bg-muted/50 rounded-xl p-4 hover:bg-muted transition-colors group">
                      <div className="flex items-center gap-2 mb-2"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-gray-400 text-white' : index === 2 ? 'bg-amber-600 text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}>{index + 1}</span><div className="flex items-center gap-1 text-sm"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{venue.avgRating}</div></div>
                      <p className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{venue.name}</p>
                      <p className="text-xs text-muted-foreground">{venue.count} değerlendirme</p>
                    </Link>
                  ))}
                </div>
              </div>

              {stats.totalReviews < 10 && (
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 flex items-center justify-between">
                  <div><h3 className="font-bold text-lg mb-1">Daha Fazla Keşfet! 🚀</h3><p className="text-white/80">{10 - stats.totalReviews} değerlendirme daha yap ve &quot;Aktif Kaşif&quot; rozetini kazan!</p></div>
                  <Link href="/explore" className="bg-white text-orange-500 px-6 py-3 rounded-xl font-semibold hover:bg-white/90 transition-colors">Keşfet</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavLink({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean; }) {
  return (<Link href={href} className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}><span className="[&>svg]:h-5 [&>svg]:w-5">{icon}</span>{label}</Link>);
}

function StatCard({ label, value, icon, color, suffix = '' }: { label: string; value: number; icon: React.ReactNode; color: string; suffix?: string; }) {
  return (<div className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow"><div className={`w-10 h-10 ${color} text-white rounded-lg flex items-center justify-center mb-3`}>{icon}</div><p className="text-2xl font-bold">{value}{suffix}</p><p className="text-sm text-muted-foreground">{label}</p></div>);
}
