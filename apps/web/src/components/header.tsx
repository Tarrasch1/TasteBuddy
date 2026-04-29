'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Utensils, User, LogOut, Settings, Bookmark, Bell } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = true }: HeaderProps) {
  const router = useRouter();
  const { isAuthenticated, user, hasHydrated, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  // Don't render auth buttons until hydration is complete
  const renderAuthSection = () => {
    if (!hasHydrated) {
      return (
        <div className="w-24 h-10 bg-muted animate-pulse rounded-lg" />
      );
    }

    if (isAuthenticated && user) {
      return (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
              {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-sm font-medium max-w-[100px] truncate">
              {user.displayName || user.username}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-background border rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b">
                <p className="font-medium truncate">{user.displayName || user.username}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
              
              <Link
                href="/dashboard"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profilim</span>
              </Link>
              
              <Link
                href="/dashboard/saved"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
              >
                <Bookmark className="h-4 w-4" />
                <span>Kaydedilenler</span>
              </Link>
              
              <Link
                href="/dashboard/notifications"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
              >
                <Bell className="h-4 w-4" />
                <span>Bildirimler</span>
              </Link>
              
              <Link
                href="/dashboard/settings"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Ayarlar</span>
              </Link>
              
              <div className="border-t mt-2 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 w-full hover:bg-muted transition-colors text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/login"
          className="text-muted-foreground hover:text-foreground px-4 py-2"
        >
          Giriş Yap
        </Link>
        <Link
          href="/auth/register"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Başla
        </Link>
      </div>
    );
  };

  return (
    <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">TasteBuddy</span>
        </Link>
        
        {showNav && (
          <div className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="text-muted-foreground hover:text-foreground">
              Keşfet
            </Link>
            <Link href="/nearby" className="text-muted-foreground hover:text-foreground">
              Yakınımda
            </Link>
            <Link href="/trending" className="text-muted-foreground hover:text-foreground">
              Popüler
            </Link>
          </div>
        )}
        
        {renderAuthSection()}
      </nav>
    </header>
  );
}
