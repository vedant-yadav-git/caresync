import { clsx, type ClassValue } from 'clsx';

// ============================================
// CLASS NAME UTILITY
// ============================================

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

// ============================================
// PRIORITY HELPERS
// ============================================

export function getPriorityWeight(priority: 'LOW' | 'MEDIUM' | 'HIGH'): number {
  switch (priority) {
    case 'HIGH':
      return 3;
    case 'MEDIUM':
      return 2;
    case 'LOW':
      return 1;
    default:
      return 0;
  }
}

export function getPriorityColor(priority: 'LOW' | 'MEDIUM' | 'HIGH'): string {
  switch (priority) {
    case 'HIGH':
      return 'badge-high';
    case 'MEDIUM':
      return 'badge-medium';
    case 'LOW':
      return 'badge-low';
    default:
      return 'badge-low';
  }
}

export function getPriorityLabel(priority: 'LOW' | 'MEDIUM' | 'HIGH'): string {
  switch (priority) {
    case 'HIGH':
      return 'High';
    case 'MEDIUM':
      return 'Medium';
    case 'LOW':
      return 'Low';
    default:
      return priority;
  }
}

// ============================================
// STATUS HELPERS
// ============================================

export function getStatusColor(status: 'OPEN' | 'IN_PROGRESS' | 'DONE'): string {
  switch (status) {
    case 'DONE':
      return 'badge-done';
    case 'IN_PROGRESS':
      return 'badge-in-progress';
    case 'OPEN':
      return 'badge-open';
    default:
      return 'badge-open';
  }
}

export function getStatusLabel(status: 'OPEN' | 'IN_PROGRESS' | 'DONE'): string {
  switch (status) {
    case 'DONE':
      return 'Done';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'OPEN':
      return 'Open';
    default:
      return status;
  }
}

// ============================================
// STRING UTILITIES
// ============================================

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + '...';
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// ============================================
// NUMBER UTILITIES
// ============================================

export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============================================
// ARRAY UTILITIES
// ============================================

export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

export function sortBy<T>(
  array: T[],
  keyFn: (item: T) => string | number | Date | null,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    if (aVal === null) return direction === 'asc' ? 1 : -1;
    if (bVal === null) return direction === 'asc' ? -1 : 1;
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// ============================================
// RANDOM UTILITIES
// ============================================

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// ============================================
// COLOR UTILITIES
// ============================================

const TAG_COLORS = [
  'bg-rose-100 text-rose-700',
  'bg-orange-100 text-orange-700',
  'bg-amber-100 text-amber-700',
  'bg-lime-100 text-lime-700',
  'bg-emerald-100 text-emerald-700',
  'bg-teal-100 text-teal-700',
  'bg-cyan-100 text-cyan-700',
  'bg-sky-100 text-sky-700',
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-purple-100 text-purple-700',
  'bg-fuchsia-100 text-fuchsia-700',
  'bg-pink-100 text-pink-700',
];

export function getTagColor(tag: string): string {
  // Generate a consistent color based on tag string
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
}

// ============================================
// AVATAR COLORS
// ============================================

const AVATAR_COLORS = [
  'bg-brand-500',
  'bg-sage-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-violet-500',
];

export function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
