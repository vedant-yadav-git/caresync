import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  addWeeks,
  addMonths,
  differenceInDays,
  differenceInHours,
  parseISO,
} from 'date-fns';
import type { RecurrenceRule } from '@/types';

// ============================================
// FORMATTING
// ============================================

export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy h:mm a');
}

export function formatTime(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'h:mm a');
}

export function formatRelative(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isYesterday(d)) return 'Yesterday';

  const daysDiff = differenceInDays(d, new Date());
  
  if (daysDiff > 0 && daysDiff <= 7) {
    return format(d, 'EEEE'); // Day name
  }
  
  if (daysDiff < 0 && daysDiff >= -7) {
    return `${Math.abs(daysDiff)} days ago`;
  }

  return format(d, 'MMM d');
}

export function formatTimeAgo(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

// ============================================
// DATE CHECKS
// ============================================

export function isOverdue(date: Date | string | null): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isPast(d) && !isToday(d);
}

export function isDueToday(date: Date | string | null): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isToday(d);
}

export function isDueSoon(date: Date | string | null, days: number = 7): boolean {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  const diff = differenceInDays(d, new Date());
  return diff > 0 && diff <= days;
}

export function getOverdueDays(date: Date | string | null): number {
  if (!date) return 0;
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isPast(d)) return 0;
  return Math.abs(differenceInDays(d, new Date()));
}

export function getOverdueHours(date: Date | string | null): number {
  if (!date) return 0;
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isPast(d)) return 0;
  return Math.abs(differenceInHours(d, new Date()));
}

// ============================================
// DATE RANGES
// ============================================

export function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfDay(now),
    end: endOfDay(now),
  };
}

export function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfWeek(now, { weekStartsOn: 0 }),
    end: endOfWeek(now, { weekStartsOn: 0 }),
  };
}

export function getUpcomingRange(days: number = 7): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfDay(now),
    end: endOfDay(addDays(now, days)),
  };
}

// ============================================
// RECURRENCE
// ============================================

export function getNextDueDate(
  currentDue: Date | null,
  rule: RecurrenceRule
): Date | null {
  if (!currentDue || rule === 'NONE') return null;

  const baseDate = currentDue;
  
  switch (rule) {
    case 'DAILY':
      return addDays(baseDate, 1);
    case 'WEEKLY':
      return addWeeks(baseDate, 1);
    case 'MONTHLY':
      return addMonths(baseDate, 1);
    default:
      return null;
  }
}

export function formatRecurrence(rule: RecurrenceRule): string {
  switch (rule) {
    case 'DAILY':
      return 'Repeats daily';
    case 'WEEKLY':
      return 'Repeats weekly';
    case 'MONTHLY':
      return 'Repeats monthly';
    default:
      return '';
  }
}

// ============================================
// CALENDAR HELPERS
// ============================================

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Add days from previous month to fill the first week
  const startDayOfWeek = firstDay.getDay();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push(addDays(firstDay, -i - 1));
  }
  
  // Add all days in the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add days from next month to fill the last week
  const endDayOfWeek = lastDay.getDay();
  for (let i = 1; i < 7 - endDayOfWeek; i++) {
    days.push(addDays(lastDay, i));
  }
  
  return days;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
