import Image from 'next/image';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
  xl: 'h-20 w-20',
};

const iconSizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
  xl: 'h-10 w-10',
};

export function Avatar({ src, alt = 'Avatar', size = 'md', className }: AvatarProps) {
  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-muted flex items-center justify-center',
        sizeMap[size],
        className
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={size === 'xl' ? '80px' : size === 'lg' ? '56px' : size === 'md' ? '40px' : '32px'}
        />
      ) : (
        <User className={cn('text-muted-foreground', iconSizeMap[size])} />
      )}
    </div>
  );
}
