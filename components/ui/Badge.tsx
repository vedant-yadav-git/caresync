'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'low' | 'medium' | 'high' | 'done' | 'open' | 'in-progress';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700',
    low: 'badge-low',
    medium: 'badge-medium',
    high: 'badge-high',
    done: 'badge-done',
    open: 'badge-open',
    'in-progress': 'badge-in-progress',
  };

  return (
    <span className={cn('badge', variantClasses[variant], className)}>
      {children}
    </span>
  );
}
