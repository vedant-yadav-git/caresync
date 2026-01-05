'use client';

import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'brand' | 'sage' | 'amber' | 'red' | 'emerald';
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  color = 'brand',
}: StatsCardProps) {
  const colorClasses = {
    brand: 'bg-brand-50 text-brand-600',
    sage: 'bg-sage-50 text-sage-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="mt-1 text-3xl font-display font-bold text-slate-800">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'mt-1 text-sm font-medium',
                trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend.value >= 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'p-3 rounded-xl',
              colorClasses[color]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
