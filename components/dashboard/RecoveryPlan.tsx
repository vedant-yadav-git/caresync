'use client';

import { AlertTriangle, CheckCircle2, Clock, Zap, ArrowRight } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { cn, getPriorityLabel } from '@/lib/utils';
import { formatRelative, getOverdueDays } from '@/lib/dates';
import type { Task } from '@/types';

interface RecoveryTaskItem {
  task: Task;
  urgencyScore: number;
  recommendation: 'must_do_today' | 'can_wait' | 'delegate' | 'reschedule';
}

interface RecoveryPlanProps {
  overdueTasks: Task[];
  onMarkDone: (task: Task) => void;
  onSnooze: (task: Task) => void;
}

// Calculate urgency score for a task
function calculateUrgencyScore(task: Task): number {
  let score = 0;

  // Priority weight (1-3)
  const priorityWeight = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  };
  score += priorityWeight[task.priority] * 10;

  // Days overdue (more overdue = more urgent)
  if (task.dueAt) {
    const daysOverdue = getOverdueDays(task.dueAt);
    score += Math.min(daysOverdue * 5, 30); // Cap at 30 points
  }

  // Has tags that suggest urgency
  const urgentTags = ['health', 'bills', 'appointments', 'paperwork'];
  const hasUrgentTag = task.tags.some((t) =>
    urgentTags.includes(t.toLowerCase())
  );
  if (hasUrgentTag) {
    score += 10;
  }

  return score;
}

// Get recommendation based on score and task attributes
function getRecommendation(
  task: Task,
  score: number,
  rank: number,
  totalTasks: number
): RecoveryTaskItem['recommendation'] {
  // Top 3 high-priority tasks should be done today
  if (rank < 3 && task.priority === 'HIGH') {
    return 'must_do_today';
  }

  // High score tasks within top 5
  if (rank < 5 && score >= 30) {
    return 'must_do_today';
  }

  // Low priority tasks that have been waiting
  if (task.priority === 'LOW' && getOverdueDays(task.dueAt) > 7) {
    return 'reschedule';
  }

  // Tasks that could be handed off
  if (!task.assignedToId && totalTasks > 5) {
    return 'delegate';
  }

  return 'can_wait';
}

export function RecoveryPlan({
  overdueTasks,
  onMarkDone,
  onSnooze,
}: RecoveryPlanProps) {
  if (overdueTasks.length === 0) {
    return (
      <div className="card p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="font-display font-semibold text-slate-800">
          All caught up!
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          No overdue tasks. You&apos;re doing great! 🎉
        </p>
      </div>
    );
  }

  // Calculate scores and sort
  const scoredTasks: RecoveryTaskItem[] = overdueTasks
    .map((task) => ({
      task,
      urgencyScore: calculateUrgencyScore(task),
      recommendation: 'can_wait' as const,
    }))
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .map((item, index, arr) => ({
      ...item,
      recommendation: getRecommendation(
        item.task,
        item.urgencyScore,
        index,
        arr.length
      ),
    }));

  const mustDoToday = scoredTasks.filter(
    (t) => t.recommendation === 'must_do_today'
  );
  const canWait = scoredTasks.filter((t) => t.recommendation === 'can_wait');
  const toReschedule = scoredTasks.filter(
    (t) => t.recommendation === 'reschedule' || t.recommendation === 'delegate'
  );

  const estimatedDays = Math.ceil(overdueTasks.length / 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-elevated p-6 bg-gradient-to-br from-brand-50 to-cream-100">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-brand-500 text-white">
            <Zap className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-display font-bold text-slate-800">
              Recovery Plan
            </h2>
            <p className="mt-1 text-slate-600">
              You have <span className="font-semibold">{overdueTasks.length} overdue tasks</span>.
              Here&apos;s a smart plan to catch up in about{' '}
              <span className="font-semibold">{estimatedDays} days</span>.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <p className="text-2xl font-bold text-red-600">{mustDoToday.length}</p>
            <p className="text-xs text-slate-600">Must do today</p>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <p className="text-2xl font-bold text-amber-600">{canWait.length}</p>
            <p className="text-xs text-slate-600">Can wait</p>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-xl">
            <p className="text-2xl font-bold text-slate-600">{toReschedule.length}</p>
            <p className="text-xs text-slate-600">Reschedule</p>
          </div>
        </div>
      </div>

      {/* Must Do Today Section */}
      {mustDoToday.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-display font-semibold text-slate-800">
              Must Do Today
            </h3>
          </div>
          <div className="space-y-2">
            {mustDoToday.map(({ task, urgencyScore }) => (
              <RecoveryTaskCard
                key={task.id}
                task={task}
                urgencyScore={urgencyScore}
                urgent
                onMarkDone={() => onMarkDone(task)}
                onSnooze={() => onSnooze(task)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Can Wait Section */}
      {canWait.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="font-display font-semibold text-slate-800">
              Can Wait (This Week)
            </h3>
          </div>
          <div className="space-y-2">
            {canWait.map(({ task, urgencyScore }) => (
              <RecoveryTaskCard
                key={task.id}
                task={task}
                urgencyScore={urgencyScore}
                onMarkDone={() => onMarkDone(task)}
                onSnooze={() => onSnooze(task)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reschedule Section */}
      {toReschedule.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="w-5 h-5 text-slate-400" />
            <h3 className="font-display font-semibold text-slate-800">
              Consider Rescheduling
            </h3>
          </div>
          <div className="space-y-2 opacity-75">
            {toReschedule.map(({ task, urgencyScore }) => (
              <RecoveryTaskCard
                key={task.id}
                task={task}
                urgencyScore={urgencyScore}
                onMarkDone={() => onMarkDone(task)}
                onSnooze={() => onSnooze(task)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Individual recovery task card
interface RecoveryTaskCardProps {
  task: Task;
  urgencyScore: number;
  urgent?: boolean;
  onMarkDone: () => void;
  onSnooze: () => void;
}

function RecoveryTaskCard({
  task,
  urgencyScore,
  urgent,
  onMarkDone,
  onSnooze,
}: RecoveryTaskCardProps) {
  const daysOverdue = getOverdueDays(task.dueAt);

  return (
    <div
      className={cn(
        'card p-4 flex items-center gap-4',
        urgent && 'border-red-200 bg-red-50/50'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-slate-800 truncate">{task.title}</h4>
          <Badge
            variant={task.priority.toLowerCase() as 'low' | 'medium' | 'high'}
          >
            {getPriorityLabel(task.priority)}
          </Badge>
        </div>
        <div className="mt-1 flex items-center gap-3 text-sm">
          <span className="text-red-600 font-medium">
            {daysOverdue} days overdue
          </span>
          <span className="text-slate-400">
            Score: {urgencyScore}
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onSnooze}>
          Tomorrow
        </Button>
        <Button variant="primary" size="sm" onClick={onMarkDone}>
          Done
        </Button>
      </div>
    </div>
  );
}
