import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price?: number;
    averageScore?: number;
    reviewCount?: number;
    photos?: { url: string }[];
    venue?: { id: string; name: string; slug: string };
    itemType?: string;
  };
  showVenue?: boolean;
  className?: string;
}

export function ItemCard({ item, showVenue = true, className }: ItemCardProps) {
  const primaryPhoto = item.photos?.[0]?.url;

  return (
    <Link
      href={`/items/${item.slug}`}
      className={cn(
        'group block bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto}
            alt={item.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
        {item.itemType && (
          <span className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium capitalize">
            {item.itemType.toLowerCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
          {item.name}
        </h3>

        {showVenue && item.venue && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            at {item.venue.name}
          </p>
        )}

        {item.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {item.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-sm">
              {item.averageScore?.toFixed(1) || 'N/A'}
            </span>
            {item.reviewCount !== undefined && (
              <span className="text-muted-foreground text-xs">
                ({item.reviewCount})
              </span>
            )}
          </div>

          {item.price !== undefined && item.price > 0 && (
            <span className="font-medium text-sm">
              ${item.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

interface ItemCardSkeletonProps {
  className?: string;
}

export function ItemCardSkeleton({ className }: ItemCardSkeletonProps) {
  return (
    <div className={cn('bg-card border rounded-xl overflow-hidden', className)}>
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-5 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        <div className="flex justify-between">
          <div className="h-4 bg-muted rounded animate-pulse w-12" />
          <div className="h-4 bg-muted rounded animate-pulse w-10" />
        </div>
      </div>
    </div>
  );
}
