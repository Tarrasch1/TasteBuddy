'use client';

import { useState, useEffect } from 'react';
import { 
  X, Search, Star, Camera, Send, Loader2, MapPin, Plus, ChevronRight 
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

interface Venue {
  id: string;
  name: string;
  slug: string;
  address: string;
  category: { name: string; icon: string };
}

export interface NewReviewData {
  id: string;
  venueId: string;
  venueName: string;
  venueSlug: string;
  venueCategory: { name: string; icon: string };
  venueAddress: string;
  type: 'venue' | 'item';
  itemName: string | null;
  rating: number;
  comment: string | null;
  photos: string[] | null;
  createdAt: string;
  user: string;
}

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (review: NewReviewData) => void;
}

// Demo venues for search
const SEARCHABLE_VENUES: Venue[] = [
  { id: '1', name: 'Nusr-Et Steakhouse', slug: 'nusr-et-steakhouse', address: 'Etiler, İstanbul', category: { name: 'Türk Mutfağı', icon: '🥩' } },
  { id: '2', name: 'Karaköy Güllüoğlu', slug: 'karakoy-gulluoglu', address: 'Karaköy, İstanbul', category: { name: 'Tatlıcı', icon: '🍯' } },
  { id: '3', name: 'Mikla Restaurant', slug: 'mikla-restaurant', address: 'Beyoğlu, İstanbul', category: { name: 'Fine Dining', icon: '🍽️' } },
  { id: '4', name: 'Kronotrop Coffee', slug: 'kronotrop-coffee', address: 'Cihangir, İstanbul', category: { name: 'Kafe', icon: '☕' } },
  { id: '5', name: 'Çiya Sofrası', slug: 'ciya-sofrasi', address: 'Kadıköy, İstanbul', category: { name: 'Türk Mutfağı', icon: '🍲' } },
  { id: '6', name: 'Big Chefs', slug: 'big-chefs-zorlu', address: 'Zorlu Center, İstanbul', category: { name: 'Dünya Mutfağı', icon: '🌍' } },
  { id: '7', name: 'Sunset Grill & Bar', slug: 'sunset-grill-bar', address: 'Ulus, İstanbul', category: { name: 'Fine Dining', icon: '🌅' } },
  { id: '8', name: 'Karaköy Lokantası', slug: 'karakoy-lokantasi', address: 'Karaköy, İstanbul', category: { name: 'Meyhane', icon: '🍻' } },
  { id: '9', name: 'Köfteci Yusuf', slug: 'kofteci-yusuf-eminonu', address: 'Eminönü, İstanbul', category: { name: 'Türk Mutfağı', icon: '🍖' } },
  { id: '10', name: 'Gram', slug: 'gram', address: 'Nişantaşı, İstanbul', category: { name: 'Sağlıklı', icon: '🥗' } },
  { id: '11', name: 'Mandabatmaz', slug: 'mandabatmaz', address: 'Beyoğlu, İstanbul', category: { name: 'Kafe', icon: '☕' } },
  { id: '12', name: 'Balıkçı Sabahattin', slug: 'balikci-sabahattin', address: 'Sultanahmet, İstanbul', category: { name: 'Deniz Ürünleri', icon: '🐟' } },
];

