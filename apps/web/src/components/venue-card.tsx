import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import { cn, formatDistance } from '@/lib/utils';

interface VenueCardProps {
  venue: {
    id: string;
    name: string;
    slug: string;
    address?: string;
    averageScore?: number;
    reviewCount?: number;
    photos?: { url: string }[];
    category?: { name: string };
    distance?: number;
  };
  className?: string;
}

export function VenueCard({ venue, className }: VenueCardProps) {
  const primaryPhoto = venue.photos?.[0]?.url;

  return (
    <Link
      href={`/venues/${venue.slug}`}
      className={cn(
        'group block bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-muted">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto}
            alt={venue.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        {venue.category && (
          <span className="absolute top-2 left-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium">
            {venue.category.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
          {venue.name}
        </h3>

        {venue.address && (
          <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1 line-clamp-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            {venue.address}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">
              {venue.averageScore?.toFixed(1) || 'N/A'}
            </span>
            {venue.reviewCount !== undefined && (
              <span className="text-muted-foreground text-sm">
                ({venue.reviewCount})
              </span>
            )}
          </div>

          {venue.distance !== undefined && (
            <span className="text-sm text-muted-foreground">
              {formatDistance(venue.distance)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

interface VenueCardSkeletonProps {
  className?: string;
}

export function VenueCardSkeleton({ className }: VenueCardSkeletonProps) {
  return (
    <div className={cn('bg-card border rounded-xl overflow-hidden', className)}>
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-full" />
        <div className="flex justify-between">
          <div className="h-4 bg-muted rounded animate-pulse w-16" />
          <div className="h-4 bg-muted rounded animate-pulse w-12" />
        </div>
      </div>
    </div>
  );
}
