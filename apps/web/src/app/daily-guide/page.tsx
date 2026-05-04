'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Utensils, MapPin, Star, ChevronRight, ChevronLeft,
  Home, Compass, Trophy, User, BookOpen, Check, Share2,
  Map, Coffee, Sun, Moon, Wine, Clock, Sparkles, Route,
  RotateCcw, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---
interface Region {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
}

interface MealType {
  id: string;
  label: string;
  icon: string;
  lucideIcon: React.ReactNode;
  timeRange: string;
}

interface GuideVenue {
  id: string;
  name: string;
  slug: string;
  category: { name: string; icon: string };
  address: string;
  region: string;
  averageRating: number;
  reviewCount: number;
  priceLevel: number;
  mealTypes: string[];
  estimatedTime: string; // tahmini ziyaret süresi
  description: string;
  lat: number;
  lng: number;
}

type Step = 'regions' | 'meals' | 'venues' | 'route';

// --- Data ---
const REGIONS: Region[] = [
  { id: 'kadikoy', name: 'Kadıköy', description: 'Sokak lezzetleri, kafeler ve meyhane kültürü', lat: 40.9903, lng: 29.0293 },
  { id: 'beyoglu', name: 'Beyoğlu', description: 'Tarihi mekanlar, gece hayatı ve dünya mutfakları', lat: 41.0336, lng: 28.9784 },
  { id: 'besiktas', name: 'Beşiktaş', description: 'Boğaz manzarası, balık restoranları', lat: 41.0422, lng: 29.0063 },
  { id: 'karakoy', name: 'Karaköy', description: 'Tatlıcılar, kahveciler ve modern restoranlar', lat: 41.0226, lng: 28.9774 },
  { id: 'uskudar', name: 'Üsküdar', description: 'Geleneksel Türk mutfağı ve Boğaz mekanları', lat: 41.0234, lng: 29.0157 },
  { id: 'sisli', name: 'Şişli', description: 'AVM restoranları ve uluslararası mutfaklar', lat: 41.0602, lng: 28.9877 },
  { id: 'nisantasi', name: 'Nişantaşı', description: 'Brunch mekanları, fine dining ve butik kafeler', lat: 41.0478, lng: 29.0005 },
  { id: 'sultanahmet', name: 'Sultanahmet', description: 'Tarihi lezzetler ve otantik mekanlar', lat: 41.0054, lng: 28.9768 },
];

const MEAL_TYPES: MealType[] = [
  { id: 'breakfast', label: 'Kahvaltı', icon: '🥐', lucideIcon: <Sun className="h-5 w-5" />, timeRange: '08:00 - 11:00' },
  { id: 'lunch', label: 'Öğle Yemeği', icon: '🍽️', lucideIcon: <Utensils className="h-5 w-5" />, timeRange: '12:00 - 14:00' },
  { id: 'dinner', label: 'Akşam Yemeği', icon: '🍷', lucideIcon: <Moon className="h-5 w-5" />, timeRange: '19:00 - 22:00' },
  { id: 'cocktail', label: 'Kokteyl', icon: '🍸', lucideIcon: <Wine className="h-5 w-5" />, timeRange: '17:00 - 00:00' },
  { id: 'coffee', label: 'Kahve', icon: '☕', lucideIcon: <Coffee className="h-5 w-5" />, timeRange: '09:00 - 18:00' },
];

