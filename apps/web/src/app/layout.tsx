import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'TasteBuddy - Lezzetleri Keşfet & Puanla',
  description: 'Sosyal yemek ve mekan puanlama platformu. Ziyaret ettiğiniz mekanları ve sipariş ettiğiniz yemekleri puanlayın.',
  keywords: ['yemek', 'restoran', 'puanlama', 'değerlendirme', 'sosyal', 'lezzet'],
  authors: [{ name: 'TasteBuddy' }],
  openGraph: {
    title: 'TasteBuddy - Lezzetleri Keşfet & Puanla',
    description: 'Sosyal yemek ve mekan puanlama platformu',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
