'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Compass, MapPin, Trophy, Bell, User, Utensils, BookOpen, Search,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/feed', icon: Home, label: 'Akış' },
  { href: '/explore', icon: Compass, label: 'Keşfet' },
  { href: '/daily-guide', icon: BookOpen, label: 'Rehber' },
  { href: '/leaderboard', icon: Trophy, label: 'Sıralama' },
  { href: '/dashboard/notifications', icon: Bell, label: 'Bildirimler', badge: true },
  { href: '/dashboard/profile', icon: User, label: 'Profil' },
];

const BOTTOM_NAV_ITEMS = [
  { href: '/feed', icon: Home, label: 'Akış' },
  { href: '/explore', icon: Compass, label: 'Keşfet' },
  { href: '/nearby', icon: MapPin, label: 'Yakında' },
  { href: '/leaderboard', icon: Trophy, label: 'Sıralama' },
  { href: '/dashboard/profile', icon: User, label: 'Profil' },
];

export function AppTopNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/feed') return pathname === '/feed';
    return pathname.startsWith(href);
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
                {item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </Link>
            );
          })}
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
