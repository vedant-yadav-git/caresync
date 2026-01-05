'use client';

import { cn, getInitials, getAvatarColor } from '@/lib/utils';

interface AvatarProps {
  name: string | null | undefined;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  id?: string;
}

export function Avatar({ name, src, size = 'md', id = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initials = getInitials(name);
  const bgColor = getAvatarColor(id || name || '');

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'User avatar'}
        className={cn(
          'rounded-full object-cover ring-2 ring-white',
          sizeClasses[size]
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full text-white font-semibold ring-2 ring-white',
        sizeClasses[size],
        bgColor
      )}
    >
      {initials}
    </div>
  );
}
