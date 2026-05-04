'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Star, Users, Utensils } from 'lucide-react';
import { Header } from '@/components/header';
import { useAuthStore } from '@/stores/auth-store';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.push('/feed');
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Show loading while hydrating or redirecting
  if (!hasHydrated || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-12 sm:py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Keşfet, Puanla & Paylaş
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10">
              Kişisel lezzet yolculuğun burada başlıyor. Sevdiğin yemekleri puanla, 
              gizli hazineleri keşfet ve lezzet maceralarını arkadaşlarınla paylaş.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Puanlamaya Başla
              </Link>
              <Link
                href="/explore"
                className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg text-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Mekanları Keşfet
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Neden TasteBuddy?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Star className="h-8 w-8" />}
                title="Her Şeyi Puanla"
                description="Hem mekanları hem de tek tek yemekleri puanla. Favori mekanlarında tam olarak ne sipariş edeceğini artık bil."
              />
              <FeatureCard
                icon={<MapPin className="h-8 w-8" />}
                title="Konum Doğrulamalı"
                description="Konum doğrulama sistemimiz, değerlendirmelerin gerçekten mekanı ziyaret eden kişilerden geldiğini garanti eder."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8" />}
                title="Sosyal Keşif"
                description="Arkadaşlarını takip et, ne yediklerini gör ve kişiselleştirilmiş öneriler al."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              Lezzet yolculuğuna başlamaya hazır mısın?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              En iyi yemekleri keşfeden ve paylaşan binlerce yemek tutkununa katıl.
            </p>
            <Link
              href="/auth/register"
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors inline-block"
            >
              Ücretsiz Hesap Oluştur
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-primary" />
            <span className="font-semibold">TasteBuddy</span>
          </div>
          
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-foreground">Hakkımızda</Link>
            <Link href="/privacy" className="hover:text-foreground">Gizlilik</Link>
            <Link href="/terms" className="hover:text-foreground">Kullanım Şartları</Link>
            <Link href="/contact" className="hover:text-foreground">İletişim</Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TasteBuddy. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="bg-card p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
