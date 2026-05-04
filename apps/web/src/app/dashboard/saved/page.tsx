'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Heart, MapPin, Star, Loader2, Trash2, 
  Utensils, TrendingUp, Users, Bell, User, Settings, LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { socialApi } from '@/lib/api';
import { toast } from 'sonner';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

interface SavedVenue {
  id: string;
  venue: {
    id: string;
    name: string;
    slug: string;
    address: string;
    averageRating: number;
    reviewCount: number;
    category: { name: string; icon: string };
  };
  note?: string;
  savedAt: string;
}

export default function SavedPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [savedVenues, setSavedVenues] = useState<SavedVenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadSavedVenues();
  }, [isAuthenticated, hasHydrated]);

  const loadSavedVenues = async () => {
    try {
      // Demo data
      await new Promise(resolve => setTimeout(resolve, 300));
      const demoSaved: SavedVenue[] = [
        {
          id: '1',
          venue: {
            id: 'v1',
            name: 'Lezzet Durağı',
            slug: 'lezzet-duragi',
            address: 'Bağdat Caddesi No: 123',
            averageRating: 4.5,
            reviewCount: 128,
            category: { name: 'Türk Mutfağı', icon: '🍖' },
          },
          note: 'Hafta sonu gitmek için',
          savedAt: new Date().toISOString(),
        },
        {
          id: '2',
          venue: {
            id: 'v2',
            name: 'Kahve Molası',
            slug: 'kahve-molasi',
            address: 'Moda Caddesi No: 45',
            averageRating: 4.8,
            reviewCount: 256,
            category: { name: 'Kafe', icon: '☕' },
          },
          savedAt: new Date().toISOString(),
        },
      ];
      setSavedVenues(demoSaved);
    } catch (error) {
      console.error('Failed to load saved venues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (venueId: string) => {
    try {
      await socialApi.unsaveVenue(venueId);
      setSavedVenues(prev => prev.filter(s => s.venue.id !== venueId));
      toast.success('Mekan kaydedilenlerden kaldırıldı');
    } catch (error) {
      toast.error('İşlem başarısız');
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
      <DashboardSidebar />

      {/* Main Content */}
      <main className="lg:ml-64">
        <header className="border-b bg-white/50 backdrop-blur-sm hidden lg:block sticky top-0 z-30">
          <div className="px-4 md:px-8 h-16 flex items-center">
            <h1 className="text-xl font-bold">Kaydedilen Mekanlar</h1>
          </div>
        </header>
        <div className="lg:hidden px-4 py-3 border-b">
          <h1 className="text-lg font-bold">Kaydedilen Mekanlar</h1>
        </div>

        <div className="p-4 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : savedVenues.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Henüz kaydedilen mekan yok</p>
              <Link
                href="/explore"
                className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Mekanları Keşfet
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedVenues.map((saved) => (
                <div
                  key={saved.id}
                  className="flex gap-4 p-4 border rounded-xl bg-card"
                >
                  <Link 
                    href={`/venues/${saved.venue.slug}`}
                    className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-2xl shrink-0"
                  >
                    {saved.venue.category.icon}
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link href={`/venues/${saved.venue.slug}`}>
                      <h3 className="font-semibold hover:text-primary transition-colors">
                        {saved.venue.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">{saved.venue.address}</p>
                    
                    <div className="flex items-center gap-3 mt-1 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {saved.venue.averageRating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        {saved.venue.reviewCount} değerlendirme
                      </span>
                    </div>
                    
                    {saved.note && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        "{saved.note}"
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleRemove(saved.venue.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
