'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Compass, MapPin, Trophy, Bell, User, Utensils, BookOpen, Search,
  Star, Heart, Award, MessageCircle, ChevronRight, X, Check,
  BarChart3, Settings, LogOut, Users, Bookmark,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

/* ---------- Notification types & demo data ---------- */

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'badge' | 'review' | 'mention';
  title: string;
  body: string;
  avatarLetter: string;
  avatarColor: string;
  read: boolean;
  createdAt: string;       // ISO string
  href?: string;           // optional deep link
}

const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'like', title: 'Beğeni', body: 'Ahmet S. senin Çiya Sofrası değerlendirmeni beğendi.', avatarLetter: 'A', avatarColor: 'from-blue-400 to-blue-600', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), href: '/venues/ciya-sofrasi' },
  { id: 'n2', type: 'comment', title: 'Yorum', body: 'Zeynep K. değerlendirmene yorum yaptı: "Harika bir yer, teşekkürler!"', avatarLetter: 'Z', avatarColor: 'from-pink-400 to-rose-600', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: 'n3', type: 'badge', title: 'Yeni Rozet', body: '"Gurme Kaşif" rozetini kazandın! 🎉', avatarLetter: '🏅', avatarColor: 'from-amber-400 to-orange-500', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), href: '/badges' },
  { id: 'n4', type: 'follow', title: 'Takip', body: 'Mehmet Y. seni takip etmeye başladı.', avatarLetter: 'M', avatarColor: 'from-green-400 to-emerald-600', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), href: '/profile' },
  { id: 'n5', type: 'review', title: 'Değerlendirme', body: 'Arkadaşın Elif D. Karaköy Güllüoğlu\'nu değerlendirdi.', avatarLetter: 'E', avatarColor: 'from-purple-400 to-violet-600', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), href: '/venues/karakoy-gulluoglu' },
  { id: 'n6', type: 'mention', title: 'Bahsetme', body: 'Can B. senden bir yorumda bahsetti.', avatarLetter: 'C', avatarColor: 'from-teal-400 to-cyan-600', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

const NOTIF_ICON: Record<Notification['type'], React.ElementType> = {
  like: Heart,
  comment: MessageCircle,
  follow: User,
  badge: Award,
  review: Star,
  mention: MessageCircle,
};

/* ---------- Nav item arrays ---------- */

const NAV_ITEMS = [
  { href: '/feed', icon: Home, label: 'Akış' },
  { href: '/explore', icon: Compass, label: 'Keşfet' },
  { href: '/daily-guide', icon: BookOpen, label: 'Rehber' },
  { href: '/leaderboard', icon: Trophy, label: 'Sıralama' },
  // Bell & Profile handled separately as popups
];

const BOTTOM_NAV_ITEMS = [
  { href: '/feed', icon: Home, label: 'Akış' },
  { href: '/explore', icon: Compass, label: 'Keşfet' },
  { href: '/nearby', icon: MapPin, label: 'Yakında' },
  { href: '/leaderboard', icon: Trophy, label: 'Sıralama' },
  { href: '/profile', icon: User, label: 'Profil' },
];

const PROFILE_MENU_ITEMS = [
  { href: '/profile', icon: User, label: 'Profilim' },
  { href: '/dashboard', icon: BarChart3, label: 'Analizlerim' },
  { href: '/dashboard/saved', icon: Bookmark, label: 'Kaydedilenler' },
  { href: '/dashboard/friends', icon: Users, label: 'Arkadaşlar' },
  { href: '/dashboard/settings', icon: Settings, label: 'Ayarlar' },
];

/* ---------- Notification Popup ---------- */

function NotificationPopup({
  open,
  onClose,
  notifications,
  onMarkAllRead,
}: {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] bg-background border rounded-xl shadow-xl z-[999] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <span className="font-semibold">Bildirimler</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-primary hover:underline px-2 py-1 rounded-lg hover:bg-muted transition-colors"
              title="Tümünü okundu işaretle"
            >
              <Check className="h-4 w-4 inline mr-1" />
              Tümü okundu
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bell className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Henüz bildirim yok</p>
          </div>
        ) : (
          notifications.map((n) => {
            const TypeIcon = NOTIF_ICON[n.type];
            const Wrapper = n.href ? Link : 'div';
            const wrapperProps = n.href ? { href: n.href, onClick: onClose } : {};
            return (
              <Wrapper
                key={n.id}
                {...(wrapperProps as any)}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${
                  !n.read ? 'bg-primary/5' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${n.avatarColor} flex items-center justify-center text-white text-sm font-semibold shrink-0`}
                >
                  {n.avatarLetter}
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <TypeIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground">{n.title}</span>
                  </div>
                  <p className="text-sm leading-snug line-clamp-2">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: tr })}
                  </p>
                </div>
                {/* Unread dot */}
                {!n.read && (
                  <span className="w-2.5 h-2.5 bg-primary rounded-full shrink-0 mt-1" />
                )}
              </Wrapper>
            );
          })
        )}
      </div>

      {/* Footer */}
      <Link
        href="/dashboard/notifications"
        onClick={onClose}
        className="flex items-center justify-center gap-1 px-4 py-3 border-t text-sm font-medium text-primary hover:bg-muted/50 transition-colors"
      >
        Tüm bildirimleri gör
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

/* ---------- Profile Menu Popup ---------- */

function ProfileMenuPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout } = useAuthStore();

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleLogout = () => {
    logout();
    toast.success('Başarıyla çıkış yapıldı');
    onClose();
    router.push('/');
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[240px] bg-background border rounded-xl shadow-xl z-[999] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* User Info */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.displayName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{user?.displayName || 'Kullanıcı'}</p>
            <p className="text-xs text-muted-foreground truncate">@{user?.username || 'user'}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-1">
        {PROFILE_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
            >
              <Icon className="h-4 w-4 text-muted-foreground" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="border-t py-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  );
}

/* ---------- AppTopNav ---------- */

export function AppTopNav() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed';
    return pathname.startsWith(href);
  };

  const profileActive = pathname === '/profile' || pathname.startsWith('/dashboard');

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold hidden sm:block">TasteBuddy</span>
        </Link>

        {/* Search - desktop only */}
        <div className="hidden lg:flex items-center gap-1 bg-muted rounded-full px-4 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Mekan, yemek veya kullanıcı ara..."
            className="bg-transparent border-none outline-none text-sm w-64"
          />
        </div>

        {/* Nav Icons */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-lg transition-colors relative ${
                  active
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                title={item.label}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}

          {/* Bell / Notification button — popup instead of page navigation */}
          <div className="relative">
            <button
              onClick={() => { setShowNotifs((v) => !v); setShowProfile(false); }}
              className={`p-2 rounded-lg transition-colors relative ${
                showNotifs
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="Bildirimler"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            <NotificationPopup
              open={showNotifs}
              onClose={() => setShowNotifs(false)}
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
            />
          </div>

          {/* Profile button — dropdown menu */}
          <div className="relative">
            <button
              onClick={() => { setShowProfile((v) => !v); setShowNotifs(false); }}
              className={`p-2 rounded-lg transition-colors relative ${
                showProfile || profileActive
                  ? 'text-primary bg-primary/5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              title="Profil"
            >
              <User className="h-5 w-5" />
            </button>

            <ProfileMenuPopup
              open={showProfile}
              onClose={() => setShowProfile(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppBottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed';
    if (href === '/nearby') return pathname === '/nearby';
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="flex items-center justify-around py-2">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
