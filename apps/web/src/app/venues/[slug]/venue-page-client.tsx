'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { 
  MapPin, Star, Clock, Phone, Globe, Heart, Share2, 
  ChevronLeft, Loader2, Navigation, Utensils, MessageSquarePlus, Send, X, Camera, ImagePlus
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';



// Dynamic import for Map
const VenueMap = dynamic(() => import('@/components/venue-map'), {
  ssr: false,
  loading: () => <div className="h-[200px] bg-muted rounded-lg animate-pulse" />,
});

interface VenueDetails {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  averageRating: number;
  reviewCount: number;
  priceLevel: number;
  photos: { id: string; url: string }[];
  category: { name: string; icon: string };
  openingHours?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  averageRating: number;
  reviewCount: number;
  photos: { url: string }[];
  category: { name: string };
  isPopular?: boolean;
}

interface Review {
  id: string;
  overallRating: number;
  comment?: string;
  createdAt: string;
  user: { displayName: string; avatarUrl?: string };
  likeCount: number;
  photos?: string[]; // Base64 or URLs
}

// Demo venue database with full details
const DEMO_VENUES: Record<string, VenueDetails> = {
  'nusr-et-steakhouse': {
    id: '1',
    name: 'Nusr-Et Steakhouse',
    slug: 'nusr-et-steakhouse',
    description: 'Salt Bae olarak bilinen Nusret Gökçe\'nin ünlü et restoranı. Premium kalite etler ve eşsiz sunum.',
    address: 'Etiler Mah. Nispetiye Cad. No:87',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0789,
    longitude: 29.0328,
    phone: '+90 212 358 0212',
    website: 'https://nusr-et.com.tr',
    averageRating: 4.5,
    reviewCount: 2450,
    priceLevel: 4,
    photos: [],
    category: { name: 'Türk Mutfağı', icon: '🥩' },
    openingHours: 'Pazartesi - Pazar: 12:00 - 00:00',
  },
  'karakoy-gulluoglu': {
    id: '2',
    name: 'Karaköy Güllüoğlu',
    slug: 'karakoy-gulluoglu',
    description: '1949\'dan beri İstanbul\'un en meşhur baklavacısı. Antep fıstıklı baklava ve çeşitli tatlılar.',
    address: 'Rıhtım Cad. Katlı Otopark Altı No:3-4',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0226,
    longitude: 28.9774,
    phone: '+90 212 293 0910',
    website: 'https://karakoygulluoglu.com',
    averageRating: 4.8,
    reviewCount: 5230,
    priceLevel: 2,
    photos: [],
    category: { name: 'Tatlıcı', icon: '🍯' },
    openingHours: 'Her gün: 07:00 - 23:00',
  },
  'mikla-restaurant': {
    id: '3',
    name: 'Mikla',
    slug: 'mikla-restaurant',
    description: 'Şef Mehmet Gürs\'ün imzasını taşıyan, Anadolu mutfağının modern yorumu. Boğaz manzaralı fine dining deneyimi.',
    address: 'The Marmara Pera, Meşrutiyet Cad. No:15',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0316,
    longitude: 28.9747,
    phone: '+90 212 293 5656',
    website: 'https://miklarestaurant.com',
    averageRating: 4.7,
    reviewCount: 890,
    priceLevel: 4,
    photos: [],
    category: { name: 'Fine Dining', icon: '🍽️' },
    openingHours: 'Salı - Cumartesi: 18:30 - 23:00\nPazar - Pazartesi: Kapalı',
  },
  'kronotrop-coffee': {
    id: '4',
    name: 'Kronotrop Coffee',
    slug: 'kronotrop-coffee',
    description: 'İstanbul\'un öncü 3. dalga kahve dükkanı. Özenle seçilmiş çekirdekler ve uzman baristalar.',
    address: 'Cihangir Mah. Akarsu Yokuşu Cad. No:3',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0308,
    longitude: 28.9839,
    phone: '+90 212 245 5353',
    website: 'https://kronotrop.com.tr',
    averageRating: 4.6,
    reviewCount: 1820,
    priceLevel: 2,
    photos: [],
    category: { name: 'Kafe', icon: '☕' },
    openingHours: 'Pazartesi - Cuma: 08:00 - 22:00\nHafta sonu: 09:00 - 23:00',
  },
  'ciya-sofrasi': {
    id: '5',
    name: 'Çiya Sofrası',
    slug: 'ciya-sofrasi',
    description: 'Musa Dağdeviren\'in ödüllü restoranı. Anadolu\'nun unutulmaya yüz tutmuş tarihi lezzetleri.',
    address: 'Caferağa Mah. Güneşlibahçe Sok. No:43',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 40.9903,
    longitude: 29.0293,
    phone: '+90 216 330 3190',
    website: 'https://ciya.com.tr',
    averageRating: 4.5,
    reviewCount: 3210,
    priceLevel: 2,
    photos: [],
    category: { name: 'Türk Mutfağı', icon: '🍲' },
    openingHours: 'Her gün: 11:00 - 22:00',
  },
  'big-chefs-zorlu': {
    id: '6',
    name: 'Big Chefs',
    slug: 'big-chefs-zorlu',
    description: 'Dünya mutfağından seçme lezzetler. Geniş menü ve şık ortam.',
    address: 'Zorlu Center, Levazım Mah.',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0677,
    longitude: 29.0165,
    phone: '+90 212 924 0000',
    website: 'https://bigchefs.com.tr',
    averageRating: 4.3,
    reviewCount: 4560,
    priceLevel: 3,
    photos: [],
    category: { name: 'Dünya Mutfağı', icon: '🌍' },
    openingHours: 'Her gün: 10:00 - 23:00',
  },
  'sunset-grill-bar': {
    id: '7',
    name: 'Sunset Grill & Bar',
    slug: 'sunset-grill-bar',
    description: 'Boğaz manzarası eşliğinde fine dining deneyimi. Canlı müzik ve özel etkinlikler.',
    address: 'Yol Sokak No:2, Ulus Parkı',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0731,
    longitude: 29.0483,
    phone: '+90 212 287 0357',
    website: 'https://sunsetgrillbar.com',
    averageRating: 4.4,
    reviewCount: 1290,
    priceLevel: 4,
    photos: [],
    category: { name: 'Fine Dining', icon: '🌅' },
    openingHours: 'Her gün: 18:00 - 02:00',
  },
  'karakoy-lokantasi': {
    id: '8',
    name: 'Karaköy Lokantası',
    slug: 'karakoy-lokantasi',
    description: 'Modern Türk meyhane mutfağı. Taze mezeler ve Ege lezzetleri.',
    address: 'Kemankeş Cad. No:37, Karaköy',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0234,
    longitude: 28.9761,
    phone: '+90 212 292 4455',
    website: 'https://karakoylokantasi.com',
    averageRating: 4.5,
    reviewCount: 2870,
    priceLevel: 3,
    photos: [],
    category: { name: 'Meyhane', icon: '🍻' },
    openingHours: 'Pazartesi - Cumartesi: 12:00 - 00:00\nPazar: Kapalı',
  },
  'burger-king-taksim': {
    id: '9',
    name: 'Burger King - Taksim',
    slug: 'burger-king-taksim',
    description: 'Fast food zinciri. Whopper ve çeşitli burger seçenekleri.',
    address: 'İstiklal Cad. No:8, Beyoğlu',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0370,
    longitude: 28.9850,
    phone: '+90 212 251 1234',
    website: 'https://burgerking.com.tr',
    averageRating: 3.8,
    reviewCount: 890,
    priceLevel: 1,
    photos: [],
    category: { name: 'Fast Food', icon: '🍔' },
    openingHours: 'Her gün: 09:00 - 02:00',
  },
  'starbucks-bebek': {
    id: '10',
    name: 'Starbucks - Bebek',
    slug: 'starbucks-bebek',
    description: 'Boğaz manzaralı kahve deneyimi. Özel içecekler ve tatlılar.',
    address: 'Cevdet Paşa Cad. No:34, Bebek',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0762,
    longitude: 29.0433,
    phone: '+90 212 263 5678',
    website: 'https://starbucks.com.tr',
    averageRating: 4.2,
    reviewCount: 1560,
    priceLevel: 2,
    photos: [],
    category: { name: 'Kafe', icon: '☕' },
    openingHours: 'Her gün: 07:00 - 23:00',
  },
  'balikci-sabahattin': {
    id: '11',
    name: 'Balıkçı Sabahattin',
    slug: 'balikci-sabahattin',
    description: '1927\'den beri İstanbul\'un en eski balık restoranı. Taze deniz mahsulleri.',
    address: 'Seyit Hasan Kuyu Sok. No:1, Sultanahmet',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0054,
    longitude: 28.9768,
    phone: '+90 212 458 1824',
    website: 'https://balikcisabahattin.com',
    averageRating: 4.6,
    reviewCount: 2340,
    priceLevel: 3,
    photos: [],
    category: { name: 'Balık Restoranı', icon: '🐟' },
    openingHours: 'Her gün: 12:00 - 23:00',
  },
  'hayvore-asmalimescit': {
    id: '12',
    name: 'Hayvore',
    slug: 'hayvore-asmalimescit',
    description: 'Karadeniz mutfağının en seçkin temsilcisi. Kuymak ve muhlama.',
    address: 'Asmalımescit Mah. Turnacıbaşı Cad. No:4',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0323,
    longitude: 28.9762,
    phone: '+90 212 245 7501',
    averageRating: 4.4,
    reviewCount: 1890,
    priceLevel: 2,
    photos: [],
    category: { name: 'Karadeniz Mutfağı', icon: '🧀' },
    openingHours: 'Her gün: 11:00 - 23:00',
  },
  'istanbul-modern-cafe': {
    id: '13',
    name: 'İstanbul Modern Cafe',
    slug: 'istanbul-modern-cafe',
    description: 'Sanat müzesi içinde Boğaz manzaralı şık kafe.',
    address: 'Meclis-i Mebusan Cad. Liman Sahası',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0264,
    longitude: 28.9826,
    phone: '+90 212 334 7300',
    website: 'https://istanbulmodern.org',
    averageRating: 4.3,
    reviewCount: 980,
    priceLevel: 3,
    photos: [],
    category: { name: 'Kafe', icon: '🎨' },
    openingHours: 'Salı - Pazar: 10:00 - 18:00\nPazartesi: Kapalı',
  },
  'gram': {
    id: '14',
    name: 'Gram',
    slug: 'gram',
    description: 'Minimalist tasarımlı brunch mekanı. Sağlıklı ve lezzetli seçenekler.',
    address: 'Şahkulu Mah. Galip Dede Cad. No:8, Galata',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0251,
    longitude: 28.9742,
    phone: '+90 212 243 1048',
    website: 'https://gram.com.tr',
    averageRating: 4.5,
    reviewCount: 2150,
    priceLevel: 2,
    photos: [],
    category: { name: 'Brunch', icon: '🥞' },
    openingHours: 'Her gün: 09:00 - 22:00',
  },
  'privato-cafe': {
    id: '15',
    name: 'Privato Cafe',
    slug: 'privato-cafe',
    description: 'Cihangir\'in sevilen kahve durağı. Sıcak atmosfer.',
    address: 'Cihangir Mah. Akarsu Cad. No:1',
    city: 'İstanbul',
    country: 'Türkiye',
    latitude: 41.0315,
    longitude: 28.9851,
    phone: '+90 212 251 5656',
    averageRating: 4.4,
    reviewCount: 1670,
    priceLevel: 2,
    photos: [],
    category: { name: 'Kafe', icon: '☕' },
    openingHours: 'Her gün: 08:30 - 23:00',
  },
};

