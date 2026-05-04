'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Utensils, BarChart3, TrendingUp, MapPin, Heart, Users,
  Bell, User, Settings, LogOut, Menu, X, ChevronLeft,
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

function SidebarContent({
  pathname,
  isActive,
  handleLogout,
  onNavClick,
}: {
  pathname: string;
  isActive: (href: string) => boolean;
  handleLogout: () => void;
  onNavClick?: () => void;
}) {
  return (
    <>
      <nav className="p-4 space-y-1">
        {SIDEBAR_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
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
          className="flex items-center gap-3 w-full px-4 py-2.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Çıkış Yap
        </button>
      </div>
    </>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

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
    setMobileOpen(false);
    router.push('/');
  };

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r bg-card hidden lg:block z-40">
        <div className="p-4 border-b">
          <Link href="/feed" className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TasteBuddy</span>
          </Link>
        </div>
        <SidebarContent
          pathname={pathname}
          isActive={isActive}
          handleLogout={handleLogout}
        />
      </aside>

      {/* Mobile top bar with hamburger */}
      <div className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/feed" className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <span className="font-bold">TasteBuddy</span>
          </Link>
          <Link href="/profile" className="p-2 -mr-2 hover:bg-muted rounded-lg transition-colors">
            <User className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>
      </div>

      {/* Mobile slide-out drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-black/40 animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-background shadow-xl animate-in slide-in-from-left duration-200 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/feed" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <Utensils className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">TasteBuddy</span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 relative overflow-y-auto">
              <SidebarContent
                pathname={pathname}
                isActive={isActive}
                handleLogout={handleLogout}
                onNavClick={() => setMobileOpen(false)}
              />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
