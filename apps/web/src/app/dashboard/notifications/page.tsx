'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Bell, Star, Heart, UserPlus, MessageCircle, Check, Loader2,
  Utensils, TrendingUp, MapPin, Users, User, Settings, LogOut 
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { socialApi } from '@/lib/api';
import { toast } from 'sonner';
import { DashboardSidebar } from '@/components/dashboard-sidebar';

interface Notification {
  id: string;
  type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'REVIEW_LIKE' | 'NEW_REVIEW' | 'MENTION';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadNotifications();
  }, [isAuthenticated, hasHydrated]);

  const loadNotifications = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Demo data
      const demoNotifications: Notification[] = [
        {
          id: '1',
          type: 'FRIEND_REQUEST',
          title: 'Yeni Arkadaşlık İsteği',
          message: 'Zeynep Çelik size arkadaşlık isteği gönderdi',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        },
        {
          id: '2',
          type: 'REVIEW_LIKE',
          title: 'Değerlendirmeniz Beğenildi',
          message: 'Ahmet Yılmaz, Lezzet Durağı için yaptığınız değerlendirmeyi beğendi',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: '3',
          type: 'FRIEND_ACCEPTED',
          title: 'Arkadaşlık İsteği Kabul Edildi',
          message: 'Mehmet Kaya arkadaşlık isteğinizi kabul etti',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
        {
          id: '4',
          type: 'NEW_REVIEW',
          title: 'Yeni Değerlendirme',
          message: 'Ayşe Demir, Kahve Molası için yeni bir değerlendirme yaptı',
          isRead: true,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        },
      ];
      
      setNotifications(demoNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await socialApi.markNotificationRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('Tüm bildirimler okundu olarak işaretlendi');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'FRIEND_REQUEST':
      case 'FRIEND_ACCEPTED':
        return <UserPlus className="h-5 w-5" />;
      case 'REVIEW_LIKE':
        return <Heart className="h-5 w-5" />;
      case 'NEW_REVIEW':
        return <Star className="h-5 w-5" />;
      case 'MENTION':
        return <MessageCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
          <div className="px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Bildirimler</h1>
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                  {unreadCount} yeni
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Tümünü okundu işaretle
              </button>
            )}
          </div>
        </header>
        <div className="lg:hidden px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">Bildirimler</h1>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {unreadCount} yeni
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              Tümünü okundu işaretle
            </button>
          )}
        </div>

        <div className="p-4 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Henüz bildirim yok</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                  className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                    notification.isRead 
                      ? 'bg-card' 
                      : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    notification.isRead 
                      ? 'bg-muted text-muted-foreground' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium ${!notification.isRead && 'text-primary'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatTime(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notification.message}
                    </p>
                  </div>
                  
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
