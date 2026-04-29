import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn(sizeMap[size], 'fill-yellow-400 text-yellow-400')}
        />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className={cn(sizeMap[size], 'text-muted-foreground')} />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className={cn(sizeMap[size], 'fill-yellow-400 text-yellow-400')} />
          </div>
        </div>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star
          key={`empty-${i}`}
          className={cn(sizeMap[size], 'text-muted-foreground')}
        />
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}

interface InteractiveStarRatingProps {
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function InteractiveStarRating({
  value,
  onChange,
  maxRating = 5,
  size = 'md',
  className,
}: InteractiveStarRatingProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= value;

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(starValue)}
            className="focus:outline-none hover:scale-110 transition-transform"
          >
            <Star
              className={cn(
                sizeMap[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground hover:text-yellow-400'
              )}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm font-medium">{value} / {maxRating}</span>
    </div>
  );
}
