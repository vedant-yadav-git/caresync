'use client';

import { TrendingUp, TrendingDown, Award, Target, AlertCircle } from 'lucide-react';
import { cn, formatPercentage, getTagColor } from '@/lib/utils';
import type { WeeklySummary as WeeklySummaryType, Task } from '@/types';

interface WeeklySummaryProps {
  summary: WeeklySummaryType | null;
  memberStats?: {
    userId: string;
    name: string;
    completed: number;
    total: number;
  }[];
  suggestedFocus?: string[];
}

export function WeeklySummary({
  summary,
  memberStats = [],
  suggestedFocus = [],
}: WeeklySummaryProps) {
  if (!summary) {
    return (
      <div className="card p-6 text-center">
        <p className="text-slate-500">No summary data available yet.</p>
      </div>
    );
  }

  const isGoodWeek = summary.completionRate >= 0.7;
  const trend = summary.completionRate >= 0.5 ? 'up' : 'down';

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div
        className={cn(
          'card-elevated p-6',
          isGoodWeek
            ? 'bg-gradient-to-br from-emerald-50 to-sage-50'
            : 'bg-gradient-to-br from-amber-50 to-cream-100'
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'p-3 rounded-xl text-white',
              isGoodWeek ? 'bg-emerald-500' : 'bg-amber-500'
            )}
          >
            {isGoodWeek ? (
              <Award className="w-6 h-6" />
            ) : (
              <Target className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-slate-800">
              Weekly Summary
            </h2>
            <p className="mt-1 text-slate-600">
              {isGoodWeek
                ? 'Great job this week! You completed most of your tasks.'
                : 'Room for improvement. Let\'s tackle those overdue tasks.'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/60 rounded-xl">
            <p className="text-3xl font-bold text-slate-800">
              {summary.tasksCompleted}
            </p>
            <p className="text-sm text-slate-600">Completed</p>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-xl">
            <p className="text-3xl font-bold text-slate-800">
              {summary.tasksCreated}
            </p>
            <p className="text-sm text-slate-600">Created</p>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-xl">
            <p
              className={cn(
                'text-3xl font-bold',
                summary.tasksOverdue > 0 ? 'text-red-600' : 'text-slate-800'
              )}
            >
              {summary.tasksOverdue}
            </p>
            <p className="text-sm text-slate-600">Overdue</p>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-xl">
            <div className="flex items-center justify-center gap-1">
              <p
                className={cn(
                  'text-3xl font-bold',
                  isGoodWeek ? 'text-emerald-600' : 'text-amber-600'
                )}
              >
                {formatPercentage(summary.completionRate)}
              </p>
              {trend === 'up' ? (
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <p className="text-sm text-slate-600">Completion Rate</p>
          </div>
        </div>
      </div>

      {/* Member Stats */}
      {memberStats.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display font-semibold text-slate-800 mb-4">
            Team Performance
          </h3>
          <div className="space-y-3">
            {memberStats.map((member) => {
              const percentage =
                member.total > 0 ? member.completed / member.total : 0;
              return (
                <div key={member.userId} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">
                        {member.name}
                      </span>
                      <span className="text-sm text-slate-500">
                        {member.completed}/{member.total}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          percentage >= 0.7
                            ? 'bg-emerald-500'
                            : percentage >= 0.4
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        )}
                        style={{ width: `${percentage * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Most Missed Tags */}
      {summary.topMissedTags.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="font-display font-semibold text-slate-800">
              Areas Needing Attention
            </h3>
          </div>
          <p className="text-sm text-slate-600 mb-3">
            These categories had the most overdue tasks:
          </p>
          <div className="flex flex-wrap gap-2">
            {summary.topMissedTags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium',
                  getTagColor(tag)
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Focus */}
      {suggestedFocus.length > 0 && (
        <div className="card p-6 bg-brand-50 border-brand-100">
          <h3 className="font-display font-semibold text-brand-800 mb-3">
            🎯 Focus for Next Week
          </h3>
          <ul className="space-y-2">
            {suggestedFocus.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-brand-700">
                <span className="font-medium">{i + 1}.</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