// Demo menu items for each venue
const DEMO_MENUS: Record<string, MenuItem[]> = {
  'nusr-et-steakhouse': [
    { id: 'm1', name: 'Lokum Et', description: 'Özel marine edilmiş dana bonfile, Salt Bae sunumu', price: 850, averageRating: 4.8, reviewCount: 890, photos: [], category: { name: 'Ana Yemek' }, isPopular: true },
    { id: 'm2', name: 'Burger Köfte', description: 'El yapımı özel köfte, brioche ekmeği', price: 320, averageRating: 4.5, reviewCount: 456, photos: [], category: { name: 'Burger' } },
    { id: 'm3', name: 'Kaburga', description: 'Yavaş pişirilmiş dana kaburga, BBQ sos', price: 680, averageRating: 4.7, reviewCount: 234, photos: [], category: { name: 'Ana Yemek' }, isPopular: true },
    { id: 'm4', name: 'Antrikot', description: '400gr USDA Prime antrikot', price: 720, averageRating: 4.6, reviewCount: 567, photos: [], category: { name: 'Ana Yemek' } },
    { id: 'm5', name: 'Kemik İliği', description: 'Fırınlanmış kemik iliği, kruton', price: 180, averageRating: 4.4, reviewCount: 123, photos: [], category: { name: 'Başlangıç' } },
    { id: 'm6', name: 'Baklava', description: 'Antep fıstıklı ev yapımı baklava', price: 120, averageRating: 4.3, reviewCount: 89, photos: [], category: { name: 'Tatlı' } },
  ],
  'karakoy-gulluoglu': [
    { id: 'm1', name: 'Fıstıklı Baklava', description: 'Gaziantep fıstığı ile hazırlanan geleneksel baklava', price: 85, averageRating: 4.9, reviewCount: 2340, photos: [], category: { name: 'Baklava' }, isPopular: true },
    { id: 'm2', name: 'Cevizli Baklava', description: 'Taze ceviz ile hazırlanan baklava', price: 65, averageRating: 4.7, reviewCount: 890, photos: [], category: { name: 'Baklava' } },
    { id: 'm3', name: 'Şöbiyet', description: 'Kaymak dolgulu fıstıklı şöbiyet', price: 95, averageRating: 4.8, reviewCount: 1230, photos: [], category: { name: 'Baklava' }, isPopular: true },
    { id: 'm4', name: 'Burma Kadayıf', description: 'Fıstık dolgulu kadayıf', price: 75, averageRating: 4.6, reviewCount: 567, photos: [], category: { name: 'Kadayıf' } },
    { id: 'm5', name: 'Künefe', description: 'Hatay usulü peynirli künefe', price: 90, averageRating: 4.7, reviewCount: 890, photos: [], category: { name: 'Sıcak Tatlı' } },
    { id: 'm6', name: 'Türk Kahvesi', description: 'Geleneksel Türk kahvesi', price: 25, averageRating: 4.5, reviewCount: 456, photos: [], category: { name: 'İçecek' } },
  ],
  'mikla-restaurant': [
    { id: 'm1', name: 'Tadım Menüsü', description: '7 aşamalı şef menüsü, Anadolu lezzetleri', price: 1850, averageRating: 4.9, reviewCount: 234, photos: [], category: { name: 'Menü' }, isPopular: true },
    { id: 'm2', name: 'Kuzu But', description: 'Yavaş pişirilmiş kuzu but, mevsim sebzeleri', price: 520, averageRating: 4.7, reviewCount: 178, photos: [], category: { name: 'Ana Yemek' } },
    { id: 'm3', name: 'Levrek', description: 'Izgara levrek, enginar, zeytinyağı', price: 480, averageRating: 4.6, reviewCount: 145, photos: [], category: { name: 'Deniz Ürünü' } },
    { id: 'm4', name: 'Mantı', description: 'Şef yorumu modern mantı, yoğurt, sumak', price: 280, averageRating: 4.8, reviewCount: 289, photos: [], category: { name: 'Başlangıç' }, isPopular: true },
    { id: 'm5', name: 'Tatlı Menüsü', description: 'Üç çeşit tatlı, Türk kahvesi ile', price: 220, averageRating: 4.5, reviewCount: 123, photos: [], category: { name: 'Tatlı' } },
  ],
  'kronotrop-coffee': [
    { id: 'm1', name: 'Filter Coffee', description: 'V60, Chemex veya Aeropress, günün çekirdeği', price: 45, averageRating: 4.8, reviewCount: 890, photos: [], category: { name: 'Kahve' }, isPopular: true },
    { id: 'm2', name: 'Espresso', description: 'Çift shot espresso', price: 35, averageRating: 4.7, reviewCount: 567, photos: [], category: { name: 'Kahve' } },
    { id: 'm3', name: 'Flat White', description: 'Mikro köpüklü süt ile espresso', price: 55, averageRating: 4.6, reviewCount: 456, photos: [], category: { name: 'Kahve' }, isPopular: true },
    { id: 'm4', name: 'Cold Brew', description: '18 saat demleme soğuk kahve', price: 50, averageRating: 4.5, reviewCount: 234, photos: [], category: { name: 'Soğuk İçecek' } },
    { id: 'm5', name: 'Avokadolu Tost', description: 'Ekşi maya ekmek, avokado, poşe yumurta', price: 85, averageRating: 4.4, reviewCount: 178, photos: [], category: { name: 'Yiyecek' } },
    { id: 'm6', name: 'Brownie', description: 'Ev yapımı çikolatalı brownie', price: 45, averageRating: 4.3, reviewCount: 145, photos: [], category: { name: 'Tatlı' } },
  ],
  'ciya-sofrasi': [
    { id: 'm1', name: 'Tepsi Kebabı', description: 'Gaziantep usulü, tomatesli', price: 180, averageRating: 4.8, reviewCount: 890, photos: [], category: { name: 'Kebap' }, isPopular: true },
    { id: 'm2', name: 'Analı Kızlı', description: 'Mardin\'e özgü köfteli yaprak sarma', price: 145, averageRating: 4.7, reviewCount: 567, photos: [], category: { name: 'Ana Yemek' }, isPopular: true },
    { id: 'm3', name: 'Hamsili Pilav', description: 'Karadeniz usulü hamsi pilav', price: 120, averageRating: 4.6, reviewCount: 345, photos: [], category: { name: 'Ana Yemek' } },
    { id: 'm4', name: 'Mücver', description: 'Kabak mücveri, yoğurt ile', price: 65, averageRating: 4.5, reviewCount: 234, photos: [], category: { name: 'Başlangıç' } },
    { id: 'm5', name: 'Ezogelin Çorbası', description: 'Geleneksel mercimek çorbası', price: 45, averageRating: 4.4, reviewCount: 567, photos: [], category: { name: 'Çorba' } },
    { id: 'm6', name: 'Şekerpare', description: 'Antep fıstıklı şekerpare', price: 55, averageRating: 4.6, reviewCount: 234, photos: [], category: { name: 'Tatlı' } },
  ],
  'big-chefs-zorlu': [
    { id: 'm1', name: 'Somon Izgara', description: 'Norveç somonu, sebze garnisi', price: 280, averageRating: 4.5, reviewCount: 670, photos: [], category: { name: 'Deniz Ürünü' }, isPopular: true },
    { id: 'm2', name: 'Cheeseburger', description: 'Dana eti, cheddar, özel sos', price: 175, averageRating: 4.4, reviewCount: 890, photos: [], category: { name: 'Burger' }, isPopular: true },
    { id: 'm3', name: 'Caesar Salata', description: 'Marul, parmesan, kruton', price: 120, averageRating: 4.3, reviewCount: 456, photos: [], category: { name: 'Salata' } },
    { id: 'm4', name: 'Makarna Alfredo', description: 'Kremalı tavuklu makarna', price: 145, averageRating: 4.2, reviewCount: 345, photos: [], category: { name: 'Makarna' } },
    { id: 'm5', name: 'Cheesecake', description: 'New York usulü cheesecake', price: 85, averageRating: 4.5, reviewCount: 234, photos: [], category: { name: 'Tatlı' } },
  ],
  'sunset-grill-bar': [
    { id: 'm1', name: 'Beef Tenderloin', description: 'Dana bonfile, trüf sosu', price: 550, averageRating: 4.7, reviewCount: 230, photos: [], category: { name: 'Ana Yemek' }, isPopular: true },
    { id: 'm2', name: 'Sushi Platter', description: '20 parça karma sushi', price: 420, averageRating: 4.5, reviewCount: 180, photos: [], category: { name: 'Sushi' }, isPopular: true },
    { id: 'm3', name: 'Lobster', description: 'Izgara ıstakoz, tereyağı sosu', price: 780, averageRating: 4.8, reviewCount: 120, photos: [], category: { name: 'Deniz Ürünü' } },
    { id: 'm4', name: 'Mojito', description: 'Klasik mojito kokteyl', price: 95, averageRating: 4.4, reviewCount: 340, photos: [], category: { name: 'İçecek' } },
    { id: 'm5', name: 'Tiramisu', description: 'İtalyan tiramisu', price: 120, averageRating: 4.3, reviewCount: 156, photos: [], category: { name: 'Tatlı' } },
  ],
  'karakoy-lokantasi': [
    { id: 'm1', name: 'Mezeler Tabağı', description: 'Seçme 6 çeşit meze', price: 180, averageRating: 4.6, reviewCount: 890, photos: [], category: { name: 'Meze' }, isPopular: true },
    { id: 'm2', name: 'Ahtapot', description: 'Izgara ahtapot, zeytinyağı', price: 220, averageRating: 4.7, reviewCount: 456, photos: [], category: { name: 'Deniz Ürünü' }, isPopular: true },
    { id: 'm3', name: 'Levrek Buğulama', description: 'Taze levrek, sebze', price: 195, averageRating: 4.5, reviewCount: 345, photos: [], category: { name: 'Balık' } },
    { id: 'm4', name: 'Rakı', description: '35cl Yeni Rakı', price: 180, averageRating: 4.4, reviewCount: 567, photos: [], category: { name: 'İçecek' } },
    { id: 'm5', name: 'Kabak Tatlısı', description: 'Kaymak ile kabak tatlısı', price: 65, averageRating: 4.3, reviewCount: 234, photos: [], category: { name: 'Tatlı' } },
  ],
  'burger-king-taksim': [
    { id: 'm1', name: 'Whopper', description: 'Alevde ızgara et, domates, marul', price: 95, averageRating: 4.2, reviewCount: 450, photos: [], category: { name: 'Burger' }, isPopular: true },
    { id: 'm2', name: 'Double Whopper', description: 'Çift köfteli whopper', price: 130, averageRating: 4.3, reviewCount: 320, photos: [], category: { name: 'Burger' }, isPopular: true },
    { id: 'm3', name: 'Chicken Royale', description: 'Çıtır tavuk, mayonez', price: 85, averageRating: 4.0, reviewCount: 280, photos: [], category: { name: 'Burger' } },
    { id: 'm4', name: 'King Patates', description: 'Büyük boy patates kızartması', price: 35, averageRating: 3.9, reviewCount: 560, photos: [], category: { name: 'Yan Ürün' } },
    { id: 'm5', name: 'Onion Rings', description: 'Soğan halkası', price: 40, averageRating: 3.8, reviewCount: 230, photos: [], category: { name: 'Yan Ürün' } },
  ],
  'starbucks-bebek': [
    { id: 'm1', name: 'Caramel Macchiato', description: 'Vanilya, süt, espresso, karamel', price: 75, averageRating: 4.5, reviewCount: 670, photos: [], category: { name: 'Kahve' }, isPopular: true },
    { id: 'm2', name: 'Latte', description: 'Espresso, buharda ısıtılmış süt', price: 65, averageRating: 4.4, reviewCount: 890, photos: [], category: { name: 'Kahve' }, isPopular: true },
    { id: 'm3', name: 'Cold Brew', description: 'Soğuk demleme kahve', price: 70, averageRating: 4.3, reviewCount: 340, photos: [], category: { name: 'Soğuk İçecek' } },
    { id: 'm4', name: 'Chocolate Chip Cookie', description: 'Çikolata parçacıklı kurabiye', price: 35, averageRating: 4.2, reviewCount: 230, photos: [], category: { name: 'Atıştırmalık' } },
    { id: 'm5', name: 'Blueberry Muffin', description: 'Yaban mersinli muffin', price: 40, averageRating: 4.1, reviewCount: 180, photos: [], category: { name: 'Atıştırmalık' } },
  ],
  'balikci-sabahattin': [
    { id: 'm1', name: 'Balık Mezesi', description: '8 çeşit deniz mezesi', price: 280, averageRating: 4.8, reviewCount: 670, photos: [], category: { name: 'Meze' }, isPopular: true },
    { id: 'm2', name: 'Levrek Izgara', description: 'Günlük taze levrek', price: 380, averageRating: 4.7, reviewCount: 890, photos: [], category: { name: 'Balık' }, isPopular: true },
    { id: 'm3', name: 'Çupra Buğulama', description: 'Buharda çupra, sebze', price: 350, averageRating: 4.6, reviewCount: 456, photos: [], category: { name: 'Balık' } },
    { id: 'm4', name: 'Karides Güveç', description: 'Tereyağlı karides güveç', price: 220, averageRating: 4.5, reviewCount: 345, photos: [], category: { name: 'Deniz Ürünü' } },
    { id: 'm5', name: 'Palamut Dolma', description: 'Geleneksel palamut dolma', price: 190, averageRating: 4.4, reviewCount: 234, photos: [], category: { name: 'Ana Yemek' } },
  ],
  'hayvore-asmalimescit': [
    { id: 'm1', name: 'Kuymak', description: 'Karadeniz usulü peynirli mısır unu', price: 95, averageRating: 4.8, reviewCount: 890, photos: [], category: { name: 'Ana Yemek' }, isPopular: true },
    { id: 'm2', name: 'Muhlama', description: 'Tereyağlı mısır unu ve peynir', price: 90, averageRating: 4.7, reviewCount: 670, photos: [], category: { name: 'Ana Yemek' }, isPopular: true },
    { id: 'm3', name: 'Hamsi Tava', description: 'Karadeniz hamsisi, mısır unu', price: 120, averageRating: 4.6, reviewCount: 456, photos: [], category: { name: 'Balık' } },
    { id: 'm4', name: 'Laz Böreği', description: 'Geleneksel tatlı börek', price: 65, averageRating: 4.5, reviewCount: 345, photos: [], category: { name: 'Tatlı' } },
    { id: 'm5', name: 'Karalahana Çorbası', description: 'Karadeniz tarzı lahana çorbası', price: 55, averageRating: 4.4, reviewCount: 234, photos: [], category: { name: 'Çorba' } },
  ],
  'istanbul-modern-cafe': [
    { id: 'm1', name: 'Avokado Toast', description: 'Ekşi maya ekmek, avokado, yumurta', price: 110, averageRating: 4.5, reviewCount: 340, photos: [], category: { name: 'Brunch' }, isPopular: true },
    { id: 'm2', name: 'Eggs Benedict', description: 'Poşe yumurta, hollandaise', price: 125, averageRating: 4.4, reviewCount: 280, photos: [], category: { name: 'Brunch' }, isPopular: true },
    { id: 'm3', name: 'Club Sandwich', description: 'Tavuk, bacon, salata', price: 140, averageRating: 4.3, reviewCount: 190, photos: [], category: { name: 'Sandviç' } },
    { id: 'm4', name: 'Matcha Latte', description: 'Japon yeşil çayı, süt', price: 65, averageRating: 4.2, reviewCount: 150, photos: [], category: { name: 'İçecek' } },
    { id: 'm5', name: 'Carrot Cake', description: 'Havuçlu kek, cream cheese', price: 75, averageRating: 4.4, reviewCount: 120, photos: [], category: { name: 'Tatlı' } },
  ],
  'gram': [
    { id: 'm1', name: 'Gram Kahvaltı', description: 'Serpme kahvaltı, 2 kişilik', price: 320, averageRating: 4.7, reviewCount: 670, photos: [], category: { name: 'Kahvaltı' }, isPopular: true },
    { id: 'm2', name: 'Pancake', description: 'Yulaflı pancake, meyve', price: 95, averageRating: 4.6, reviewCount: 560, photos: [], category: { name: 'Brunch' }, isPopular: true },
    { id: 'm3', name: 'Açai Bowl', description: 'Açai, granola, meyve', price: 110, averageRating: 4.5, reviewCount: 340, photos: [], category: { name: 'Brunch' } },
    { id: 'm4', name: 'Avokado Salata', description: 'Quinoa, avokado, mevsim yeşillikleri', price: 125, averageRating: 4.4, reviewCount: 230, photos: [], category: { name: 'Salata' } },
    { id: 'm5', name: 'Smoothie', description: 'Muz, mango, chia tohumu', price: 75, averageRating: 4.3, reviewCount: 180, photos: [], category: { name: 'İçecek' } },
  ],
  'privato-cafe': [
    { id: 'm1', name: 'Latte', description: 'Espresso, buharda süt', price: 50, averageRating: 4.5, reviewCount: 560, photos: [], category: { name: 'Kahve' }, isPopular: true },
    { id: 'm2', name: 'Cappuccino', description: 'Espresso, köpüklü süt', price: 45, averageRating: 4.4, reviewCount: 450, photos: [], category: { name: 'Kahve' }, isPopular: true },
    { id: 'm3', name: 'Türk Kahvesi', description: 'Geleneksel Türk kahvesi', price: 30, averageRating: 4.6, reviewCount: 340, photos: [], category: { name: 'Kahve' } },
    { id: 'm4', name: 'Cheesecake', description: 'San Sebastian cheesecake', price: 70, averageRating: 4.5, reviewCount: 230, photos: [], category: { name: 'Tatlı' } },
    { id: 'm5', name: 'Tost', description: 'Kaşarlı tost', price: 55, averageRating: 4.2, reviewCount: 180, photos: [], category: { name: 'Yiyecek' } },
  ],
};

