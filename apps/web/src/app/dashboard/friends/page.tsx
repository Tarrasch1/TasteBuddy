'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, UserPlus, UserMinus, Search, Loader2, 
  Utensils, TrendingUp, MapPin, Heart, Bell, User, Settings, LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { socialApi } from '@/lib/api';
import { toast } from 'sonner';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

interface Friend {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  reviewCount: number;
  friendsSince: string;
}

interface FriendRequest {
  id: string;
  user: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export default function FriendsPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadFriends();
  }, [isAuthenticated, hasHydrated]);

  const loadFriends = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Demo data
      const demoFriends: Friend[] = [
        {
          id: '1',
          displayName: 'Ahmet Yılmaz',
          username: 'ahmetyilmaz',
          reviewCount: 45,
          friendsSince: '2024-01-15',
        },
        {
          id: '2',
          displayName: 'Ayşe Demir',
          username: 'aysedemir',
          reviewCount: 128,
          friendsSince: '2024-02-20',
        },
        {
          id: '3',
          displayName: 'Mehmet Kaya',
          username: 'mehmetkaya',
          reviewCount: 67,
          friendsSince: '2024-03-10',
        },
      ];
      
      const demoRequests: FriendRequest[] = [
        {
          id: 'r1',
          user: {
            id: 'u4',
            displayName: 'Zeynep Çelik',
            username: 'zeynepcelik',
          },
          createdAt: new Date().toISOString(),
        },
      ];
      
      setFriends(demoFriends);
      setRequests(demoRequests);
    } catch (error) {
      console.error('Failed to load friends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string, userId: string) => {
    try {
      await socialApi.acceptFriendRequest(requestId);
      const request = requests.find(r => r.id === requestId);
      if (request) {
        setFriends(prev => [...prev, {
          id: request.user.id,
          displayName: request.user.displayName,
          username: request.user.username,
          avatarUrl: request.user.avatarUrl,
          reviewCount: 0,
          friendsSince: new Date().toISOString(),
        }]);
      }
      setRequests(prev => prev.filter(r => r.id !== requestId));
      toast.success('Arkadaşlık isteği kabul edildi');
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setRequests(prev => prev.filter(r => r.id !== requestId));
    toast.success('Arkadaşlık isteği reddedildi');
  };

  const handleRemoveFriend = async (friendId: string) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
    toast.success('Arkadaş silindi');
  };

  const filteredFriends = friends.filter(f => 
    f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <h1 className="text-xl font-bold">Arkadaşlar</h1>
            {requests.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {requests.length} yeni istek
              </span>
            )}
          </div>
        </header>

        <div className="p-4 md:p-8">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Arkadaş ara..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b mb-6">
            <button
              onClick={() => setActiveTab('friends')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'friends'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              Arkadaşlar ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`pb-3 px-1 border-b-2 transition-colors ${
                activeTab === 'requests'
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              İstekler ({requests.length})
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : activeTab === 'friends' ? (
            filteredFriends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz arkadaşın yok'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center gap-4 p-4 border rounded-xl bg-card"
                  >
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      {friend.avatarUrl ? (
                        <img
                          src={friend.avatarUrl}
                          alt={friend.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{friend.displayName}</h3>
                      <p className="text-sm text-muted-foreground">@{friend.username}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {friend.reviewCount} değerlendirme
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                      title="Arkadaşlıktan çıkar"
                    >
                      <UserMinus className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            requests.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Bekleyen arkadaşlık isteği yok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 p-4 border rounded-xl bg-card"
                  >
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      {request.user.avatarUrl ? (
                        <img
                          src={request.user.avatarUrl}
                          alt={request.user.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{request.user.displayName}</h3>
                      <p className="text-sm text-muted-foreground">@{request.user.username}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAcceptRequest(request.id, request.user.id)}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                      >
                        Kabul Et
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                      >
                        Reddet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
