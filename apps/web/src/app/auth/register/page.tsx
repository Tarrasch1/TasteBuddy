'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Utensils, Eye, EyeOff, Check, X } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@tastebuddy/shared';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');
  
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      setAuth(response.user, response.tokens);
      toast.success('Hesap başarıyla oluşturuldu!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Hesap oluşturulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Utensils className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">TasteBuddy</span>
          </Link>
          <h1 className="text-2xl font-bold">Hesap Oluştur</h1>
          <p className="text-muted-foreground mt-2">
            Favori yemeklerini keşfetmeye ve puanlamaya başla
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ornek@email.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="lezzetci123"
              {...register('username')}
            />
            {errors.username && (
              <p className="text-sm text-destructive mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-2">
              Görünen Ad
            </label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ahmet Yılmaz"
              {...register('displayName')}
            />
            {errors.displayName && (
              <p className="text-sm text-destructive mt-1">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Şifre
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                placeholder="••••••••"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
            
            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 space-y-1 text-sm">
                <PasswordCheck passed={passwordChecks.length} text="En az 8 karakter" />
                <PasswordCheck passed={passwordChecks.uppercase} text="Bir büyük harf" />
                <PasswordCheck passed={passwordChecks.lowercase} text="Bir küçük harf" />
                <PasswordCheck passed={passwordChecks.number} text="Bir rakam" />
              </div>
            )}
          </div>

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              className="mt-1 rounded border-input"
              required
            />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              <Link href="/terms" className="text-primary hover:underline">
                Kullanım Şartları
              </Link>{' '}
              ve{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Gizlilik Politikası
              </Link>'nı kabul ediyorum
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Hesap Oluştur
          </button>
        </form>

        <p className="text-center mt-6 text-muted-foreground">
          Zaten hesabın var mı?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  );
}

function PasswordCheck({ passed, text }: { passed: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 ${passed ? 'text-green-600' : 'text-muted-foreground'}`}>
      {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      <span>{text}</span>
    </div>
  );
}