// Demo reviews for venues
const DEMO_REVIEWS: Record<string, Review[]> = {
  'nusr-et-steakhouse': [
    { id: 'r1', overallRating: 5, comment: 'Hayatımda yediğim en iyi et! Salt Bae sunumu ayrı bir deneyim.', createdAt: '2024-03-15', user: { displayName: 'Ahmet Y.' }, likeCount: 45 },
    { id: 'r2', overallRating: 4, comment: 'Et kalitesi mükemmel ama fiyatlar biraz yüksek.', createdAt: '2024-03-10', user: { displayName: 'Zeynep K.' }, likeCount: 23 },
    { id: 'r3', overallRating: 5, comment: 'Özel günler için ideal. Servis kusursuz.', createdAt: '2024-03-05', user: { displayName: 'Mehmet D.' }, likeCount: 18 },
  ],
  'karakoy-gulluoglu': [
    { id: 'r1', overallRating: 5, comment: 'En iyi baklava burda! 50 yıldır geliyorum, hiç değişmedi.', createdAt: '2024-03-18', user: { displayName: 'Fatma A.' }, likeCount: 89 },
    { id: 'r2', overallRating: 5, comment: 'Şöbiyet muhteşem, kaymağı ayrı güzel.', createdAt: '2024-03-12', user: { displayName: 'Ali V.' }, likeCount: 56 },
    { id: 'r3', overallRating: 4, comment: 'Kalite süper ama kuyruk çok uzun olabiliyor.', createdAt: '2024-03-08', user: { displayName: 'Ayşe B.' }, likeCount: 34 },
  ],
  'mikla-restaurant': [
    { id: 'r1', overallRating: 5, comment: 'Fine dining\'in Türkiye\'deki en iyi örneği. Boğaz manzarası bonus.', createdAt: '2024-03-20', user: { displayName: 'Cem T.' }, likeCount: 67 },
    { id: 'r2', overallRating: 5, comment: 'Tadım menüsü inanılmaz. Her tabak ayrı bir hikaye.', createdAt: '2024-03-14', user: { displayName: 'Elif S.' }, likeCount: 45 },
    { id: 'r3', overallRating: 4, comment: 'Harika deneyim ama rezervasyon şart.', createdAt: '2024-03-01', user: { displayName: 'Burak M.' }, likeCount: 23 },
  ],
  'kronotrop-coffee': [
    { id: 'r1', overallRating: 5, comment: 'İstanbul\'un en iyi filter kahvesi burada!', createdAt: '2024-03-22', user: { displayName: 'Can E.' }, likeCount: 78 },
    { id: 'r2', overallRating: 4, comment: 'Kahveler harika, mekan biraz küçük.', createdAt: '2024-03-16', user: { displayName: 'Deniz Y.' }, likeCount: 34 },
    { id: 'r3', overallRating: 5, comment: 'Baristalar çok bilgili, çekirdek önerileri muhteşem.', createdAt: '2024-03-10', user: { displayName: 'Selin K.' }, likeCount: 56 },
  ],
  'ciya-sofrasi': [
    { id: 'r1', overallRating: 5, comment: 'Anadolu mutfağının en otantik hali. Analı kızlı efsane!', createdAt: '2024-03-19', user: { displayName: 'Hakan R.' }, likeCount: 123 },
    { id: 'r2', overallRating: 5, comment: 'Her seferinde farklı yöre yemekleri deniyorum.', createdAt: '2024-03-13', user: { displayName: 'Gül N.' }, likeCount: 89 },
    { id: 'r3', overallRating: 4, comment: 'Lezzetler harika, bekleme süresi biraz uzun olabiliyor.', createdAt: '2024-03-07', user: { displayName: 'Ozan Ç.' }, likeCount: 45 },
  ],
  'big-chefs-zorlu': [
    { id: 'r1', overallRating: 4, comment: 'Menü çok geniş, kalite tutarlı.', createdAt: '2024-03-21', user: { displayName: 'Sibel T.' }, likeCount: 34 },
    { id: 'r2', overallRating: 5, comment: 'Cheesecake\'leri harikulade!', createdAt: '2024-03-17', user: { displayName: 'Murat K.' }, likeCount: 45 },
    { id: 'r3', overallRating: 4, comment: 'AVM içinde güzel bir alternatif.', createdAt: '2024-03-11', user: { displayName: 'Pınar S.' }, likeCount: 23 },
  ],
  'sunset-grill-bar': [
    { id: 'r1', overallRating: 5, comment: 'Gün batımı muhteşem! Yemekler de öyle.', createdAt: '2024-03-23', user: { displayName: 'Emre B.' }, likeCount: 89 },
    { id: 'r2', overallRating: 4, comment: 'Romantik akşam yemekleri için birebir.', createdAt: '2024-03-18', user: { displayName: 'Aylin G.' }, likeCount: 56 },
    { id: 'r3', overallRating: 5, comment: 'Sushi kalitesi çok iyi, Boğaz manzarasıyla harika.', createdAt: '2024-03-12', user: { displayName: 'Kerem A.' }, likeCount: 67 },
  ],
  'karakoy-lokantasi': [
    { id: 'r1', overallRating: 5, comment: 'Modern meyhane konseptinin en iyisi!', createdAt: '2024-03-20', user: { displayName: 'Serdar Ö.' }, likeCount: 78 },
    { id: 'r2', overallRating: 5, comment: 'Ahtapot tavsiye ederim, muhteşem pişiriyorlar.', createdAt: '2024-03-15', user: { displayName: 'Defne Y.' }, likeCount: 45 },
    { id: 'r3', overallRating: 4, comment: 'Mezeler harika, hafta sonları çok kalabalık.', createdAt: '2024-03-09', user: { displayName: 'Tolga C.' }, likeCount: 34 },
  ],
  'burger-king-taksim': [
    { id: 'r1', overallRating: 4, comment: 'Hızlı servis, Whopper her zamanki gibi lezzetli.', createdAt: '2024-03-22', user: { displayName: 'Canan M.' }, likeCount: 23 },
    { id: 'r2', overallRating: 3, comment: 'Normal fast food kalitesi.', createdAt: '2024-03-16', user: { displayName: 'Volkan E.' }, likeCount: 12 },
    { id: 'r3', overallRating: 4, comment: 'Taksim\'de acıkınca iyi bir seçenek.', createdAt: '2024-03-10', user: { displayName: 'Eda S.' }, likeCount: 18 },
  ],
  'starbucks-bebek': [
    { id: 'r1', overallRating: 5, comment: 'Bebek sahilinde kahve içmek ayrı güzel.', createdAt: '2024-03-24', user: { displayName: 'Onur K.' }, likeCount: 56 },
    { id: 'r2', overallRating: 4, comment: 'Manzara harika, kahve standart Starbucks kalitesi.', createdAt: '2024-03-19', user: { displayName: 'Başak L.' }, likeCount: 34 },
    { id: 'r3', overallRating: 4, comment: 'Hafta sonu çok kalabalık olabiliyor.', createdAt: '2024-03-13', user: { displayName: 'Taner U.' }, likeCount: 23 },
  ],
  'balikci-sabahattin': [
    { id: 'r1', overallRating: 5, comment: 'Sultanahmet\'in gizli cenneti! Balık çok taze.', createdAt: '2024-03-21', user: { displayName: 'Melek Ş.' }, likeCount: 89 },
    { id: 'r2', overallRating: 5, comment: '1927\'den beri bu kalite, inanılmaz.', createdAt: '2024-03-15', user: { displayName: 'Yusuf N.' }, likeCount: 67 },
    { id: 'r3', overallRating: 4, comment: 'Mezeler harika, ana yemekler biraz pahalı.', createdAt: '2024-03-08', user: { displayName: 'Nazan P.' }, likeCount: 45 },
  ],
  'hayvore-asmalimescit': [
    { id: 'r1', overallRating: 5, comment: 'Kuymak için İstanbul\'un en iyi adresi!', createdAt: '2024-03-23', user: { displayName: 'Berk İ.' }, likeCount: 78 },
    { id: 'r2', overallRating: 5, comment: 'Karadeniz mutfağını özleyenler için şart.', createdAt: '2024-03-17', user: { displayName: 'Sevgi A.' }, likeCount: 56 },
    { id: 'r3', overallRating: 4, comment: 'Muhlama efsane, mekan küçük ama samimi.', createdAt: '2024-03-11', user: { displayName: 'Arda T.' }, likeCount: 34 },
  ],
  'istanbul-modern-cafe': [
    { id: 'r1', overallRating: 4, comment: 'Müze gezmeden önce kahve molası için ideal.', createdAt: '2024-03-20', user: { displayName: 'Lale K.' }, likeCount: 34 },
    { id: 'r2', overallRating: 5, comment: 'Boğaz manzarası harika, brunch seçenekleri çeşitli.', createdAt: '2024-03-14', user: { displayName: 'Cenk D.' }, likeCount: 45 },
    { id: 'r3', overallRating: 4, comment: 'Şık ortam, fiyatlar biraz yüksek.', createdAt: '2024-03-07', user: { displayName: 'Pelin G.' }, likeCount: 23 },
  ],
  'gram': [
    { id: 'r1', overallRating: 5, comment: 'En iyi serpme kahvaltı burada! Her şey taze.', createdAt: '2024-03-22', user: { displayName: 'Gökhan B.' }, likeCount: 89 },
    { id: 'r2', overallRating: 5, comment: 'Pancake\'ler muhteşem, sağlıklı seçenekler bol.', createdAt: '2024-03-16', user: { displayName: 'İrem Ç.' }, likeCount: 67 },
    { id: 'r3', overallRating: 4, comment: 'Açai bowl çok lezzetli, bekleme süresi biraz uzun.', createdAt: '2024-03-10', user: { displayName: 'Barış Y.' }, likeCount: 45 },
  ],
  'privato-cafe': [
    { id: 'r1', overallRating: 5, comment: 'Cihangir\'in en samimi kafesi!', createdAt: '2024-03-21', user: { displayName: 'Nil S.' }, likeCount: 56 },
    { id: 'r2', overallRating: 4, comment: 'Türk kahvesi çok iyi, ortam huzurlu.', createdAt: '2024-03-15', user: { displayName: 'Umut K.' }, likeCount: 34 },
    { id: 'r3', overallRating: 5, comment: 'San Sebastian cheesecake denemelisiniz!', createdAt: '2024-03-09', user: { displayName: 'Filiz E.' }, likeCount: 45 },
  ],
};

