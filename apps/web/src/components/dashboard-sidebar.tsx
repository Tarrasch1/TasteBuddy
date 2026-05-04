'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Utensils, BarChart3, TrendingUp, MapPin, Heart, Users,
  Bell, User, Settings, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

const SIDEBAR_ITEMS = [
  { href: '/dashboard', icon: BarChart3, label: 'Analizlerim' },
  { href: '/feed', icon: TrendingUp, label: 'Akış' },
  { href: '/explore', icon: MapPin, label: 'Keşfet' },
  { href: '/dashboard/saved', icon: Heart, label: 'Kaydedilenler' },
  { href: '/dashboard/friends', icon: Users, label: 'Arkadaşlar' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Bildirimler' },
  { href: '/profile', icon: User, label: 'Profil' },
  { href: '/dashboard/settings', icon: Settings, label: 'Ayarlar' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    if (href === '/feed') return pathname === '/feed';
    if (href === '/explore') return pathname.startsWith('/explore');
    if (href === '/profile') return pathname === '/profile';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    toast.success('Başarıyla çıkış yapıldı');
    router.push('/');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card hidden lg:block z-40">
      <div className="p-4 border-b">
        <Link href="/feed" className="flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">TasteBuddy</span>
        </Link>
      </div>

      <nav className="p-4 space-y-2">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
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
  );
}