const GUIDE_VENUES: GuideVenue[] = [
  // Kadıköy
  { id: 'gv1', name: 'Çiya Sofrası', slug: 'ciya-sofrasi', category: { name: 'Türk Mutfağı', icon: '🍲' }, address: 'Güneşlibahçe Sok, Kadıköy', region: 'kadikoy', averageRating: 4.7, reviewCount: 3210, priceLevel: 2, mealTypes: ['lunch', 'dinner'], estimatedTime: '1.5 saat', description: 'Anadolu mutfağının en otantik hali', lat: 40.9903, lng: 29.0293 },
  { id: 'gv2', name: 'Baylan Pastanesi', slug: 'baylan-pastanesi', category: { name: 'Pastane', icon: '🎂' }, address: 'Muvakkithane Cad, Kadıköy', region: 'kadikoy', averageRating: 4.6, reviewCount: 1430, priceLevel: 2, mealTypes: ['coffee', 'breakfast'], estimatedTime: '45 dk', description: 'Efsanevi Cup Griye ile tanınır', lat: 40.9908, lng: 29.0290 },
  { id: 'gv3', name: 'Kadıköy Çarşı Kahvaltıcısı', slug: 'kadikoy-carsi-kahvaltici', category: { name: 'Kahvaltıcı', icon: '🥐' }, address: 'Kadıköy Çarşı', region: 'kadikoy', averageRating: 4.3, reviewCount: 870, priceLevel: 2, mealTypes: ['breakfast'], estimatedTime: '1 saat', description: 'Geleneksel serpme kahvaltı', lat: 40.9915, lng: 29.0280 },
  { id: 'gv4', name: 'Borsam Taşfırın', slug: 'borsam-tasfirin', category: { name: 'Karadeniz', icon: '🧀' }, address: 'Moda Cad, Kadıköy', region: 'kadikoy', averageRating: 4.5, reviewCount: 2100, priceLevel: 2, mealTypes: ['breakfast', 'lunch'], estimatedTime: '1 saat', description: 'Karadeniz pideleri ve muhlama', lat: 40.9880, lng: 29.0310 },
  { id: 'gv5', name: 'Viktor Levi', slug: 'viktor-levi', category: { name: 'Bar', icon: '🍸' }, address: 'Kadife Sok, Kadıköy', region: 'kadikoy', averageRating: 4.2, reviewCount: 1560, priceLevel: 3, mealTypes: ['cocktail', 'dinner'], estimatedTime: '2 saat', description: 'Kadıköy\'ün en popüler barlarından', lat: 40.9870, lng: 29.0270 },

  // Beyoğlu
  { id: 'gv6', name: 'Mikla', slug: 'mikla-restaurant', category: { name: 'Fine Dining', icon: '🍽️' }, address: 'Beyoğlu, İstanbul', region: 'beyoglu', averageRating: 4.8, reviewCount: 890, priceLevel: 4, mealTypes: ['dinner'], estimatedTime: '2.5 saat', description: 'Boğaz manzarasında modern Türk mutfağı', lat: 41.0336, lng: 28.9784 },
  { id: 'gv7', name: 'Mandabatmaz', slug: 'mandabatmaz', category: { name: 'Kafe', icon: '☕' }, address: 'Beyoğlu, İstanbul', region: 'beyoglu', averageRating: 4.7, reviewCount: 1560, priceLevel: 1, mealTypes: ['coffee'], estimatedTime: '30 dk', description: 'İstanbul\'un efsanevi Türk kahvesi', lat: 41.0320, lng: 28.9747 },
  { id: 'gv8', name: 'Gram Beyoğlu', slug: 'gram-beyoglu', category: { name: 'Brunch', icon: '🥞' }, address: 'Beyoğlu, İstanbul', region: 'beyoglu', averageRating: 4.4, reviewCount: 1200, priceLevel: 3, mealTypes: ['breakfast', 'lunch'], estimatedTime: '1 saat', description: 'Sağlıklı ve modern brunch', lat: 41.0340, lng: 28.9790 },
  { id: 'gv9', name: 'Hayvore', slug: 'hayvore-asmalimescit', category: { name: 'Karadeniz', icon: '🧀' }, address: 'Asmalımescit, Beyoğlu', region: 'beyoglu', averageRating: 4.4, reviewCount: 1890, priceLevel: 2, mealTypes: ['lunch', 'dinner'], estimatedTime: '1 saat', description: 'Karadeniz mutfağının en iyi temsilcisi', lat: 41.0330, lng: 28.9770 },
  { id: 'gv10', name: 'Alex\'s Bar', slug: 'alexs-bar', category: { name: 'Kokteyl Bar', icon: '🍸' }, address: 'Beyoğlu, İstanbul', region: 'beyoglu', averageRating: 4.3, reviewCount: 780, priceLevel: 3, mealTypes: ['cocktail'], estimatedTime: '2 saat', description: 'Özel kokteylleri ile ünlü', lat: 41.0335, lng: 28.9780 },

  // Karaköy
  { id: 'gv11', name: 'Karaköy Güllüoğlu', slug: 'karakoy-gulluoglu', category: { name: 'Tatlıcı', icon: '🍯' }, address: 'Karaköy, İstanbul', region: 'karakoy', averageRating: 4.8, reviewCount: 5230, priceLevel: 2, mealTypes: ['coffee', 'breakfast'], estimatedTime: '45 dk', description: 'Efsanevi fıstıklı baklava', lat: 41.0226, lng: 28.9774 },
  { id: 'gv12', name: 'Karaköy Lokantası', slug: 'karakoy-lokantasi', category: { name: 'Meyhane', icon: '🍻' }, address: 'Karaköy, İstanbul', region: 'karakoy', averageRating: 4.5, reviewCount: 2870, priceLevel: 3, mealTypes: ['lunch', 'dinner'], estimatedTime: '2 saat', description: 'Modern meyhane deneyimi', lat: 41.0230, lng: 28.9780 },
  { id: 'gv13', name: 'Kronotrop Coffee', slug: 'kronotrop-coffee', category: { name: 'Kafe', icon: '☕' }, address: 'Karaköy, İstanbul', region: 'karakoy', averageRating: 4.6, reviewCount: 1820, priceLevel: 3, mealTypes: ['coffee'], estimatedTime: '40 dk', description: '3. dalga kahve kültürünün öncüsü', lat: 41.0220, lng: 28.9770 },

  // Beşiktaş
  { id: 'gv14', name: 'Sunset Grill & Bar', slug: 'sunset-grill-bar', category: { name: 'Fine Dining', icon: '🌅' }, address: 'Ulus, Beşiktaş', region: 'besiktas', averageRating: 4.4, reviewCount: 1290, priceLevel: 4, mealTypes: ['dinner', 'cocktail'], estimatedTime: '2.5 saat', description: 'Boğaz manzarasında fine dining ve kokteyl', lat: 41.0555, lng: 29.0340 },
  { id: 'gv15', name: 'House Café Ortaköy', slug: 'house-cafe-ortakoy', category: { name: 'Kafe', icon: '☕' }, address: 'Ortaköy, Beşiktaş', region: 'besiktas', averageRating: 4.2, reviewCount: 980, priceLevel: 3, mealTypes: ['breakfast', 'coffee'], estimatedTime: '1 saat', description: 'Boğaz kenarında kahvaltı', lat: 41.0473, lng: 29.0264 },
  { id: 'gv16', name: 'Balıkçı Kahraman', slug: 'balikci-kahraman', category: { name: 'Balık', icon: '🐟' }, address: 'Beşiktaş Çarşı', region: 'besiktas', averageRating: 4.4, reviewCount: 1100, priceLevel: 3, mealTypes: ['lunch', 'dinner'], estimatedTime: '1.5 saat', description: 'Taze balık ve deniz ürünleri', lat: 41.0430, lng: 29.0050 },

  // Nişantaşı
  { id: 'gv17', name: 'Gram Nişantaşı', slug: 'gram-nisantasi', category: { name: 'Sağlıklı', icon: '🥗' }, address: 'Nişantaşı, Şişli', region: 'nisantasi', averageRating: 4.5, reviewCount: 2150, priceLevel: 3, mealTypes: ['breakfast', 'lunch'], estimatedTime: '1 saat', description: 'Sağlıklı ve lezzetli brunch', lat: 41.0480, lng: 29.0010 },
  { id: 'gv18', name: 'Espresso Lab', slug: 'espresso-lab', category: { name: 'Kafe', icon: '☕' }, address: 'Nişantaşı, Şişli', region: 'nisantasi', averageRating: 4.5, reviewCount: 980, priceLevel: 3, mealTypes: ['coffee'], estimatedTime: '40 dk', description: 'Specialty coffee tutkunları için', lat: 41.0470, lng: 29.0000 },

  // Sultanahmet
  { id: 'gv19', name: 'Balıkçı Sabahattin', slug: 'balikci-sabahattin', category: { name: 'Balık', icon: '🐟' }, address: 'Sultanahmet, İstanbul', region: 'sultanahmet', averageRating: 4.6, reviewCount: 2340, priceLevel: 3, mealTypes: ['lunch', 'dinner'], estimatedTime: '2 saat', description: 'Tarihi yarımadanın en iyi balık restoranı', lat: 41.0054, lng: 28.9768 },
  { id: 'gv20', name: 'Sultanahmet Köftecisi', slug: 'sultanahmet-koftecisi', category: { name: 'Köfteci', icon: '🍖' }, address: 'Sultanahmet, İstanbul', region: 'sultanahmet', averageRating: 4.4, reviewCount: 3120, priceLevel: 1, mealTypes: ['lunch'], estimatedTime: '45 dk', description: '1920\'den beri efsanevi köfte', lat: 41.0060, lng: 28.9780 },

  // Üsküdar
  { id: 'gv21', name: 'Kanaat Lokantası', slug: 'kanaat-lokantasi', category: { name: 'Türk Mutfağı', icon: '🍖' }, address: 'Üsküdar, İstanbul', region: 'uskudar', averageRating: 4.5, reviewCount: 2800, priceLevel: 2, mealTypes: ['lunch', 'dinner'], estimatedTime: '1 saat', description: 'Geleneksel Türk ev yemekleri', lat: 41.0234, lng: 29.0157 },
  { id: 'gv22', name: 'Filizler Köftecisi', slug: 'filizler-koftecisi', category: { name: 'Köfteci', icon: '🍖' }, address: 'Üsküdar, İstanbul', region: 'uskudar', averageRating: 4.3, reviewCount: 1600, priceLevel: 1, mealTypes: ['lunch'], estimatedTime: '45 dk', description: 'Üsküdar\'ın meşhur köftecisi', lat: 41.0240, lng: 29.0150 },

  // Şişli
  { id: 'gv23', name: 'Big Chefs', slug: 'big-chefs-zorlu', category: { name: 'Dünya Mutfağı', icon: '🌍' }, address: 'Zorlu Center, Şişli', region: 'sisli', averageRating: 4.2, reviewCount: 1500, priceLevel: 3, mealTypes: ['lunch', 'dinner'], estimatedTime: '1.5 saat', description: 'Geniş menü ile dünya mutfakları', lat: 41.0610, lng: 28.9870 },
  { id: 'gv24', name: 'Happy Moon\'s', slug: 'happy-moons', category: { name: 'Aile', icon: '🌙' }, address: 'Cevahir AVM, Şişli', region: 'sisli', averageRating: 4.1, reviewCount: 1200, priceLevel: 2, mealTypes: ['breakfast', 'lunch', 'dinner'], estimatedTime: '1 saat', description: 'Aile dostu mekan', lat: 41.0620, lng: 28.9890 },
];