// Default venue for unknown slugs
const getDefaultVenue = (slug: string): VenueDetails => ({
  id: slug,
  name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
  slug,
  description: 'Bu mekan hakkında detaylı bilgi yakında eklenecektir.',
  address: 'İstanbul',
  city: 'İstanbul',
  country: 'Türkiye',
  latitude: 41.0082,
  longitude: 28.9784,
  averageRating: 4.0,
  reviewCount: 0,
  priceLevel: 2,
  photos: [],
  category: { name: 'Restoran', icon: '🍽️' },
});

export default function VenueDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuthStore();
  
  const [venue, setVenue] = useState<VenueDetails | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'info'>('menu');
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Item review modal state
  const [reviewingItem, setReviewingItem] = useState<MenuItem | null>(null);
  const [itemRating, setItemRating] = useState(0);
  const [itemComment, setItemComment] = useState('');
  const [itemPhotos, setItemPhotos] = useState<string[]>([]);
  const [itemHoverRating, setItemHoverRating] = useState(0);
  
  // Get user info
  const { user } = useAuthStore();

  useEffect(() => {
    loadVenue();
  }, [slug]);

  const loadVenue = async () => {
    setIsLoading(true);
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Get venue from demo data or create default
    const venueData = DEMO_VENUES[slug] || getDefaultVenue(slug);
    setVenue(venueData);
    
    // Get menu and reviews (merge demo + user reviews from localStorage)
    setMenuItems(DEMO_MENUS[slug] || []);
    
    const demoReviews = DEMO_REVIEWS[slug] || [];
    const userReviewsKey = `tastebuddy_reviews_${slug}`;
    const savedReviews = localStorage.getItem(userReviewsKey);
    const userReviews: Review[] = savedReviews ? JSON.parse(savedReviews) : [];
    setReviews([...userReviews, ...demoReviews]);
    
    setIsLoading(false);
  };

  // Photo upload handler
  const handlePhotoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPhotos: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const files = e.target.files;
    if (!files) return;

    const maxPhotos = 5;
    const maxSize = 5 * 1024 * 1024; // 5MB

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        toast.error('Fotoğraf boyutu 5MB\'dan küçük olmalı');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotos((prev) => {
          if (prev.length >= maxPhotos) {
            toast.error(`Maksimum ${maxPhotos} fotoğraf yükleyebilirsiniz`);
            return prev;
          }
          return [...prev, result];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (
    index: number,
    photos: string[],
    setPhotos: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmitVenueReview = async () => {
    if (!isAuthenticated) {
      toast.error('Değerlendirme yapmak için giriş yapın');
      return;
    }
    
    if (reviewRating === 0) {
      toast.error('Lütfen bir puan verin');
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newReview: Review = {
      id: `user_${Date.now()}`,
      overallRating: reviewRating,
      comment: reviewComment.trim() || undefined,
      photos: reviewPhotos.length > 0 ? reviewPhotos : undefined,
      createdAt: new Date().toISOString().split('T')[0],
      user: { displayName: user?.displayName || 'Anonim Kullanıcı' },
      likeCount: 0,
    };
    
    // Save to localStorage
    const userReviewsKey = `tastebuddy_reviews_${slug}`;
    const savedReviews = localStorage.getItem(userReviewsKey);
    const userReviews: Review[] = savedReviews ? JSON.parse(savedReviews) : [];
    userReviews.unshift(newReview);
    localStorage.setItem(userReviewsKey, JSON.stringify(userReviews));
    
    // Update state
    setReviews(prev => [newReview, ...prev]);
    setReviewRating(0);
    setReviewComment('');
    setReviewPhotos([]);
    setShowReviewForm(false);
    setIsSubmitting(false);
    
    toast.success('Değerlendirmeniz kaydedildi!');
  };

  const handleSubmitItemReview = async () => {
    if (!isAuthenticated) {
      toast.error('Değerlendirme yapmak için giriş yapın');
      return;
    }
    
    if (!reviewingItem || itemRating === 0) {
      toast.error('Lütfen bir puan verin');
      return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const itemReview = {
      id: `item_${Date.now()}`,
      itemId: reviewingItem.id,
      itemName: reviewingItem.name,
      rating: itemRating,
      comment: itemComment.trim() || undefined,
      photos: itemPhotos.length > 0 ? itemPhotos : undefined,
      createdAt: new Date().toISOString().split('T')[0],
      user: user?.displayName || 'Anonim Kullanıcı',
    };
    
    // Save to localStorage
    const itemReviewsKey = `tastebuddy_item_reviews_${slug}`;
    const savedItemReviews = localStorage.getItem(itemReviewsKey);
    const itemReviews = savedItemReviews ? JSON.parse(savedItemReviews) : [];
    itemReviews.unshift(itemReview);
    localStorage.setItem(itemReviewsKey, JSON.stringify(itemReviews));
    
    // Reset form
    setItemRating(0);
    setItemComment('');
    setItemPhotos([]);
    setReviewingItem(null);
    setIsSubmitting(false);
    
    toast.success(`${reviewingItem.name} için değerlendirmeniz kaydedildi!`);
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Mekanı kaydetmek için giriş yapın');
      return;
    }
    
    setIsSaved(!isSaved);
    toast.success(isSaved ? 'Mekan kaydedilenlerden kaldırıldı' : 'Mekan kaydedildi!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: venue?.name,
          text: `${venue?.name} - TasteBuddy'de keşfet!`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopyalandı!');
    }
  };

  const openInMaps = () => {
    if (venue) {
      const url = `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`;
      window.open(url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Mekan bulunamadı</h1>
        <Link href="/explore" className="text-primary hover:underline">
          Keşfet&apos;e Dön
        </Link>
      </div>
    );
  }

  const mapVenues = [{
    id: venue.id,
    name: venue.name,
    slug: venue.slug,
    address: venue.address,
    latitude: venue.latitude,
    longitude: venue.longitude,
    averageRating: venue.averageRating,
    reviewCount: venue.reviewCount,
    priceLevel: venue.priceLevel,
    category: venue.category,
  }];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/explore" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-5 w-5" />
            Geri
          </Link>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`p-2 rounded-full hover:bg-muted transition-colors ${
                isSaved ? 'text-red-500' : 'text-muted-foreground'
              }`}
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 to-primary/5">
        <div className="w-full h-full flex items-center justify-center text-8xl">
          {venue.category?.icon || '🍽️'}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
          <div className="container mx-auto">
            <span className="inline-block bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium mb-2">
              {venue.category?.icon} {venue.category?.name}
            </span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {/* Venue Info */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl md:text-3xl font-bold">{venue.name}</h1>
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full shrink-0">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{venue.averageRating?.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">({venue.reviewCount})</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1 font-medium text-foreground">
              {Array(venue.priceLevel || 1).fill('₺').join('')}
            </span>
            <button 
              onClick={openInMaps}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <MapPin className="h-4 w-4" />
              {venue.address}, {venue.city}
              <Navigation className="h-3 w-3 ml-1" />
            </button>
          </div>
          
          {venue.description && (
            <p className="text-muted-foreground leading-relaxed">{venue.description}</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {venue.phone && (
            <a
              href={`tel:${venue.phone}`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <Phone className="h-4 w-4" />
              Ara
            </a>
          )}
          <button
            onClick={openInMaps}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors whitespace-nowrap"
          >
            <Navigation className="h-4 w-4" />
            Yol Tarifi
          </button>
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium hover:bg-secondary/80 transition-colors whitespace-nowrap"
            >
              <Globe className="h-4 w-4" />
              Web Sitesi
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-8">
            {([
              { key: 'menu', label: 'Menü', count: menuItems.length },
              { key: 'reviews', label: 'Değerlendirmeler', count: reviews.length },
              { key: 'info', label: 'Bilgiler' }
            ] as const).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {'count' in tab && tab.count > 0 && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'menu' && (
          <div>
            {menuItems.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz menü bilgisi eklenmemiş</p>
              </div>
            ) : (
              <>
                {/* Popular Items */}
                {menuItems.some(item => item.isPopular) && (
                  <div className="mb-8">
                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                      <span className="text-xl">🔥</span> Popüler
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {menuItems.filter(item => item.isPopular).map((item) => (
                        <MenuItemCard 
                          key={item.id} 
                          item={item} 
                          onRateClick={(item) => {
                            if (!isAuthenticated) {
                              toast.error('Değerlendirme yapmak için giriş yapın');
                              return;
                            }
                            setReviewingItem(item);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* All Menu Items by Category */}
                {Object.entries(
                  menuItems.reduce((acc, item) => {
                    const cat = item.category?.name || 'Diğer';
                    if (!acc[cat]) acc[cat] = [];
                    acc[cat].push(item);
                    return acc;
                  }, {} as Record<string, MenuItem[]>)
                ).map(([category, items]) => (
                  <div key={category} className="mb-8">
                    <h3 className="font-semibold text-lg mb-4">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <MenuItemCard 
                          key={item.id} 
                          item={item}
                          onRateClick={(item) => {
                            if (!isAuthenticated) {
                              toast.error('Değerlendirme yapmak için giriş yapın');
                              return;
                            }
                            setReviewingItem(item);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {/* Add Review Button & Form */}
            {!showReviewForm ? (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Değerlendirme yapmak için giriş yapın');
                    return;
                  }
                  setShowReviewForm(true);
                }}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-primary/30 rounded-xl text-primary hover:bg-primary/5 transition-colors"
              >
                <MessageSquarePlus className="h-5 w-5" />
                <span className="font-medium">Değerlendirme Yap</span>
              </button>
            ) : (
              <div className="bg-card border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Değerlendirmeniz</h3>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setReviewRating(0);
                      setReviewComment('');
                    }}
                    className="p-1 hover:bg-muted rounded-full"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Star Rating */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Puanınız</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= (hoverRating || reviewRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className="ml-2 text-lg font-semibold">{reviewRating}/5</span>
                    )}
                  </div>
                </div>
                
                {/* Comment */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Yorumunuz (opsiyonel)</p>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Deneyiminizi paylaşın..."
                    className="w-full p-3 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>

                {/* Photo Upload */}
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Fotoğraf Ekle (opsiyonel, maks. 5)</p>
                  <div className="flex flex-wrap gap-2">
                    {reviewPhotos.map((photo, index) => (
                      <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                        <img src={photo} alt={`Fotoğraf ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePhoto(index, reviewPhotos, setReviewPhotos)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X className="h-5 w-5 text-white" />
                        </button>
                      </div>
                    ))}
                    {reviewPhotos.length < 5 && (
                      <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                        <Camera className="h-5 w-5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground mt-1">Çek</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(e, setReviewPhotos)}
                        />
                      </label>
                    )}
                  </div>
                </div>
                
                {/* Submit Button */}
                <button
                  onClick={handleSubmitVenueReview}
                  disabled={reviewRating === 0 || isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Değerlendirmeyi Gönder
                    </>
                  )}
                </button>
              </div>
            )}

            {reviews.length === 0 && !showReviewForm ? (
              <div className="text-center py-12">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Henüz değerlendirme yok</p>
                <p className="text-sm text-muted-foreground">İlk değerlendirmeyi siz yapın!</p>
              </div>
            ) : reviews.length > 0 && (
              <>
                {/* Rating Summary */}
                <div className="bg-card border rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary">{venue.averageRating.toFixed(1)}</div>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= venue.averageRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{venue.reviewCount} değerlendirme</p>
                    </div>
                  </div>
                </div>
                
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-xl p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        {review.user.displayName.charAt(0)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{review.user.displayName}</span>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{review.overallRating}</span>
                          </div>
                        </div>
                        
                        {review.comment && (
                          <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                        )}

                        {/* Review Photos */}
                        {review.photos && review.photos.length > 0 && (
                          <div className="flex gap-2 mt-3 overflow-x-auto">
                            {review.photos.map((photo, index) => (
                              <div key={index} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                                <img
                                  src={photo}
                                  alt={`Değerlendirme fotoğrafı ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span>{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {review.likeCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Map */}
            <div className="rounded-xl overflow-hidden">
              <VenueMap
                venues={mapVenues}
                center={[venue.latitude, venue.longitude]}
                zoom={15}
                className="h-[250px]"
              />
            </div>
            
            {/* Info Cards */}
            <div className="grid gap-4">
              <div className="flex items-start gap-4 p-4 bg-card border rounded-xl">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Adres</p>
                  <p className="text-muted-foreground">{venue.address}, {venue.city}</p>
                  <button
                    onClick={openInMaps}
                    className="text-primary text-sm mt-2 hover:underline flex items-center gap-1"
                  >
                    Haritada Göster <Navigation className="h-3 w-3" />
                  </button>
                </div>
              </div>
              
              {venue.phone && (
                <div className="flex items-start gap-4 p-4 bg-card border rounded-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Telefon</p>
                    <a href={`tel:${venue.phone}`} className="text-primary hover:underline">
                      {venue.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {venue.website && (
                <div className="flex items-start gap-4 p-4 bg-card border rounded-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Web Sitesi</p>
                    <a 
                      href={venue.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {venue.website.replace('https://', '')}
                    </a>
                  </div>
                </div>
              )}
              
              {venue.openingHours && (
                <div className="flex items-start gap-4 p-4 bg-card border rounded-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Çalışma Saatleri</p>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {venue.openingHours}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Item Review Modal */}
      {reviewingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Ürünü Değerlendir</h3>
              <button
                onClick={() => {
                  setReviewingItem(null);
                  setItemRating(0);
                  setItemComment('');
                  setItemPhotos([]);
                }}
                className="p-1 hover:bg-muted rounded-full"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            
            {/* Item Info */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-4">
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl">
                {reviewingItem.category?.name === 'Kahve' ? '☕' :
                 reviewingItem.category?.name === 'Tatlı' ? '🍰' :
                 reviewingItem.category?.name === 'Başlangıç' ? '🥗' : '🍽️'}
              </div>
              <div>
                <p className="font-medium">{reviewingItem.name}</p>
                <p className="text-sm text-muted-foreground">{reviewingItem.category?.name}</p>
              </div>
            </div>
            
            {/* Star Rating */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Puanınız</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setItemRating(star)}
                    onMouseEnter={() => setItemHoverRating(star)}
                    onMouseLeave={() => setItemHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (itemHoverRating || itemRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
                {itemRating > 0 && (
                  <span className="ml-2 text-lg font-semibold">{itemRating}/5</span>
                )}
              </div>
            </div>
            
            {/* Comment */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Yorumunuz (opsiyonel)</p>
              <textarea
                value={itemComment}
                onChange={(e) => setItemComment(e.target.value)}
                placeholder="Bu ürün hakkında ne düşündünüz?"
                className="w-full p-3 border rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Photo Upload */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">Fotoğraf Ekle (opsiyonel)</p>
              <div className="flex flex-wrap gap-2">
                {itemPhotos.map((photo, index) => (
                  <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                    <img src={photo} alt={`Fotoğraf ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(index, itemPhotos, setItemPhotos)}
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="h-4 w-4 text-white" />
                    </button>
                  </div>
                ))}
                {itemPhotos.length < 3 && (
                  <label className="w-16 h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => handlePhotoUpload(e, setItemPhotos)}
                    />
                  </label>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              onClick={handleSubmitItemReview}
              disabled={itemRating === 0 || isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Değerlendirmeyi Gönder
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItemCard({ item, onRateClick }: { item: MenuItem; onRateClick?: (item: MenuItem) => void }) {
  return (
    <div className="flex gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow bg-card">
      <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center text-3xl shrink-0">
        {item.category?.name === 'Kahve' ? '☕' :
         item.category?.name === 'Tatlı' ? '🍰' :
         item.category?.name === 'Başlangıç' ? '🥗' :
         item.category?.name === 'Çorba' ? '🍲' :
         item.category?.name === 'Baklava' ? '🍯' :
         item.category?.name === 'İçecek' ? '🥤' :
         item.category?.name === 'Burger' ? '🍔' :
         item.category?.name === 'Kebap' ? '🍢' :
         '🍽️'}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{item.name}</h3>
            {item.isPopular && (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Popüler</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{item.averageRating?.toFixed(1)}</span>
          </div>
        </div>
        
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {item.description}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {item.reviewCount} değerlendirme
          </span>
          <div className="flex items-center gap-2">
            {onRateClick && (
              <button
                onClick={() => onRateClick(item)}
                className="text-xs text-primary hover:underline font-medium"
              >
                Değerlendir
              </button>
            )}
            {item.price && (
              <span className="font-semibold text-primary">₺{item.price}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