export default function AddReviewModal({ isOpen, onClose, onSuccess }: AddReviewModalProps) {
  const { isAuthenticated, user } = useAuthStore();
  const [step, setStep] = useState<'venue' | 'rating' | 'details'>('venue');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [itemName, setItemName] = useState('');
  const [reviewType, setReviewType] = useState<'venue' | 'item'>('venue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('venue');
        setSearchQuery('');
        setSelectedVenue(null);
        setRating(0);
        setComment('');
        setPhotos([]);
        setItemName('');
        setReviewType('venue');
      }, 300);
    }
  }, [isOpen]);

  const filteredVenues = SEARCHABLE_VENUES.filter(venue =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const maxPhotos = 5;
    const maxSize = 5 * 1024 * 1024;

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

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedVenue || rating === 0) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Save to localStorage
    const reviewData: NewReviewData = {
      id: `user_${Date.now()}`,
      venueId: selectedVenue.id,
      venueName: selectedVenue.name,
      venueSlug: selectedVenue.slug,
      venueCategory: selectedVenue.category,
      venueAddress: selectedVenue.address,
      type: reviewType,
      itemName: reviewType === 'item' ? itemName : null,
      rating,
      comment: comment.trim() || null,
      photos: photos.length > 0 ? photos : null,
      createdAt: new Date().toISOString(),
      user: user?.displayName || 'Anonim',
    };

    // Save venue review
    const reviewsKey = `tastebuddy_reviews_${selectedVenue.slug}`;
    const existingReviews = localStorage.getItem(reviewsKey);
    const reviews = existingReviews ? JSON.parse(existingReviews) : [];
    reviews.unshift({
      id: reviewData.id,
      overallRating: rating,
      comment: reviewData.comment,
      photos: reviewData.photos,
      createdAt: new Date().toISOString().split('T')[0],
      user: { displayName: reviewData.user },
      likeCount: 0,
    });
    localStorage.setItem(reviewsKey, JSON.stringify(reviews));

    // Save to user's reviews
    const userReviewsKey = 'tastebuddy_user_reviews';
    const existingUserReviews = localStorage.getItem(userReviewsKey);
    const userReviews = existingUserReviews ? JSON.parse(existingUserReviews) : [];
    userReviews.unshift(reviewData);
    localStorage.setItem(userReviewsKey, JSON.stringify(userReviews));

    setIsSubmitting(false);
    toast.success('Değerlendirmeniz kaydedildi! 🎉');
    
    // Call success callback with review data
    if (onSuccess) {
      onSuccess(reviewData);
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Değerlendirme Ekle</h2>
            <p className="text-sm text-muted-foreground">
              {step === 'venue' && 'Mekan seçin'}
              {step === 'rating' && selectedVenue?.name}
              {step === 'details' && 'Detayları ekleyin'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 1: Select Venue */}
          {step === 'venue' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mekan ara..."
                  className="w-full pl-10 pr-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  autoFocus
                />
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredVenues.map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => {
                      setSelectedVenue(venue);
                      setStep('rating');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/50 hover:border-primary/50 transition-colors text-left"
                  >
                    <span className="text-2xl">{venue.category.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{venue.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {venue.address}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}

                {filteredVenues.length === 0 && searchQuery && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">Mekan bulunamadı</p>
                    <button className="text-primary text-sm flex items-center gap-1 mx-auto">
                      <Plus className="h-4 w-4" />
                      Yeni mekan ekle
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Rating */}
          {step === 'rating' && selectedVenue && (
            <div className="space-y-6">
              {/* Selected venue */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <span className="text-3xl">{selectedVenue.category.icon}</span>
                <div>
                  <p className="font-semibold">{selectedVenue.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedVenue.address}</p>
                </div>
              </div>

              {/* Review type */}
              <div>
                <p className="text-sm font-medium mb-3">Ne değerlendirmek istiyorsunuz?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReviewType('venue')}
                    className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
                      reviewType === 'venue'
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">🏪</span>
                    <span className="font-medium">Mekanı</span>
                  </button>
                  <button
                    onClick={() => setReviewType('item')}
                    className={`flex-1 p-3 rounded-xl border-2 transition-colors ${
                      reviewType === 'item'
                        ? 'border-primary bg-primary/5'
                        : 'border-muted hover:border-muted-foreground/30'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">🍽️</span>
                    <span className="font-medium">Ürünü</span>
                  </button>
                </div>
              </div>

              {/* Item name input */}
              {reviewType === 'item' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Ürün Adı</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Örn: Lahmacun, Türk Kahvesi..."
                    className="w-full px-4 py-3 border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Star rating */}
              <div>
                <p className="text-sm font-medium mb-3">Puanınız</p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground/50'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-center mt-2 text-lg font-semibold text-primary">
                    {rating === 1 && 'Çok Kötü 😞'}
                    {rating === 2 && 'Kötü 😕'}
                    {rating === 3 && 'Orta 😐'}
                    {rating === 4 && 'İyi 😊'}
                    {rating === 5 && 'Mükemmel! 🤩'}
                  </p>
                )}
              </div>

              <button
                onClick={() => setStep('details')}
                disabled={rating === 0 || (reviewType === 'item' && !itemName.trim())}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Devam Et
              </button>

              <button
                onClick={() => setStep('venue')}
                className="w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Farklı mekan seç
              </button>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 'details' && selectedVenue && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <span className="text-2xl">{selectedVenue.category.icon}</span>
                <div className="flex-1">
                  <p className="font-medium">{selectedVenue.name}</p>
                  {reviewType === 'item' && itemName && (
                    <p className="text-sm text-primary">{itemName}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{rating}</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Yorumunuz <span className="text-muted-foreground">(opsiyonel)</span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Deneyiminizi paylaşın..."
                  className="w-full p-3 border rounded-xl resize-none h-28 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              {/* Photo upload */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fotoğraf <span className="text-muted-foreground">(opsiyonel, maks. 5)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                      <img src={photo} alt={`Fotoğraf ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <X className="h-5 w-5 text-white" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                      <Camera className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">Çek</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handlePhotoUpload}
                        onClick={(e) => { (e.target as HTMLInputElement).value = ''; }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Değerlendirmeyi Paylaş
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('rating')}
                className="w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Puanı değiştir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
