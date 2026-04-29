'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { 
  Settings, User, Lock, Bell, Globe, Trash2, Loader2, Save,
  Utensils, TrendingUp, MapPin, Heart, Users, LogOut, Moon, Sun, ChevronRight 
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

interface ProfileForm {
  displayName: string;
  username: string;
  email: string;
  bio: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, logout, setUser } = useAuthStore();
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'notifications' | 'privacy' | 'danger'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      displayName: user?.displayName || '',
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
    },
  });

  const passwordForm = useForm<PasswordForm>();

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    friendRequests: true,
    reviewLikes: true,
    newFollowers: false,
  });

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      profileForm.reset({
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        bio: user.bio || '',
      });
    }
  }, [isAuthenticated, hasHydrated, user]);

  const handleProfileSubmit = async (data: ProfileForm) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser({ ...user!, ...data });
      toast.success('Profil güncellendi');
    } catch (error) {
      toast.error('Profil güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordForm) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      passwordForm.reset();
      toast.success('Şifre güncellendi');
    } catch (error) {
      toast.error('Şifre güncellenemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      logout();
      toast.success('Hesabınız silindi');
      router.push('/');
    } catch (error) {
      toast.error('Hesap silinemedi');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
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
          <NavLink href="/dashboard" icon={<TrendingUp />} label="Akış" />
          <NavLink href="/explore" icon={<MapPin />} label="Keşfet" />
          <NavLink href="/dashboard/saved" icon={<Heart />} label="Kaydedilenler" />
          <NavLink href="/dashboard/friends" icon={<Users />} label="Arkadaşlar" />
          <NavLink href="/dashboard/notifications" icon={<Bell />} label="Bildirimler" />
          <NavLink href="/dashboard/profile" icon={<User />} label="Profil" />
          <NavLink href="/dashboard/settings" icon={<Settings />} label="Ayarlar" active />
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
        <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="px-4 md:px-8 h-16 flex items-center">
            <h1 className="text-xl font-bold">Ayarlar</h1>
          </div>
        </header>

        <div className="p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            {/* Settings Navigation */}
            <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
              {[
                { id: 'profile', label: 'Profil', icon: User },
                { id: 'password', label: 'Şifre', icon: Lock },
                { id: 'notifications', label: 'Bildirimler', icon: Bell },
                { id: 'privacy', label: 'Görünüm', icon: Globe },
                { id: 'danger', label: 'Tehlikeli Bölge', icon: Trash2 },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </div>

            {/* Profile Settings */}
            {activeSection === 'profile' && (
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                <div className="bg-card border rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Profil Bilgileri</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Görünen Ad</label>
                      <input
                        {...profileForm.register('displayName')}
                        className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Kullanıcı Adı</label>
                      <input
                        {...profileForm.register('username')}
                        className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">E-posta</label>
                      <input
                        {...profileForm.register('email')}
                        type="email"
                        className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Biyografi</label>
                      <textarea
                        {...profileForm.register('bio')}
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        placeholder="Kendiniz hakkında birkaç şey yazın..."
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-6 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Password Settings */}
            {activeSection === 'password' && (
              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
                <div className="bg-card border rounded-xl p-6">
                  <h2 className="text-lg font-semibold mb-4">Şifre Değiştir</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Mevcut Şifre</label>
                      <input
                        {...passwordForm.register('currentPassword')}
                        type="password"
                        className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Yeni Şifre</label>
                      <input
                        {...passwordForm.register('newPassword')}
                        type="password"
                        className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Yeni Şifre (Tekrar)</label>
                      <input
                        {...passwordForm.register('confirmPassword')}
                        type="password"
                        className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="mt-6 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                    Şifreyi Güncelle
                  </button>
                </div>
              </form>
            )}

            {/* Notification Settings */}
            {activeSection === 'notifications' && (
              <div className="bg-card border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Bildirim Ayarları</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'E-posta Bildirimleri', desc: 'Önemli güncellemeleri e-posta ile al' },
                    { key: 'pushNotifications', label: 'Anlık Bildirimler', desc: 'Tarayıcı bildirimleri al' },
                    { key: 'friendRequests', label: 'Arkadaşlık İstekleri', desc: 'Yeni arkadaşlık istekleri için bildirim al' },
                    { key: 'reviewLikes', label: 'Değerlendirme Beğenileri', desc: 'Değerlendirmeleriniz beğenildiğinde bildirim al' },
                    { key: 'newFollowers', label: 'Yeni Takipçiler', desc: 'Biri sizi takip ettiğinde bildirim al' },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div>
                        <p className="font-medium">{setting.label}</p>
                        <p className="text-sm text-muted-foreground">{setting.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotificationSettings(prev => ({
                          ...prev,
                          [setting.key]: !prev[setting.key as keyof typeof prev]
                        }))}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          notificationSettings[setting.key as keyof typeof notificationSettings]
                            ? 'bg-primary'
                            : 'bg-muted'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                            notificationSettings[setting.key as keyof typeof notificationSettings]
                              ? 'translate-x-6'
                              : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy/Theme Settings */}
            {activeSection === 'privacy' && (
              <div className="bg-card border rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Görünüm Ayarları</h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-3">Tema</p>
                    <div className="flex gap-3">
                      {[
                        { id: 'light', label: 'Açık', icon: Sun },
                        { id: 'dark', label: 'Koyu', icon: Moon },
                        { id: 'system', label: 'Sistem', icon: Globe },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id as any)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                            theme === t.id
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          <t.icon className="h-4 w-4" />
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeSection === 'danger' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-red-700 mb-4">Tehlikeli Bölge</h2>
                
                <p className="text-sm text-red-600 mb-4">
                  Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                </p>
                
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Hesabımı Sil
                </button>
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