// --- Helper ---
const getPriceLabel = (level: number) => '₺'.repeat(level);

// Sort meal types by time order
const MEAL_ORDER: Record<string, number> = {
  breakfast: 1,
  coffee: 2,
  lunch: 3,
  dinner: 4,
  cocktail: 5,
};

export default function DailyGuidePage() {
  const [step, setStep] = useState<Step>('regions');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);

  // Bölgelere ve yemek tiplerine göre mekan filtreleme
  const availableVenues = useMemo(() => {
    return GUIDE_VENUES.filter(v =>
      selectedRegions.includes(v.region) &&
      v.mealTypes.some(mt => selectedMeals.includes(mt))
    ).sort((a, b) => b.averageRating - a.averageRating);
  }, [selectedRegions, selectedMeals]);

  // Seçilen mekanları rota sırasına koy (yemek tipine göre)
  const routeVenues = useMemo(() => {
    return GUIDE_VENUES
      .filter(v => selectedVenues.includes(v.id))
      .sort((a, b) => {
        const aMinOrder = Math.min(...a.mealTypes.map(mt => MEAL_ORDER[mt] ?? 99));
        const bMinOrder = Math.min(...b.mealTypes.map(mt => MEAL_ORDER[mt] ?? 99));
        return aMinOrder - bMinOrder;
      });
  }, [selectedVenues]);

  const toggleRegion = (regionId: string) => {
    setSelectedRegions(prev =>
      prev.includes(regionId) ? prev.filter(r => r !== regionId) : [...prev, regionId]
    );
  };

  const toggleMeal = (mealId: string) => {
    setSelectedMeals(prev =>
      prev.includes(mealId) ? prev.filter(m => m !== mealId) : [...prev, mealId]
    );
  };

  const toggleVenue = (venueId: string) => {
    setSelectedVenues(prev =>
      prev.includes(venueId) ? prev.filter(v => v !== venueId) : [...prev, venueId]
    );
  };

  const handleShareRoute = () => {
    if (routeVenues.length === 0) return;

    // Google Maps URL oluştur
    const waypoints = routeVenues.map(v => `${v.lat},${v.lng}`);
    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const waypointsMiddle = waypoints.slice(1, -1);

    let googleMapsUrl = `https://www.google.com/maps/dir/${origin}`;
    waypointsMiddle.forEach(wp => {
      googleMapsUrl += `/${wp}`;
    });
    if (waypoints.length > 1) {
      googleMapsUrl += `/${destination}`;
    }

    // Rota bilgisi oluştur
    const routeText = routeVenues.map((v, i) => `${i + 1}. ${v.name} (${v.category.name})`).join('\n');
    const fullText = `🗺️ TasteBuddy Günlük Rehber\n\n${routeText}\n\nHaritada görmek için: ${googleMapsUrl}`;

    if (navigator.share) {
      navigator.share({
        title: 'TasteBuddy Günlük Rehber',
        text: fullText,
        url: googleMapsUrl,
      }).catch(() => {
        navigator.clipboard.writeText(fullText);
        toast.success('Rota bilgisi kopyalandı!');
      });
    } else {
      navigator.clipboard.writeText(fullText);
      toast.success('Rota bilgisi kopyalandı!');
    }
  };

  const handleOpenInMaps = () => {
    if (routeVenues.length === 0) return;

    const waypoints = routeVenues.map(v => `${v.lat},${v.lng}`);
    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const waypointsMiddle = waypoints.slice(1, -1);

    let googleMapsUrl = `https://www.google.com/maps/dir/${origin}`;
    waypointsMiddle.forEach(wp => {
      googleMapsUrl += `/${wp}`;
    });
    if (waypoints.length > 1) {
      googleMapsUrl += `/${destination}`;
    }

    window.open(googleMapsUrl, '_blank');
  };

  const handleReset = () => {
    setStep('regions');
    setSelectedRegions([]);
    setSelectedMeals([]);
    setSelectedVenues([]);
  };

  const canProceedFromRegions = selectedRegions.length > 0;
  const canProceedFromMeals = selectedMeals.length > 0;
  const canProceedFromVenues = selectedVenues.length > 0;

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/feed" className="flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TasteBuddy</span>
          </Link>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold">Günlük Rehber</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { key: 'regions', label: 'Bölge', num: 1 },
            { key: 'meals', label: 'Öğün', num: 2 },
            { key: 'venues', label: 'Mekan', num: 3 },
            { key: 'route', label: 'Rota', num: 4 },
          ].map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step === s.key
                  ? 'bg-primary text-primary-foreground'
                  : ['regions', 'meals', 'venues', 'route'].indexOf(step) > i
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {['regions', 'meals', 'venues', 'route'].indexOf(step) > i ? (
                  <Check className="h-4 w-4" />
                ) : s.num}
              </div>
              <span className={`text-xs hidden sm:block ${step === s.key ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
              {i < 3 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  ['regions', 'meals', 'venues', 'route'].indexOf(step) > i ? 'bg-green-500' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Bölge Seçimi */}
        {step === 'regions' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">📍 Hangi bölgelerde olacaksın?</h1>
              <p className="text-muted-foreground">Bugün ziyaret etmek istediğin bölgeleri seç. Birden fazla seçebilirsin.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {REGIONS.map((region) => (
                <button
                  key={region.id}
                  onClick={() => toggleRegion(region.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedRegions.includes(region.id)
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{region.name}</h3>
                    {selectedRegions.includes(region.id) && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{region.description}</p>
                </button>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep('meals')}
                disabled={!canProceedFromRegions}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Devam Et
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Öğün Seçimi */}
        {step === 'meals' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">🍽️ Ne yemek istiyorsun?</h1>
              <p className="text-muted-foreground">Bugün hangi öğünleri planlıyorsun? Birden fazla seçebilirsin.</p>
            </div>

            <div className="space-y-3 mb-8">
              {MEAL_TYPES.map((meal) => (
                <button
                  key={meal.id}
                  onClick={() => toggleMeal(meal.id)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                    selectedMeals.includes(meal.id)
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
                  }`}
                >
                  <span className="text-3xl">{meal.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{meal.label}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {meal.timeRange}
                    </p>
                  </div>
                  {selectedMeals.includes(meal.id) && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep('regions')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                Geri
              </button>
              <button
                onClick={() => setStep('venues')}
                disabled={!canProceedFromMeals}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mekanları Gör
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Mekan Seçimi */}
        {step === 'venues' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">⭐ Mekanlarını seç</h1>
              <p className="text-muted-foreground">
                Seçimlerine uygun {availableVenues.length} mekan bulundu. Beğendiklerini seç, rota oluşturalım!
              </p>
            </div>

            {/* Meal type group headers */}
            {selectedMeals
              .sort((a, b) => (MEAL_ORDER[a] ?? 99) - (MEAL_ORDER[b] ?? 99))
              .map((mealId) => {
                const meal = MEAL_TYPES.find(m => m.id === mealId);
                const venuesForMeal = availableVenues.filter(v => v.mealTypes.includes(mealId));
                if (!meal || venuesForMeal.length === 0) return null;

                return (
                  <div key={mealId} className="mb-6">
                    <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <span>{meal.icon}</span>
                      {meal.label}
                      <span className="text-sm font-normal text-muted-foreground">({meal.timeRange})</span>
                    </h2>
                    <div className="space-y-3">
                      {venuesForMeal.map((venue) => (
                        <button
                          key={`${mealId}-${venue.id}`}
                          onClick={() => toggleVenue(venue.id)}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            selectedVenues.includes(venue.id)
                              ? 'border-primary bg-primary/5 shadow-md'
                              : 'border-muted hover:border-muted-foreground/30 hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl flex items-center justify-center text-2xl">
                              {venue.category.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold truncate">{venue.name}</h3>
                                {selectedVenues.includes(venue.id) && (
                                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center shrink-0 ml-2">
                                    <Check className="h-4 w-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{venue.description}</p>
                              <div className="flex items-center gap-3 text-sm">
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {venue.averageRating}
                                </span>
                                <span className="text-muted-foreground">{venue.reviewCount.toLocaleString()} yorum</span>
                                <span className="text-green-600">{getPriceLabel(venue.priceLevel)}</span>
                                <span className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {venue.estimatedTime}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {venue.address}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

            {availableVenues.length === 0 && (
              <div className="text-center py-12 bg-card border rounded-xl mb-6">
                <p className="text-muted-foreground">Bu bölge ve öğün kombinasyonunda mekan bulunamadı.</p>
                <button
                  onClick={() => setStep('regions')}
                  className="text-primary hover:underline mt-2"
                >
                  Seçimlerini değiştir
                </button>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep('meals')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                Geri
              </button>
              <button
                onClick={() => setStep('route')}
                disabled={!canProceedFromVenues}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Rotayı Oluştur
                <Route className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Rota Görünümü */}
        {step === 'route' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">🗺️ Günlük Rotan Hazır!</h1>
              <p className="text-muted-foreground">
                {routeVenues.length} mekanlık rotanı inceleyip paylaşabilirsin.
              </p>
            </div>

            {/* Rota timeline */}
            <div className="relative mb-8">
              {routeVenues.map((venue, index) => {
                const mealType = MEAL_TYPES.find(mt => venue.mealTypes.includes(mt.id));
                return (
                  <div key={venue.id} className="flex gap-4 mb-6 last:mb-0">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      {index < routeVenues.length - 1 && (
                        <div className="w-0.5 flex-1 bg-primary/20 my-2" />
                      )}
                    </div>

                    {/* Venue card */}
                    <div className="flex-1 bg-card border rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl flex items-center justify-center text-2xl">
                          {venue.category.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/venues/${venue.slug}`}
                            className="font-semibold hover:text-primary transition-colors"
                          >
                            {venue.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">{venue.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {venue.averageRating}
                            </span>
                            <span className="text-green-600">{getPriceLabel(venue.priceLevel)}</span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {venue.estimatedTime}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {venue.address}
                          </p>
                          {mealType && (
                            <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-2">
                              {mealType.icon} {mealType.label} • {mealType.timeRange}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleOpenInMaps}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <Map className="h-5 w-5" />
                Haritada Aç
                <ExternalLink className="h-4 w-4" />
              </button>

              <button
                onClick={handleShareRoute}
                className="w-full flex items-center justify-center gap-2 bg-card border py-3 rounded-xl font-medium hover:bg-muted transition-colors"
              >
                <Share2 className="h-5 w-5" />
                Rotayı Paylaş
              </button>
            </div>

            {/* Bottom actions */}
            <div className="flex justify-between">
              <button
                onClick={() => setStep('venues')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                Mekanları Düzenle
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-5 w-5" />
                Yeni Rehber Oluştur
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
        <div className="flex items-center justify-around py-3">
          <Link href="/feed" className="flex flex-col items-center text-muted-foreground">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Akış</span>
          </Link>
          <Link href="/explore" className="flex flex-col items-center text-muted-foreground">
            <Compass className="h-5 w-5" />
            <span className="text-xs mt-1">Keşfet</span>
          </Link>
          <Link href="/nearby" className="flex flex-col items-center text-muted-foreground">
            <MapPin className="h-5 w-5" />
            <span className="text-xs mt-1">Yakında</span>
          </Link>
          <Link href="/leaderboard" className="flex flex-col items-center text-muted-foreground">
            <Trophy className="h-5 w-5" />
            <span className="text-xs mt-1">Sıralama</span>
          </Link>
          <Link href="/dashboard/profile" className="flex flex-col items-center text-muted-foreground">
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
