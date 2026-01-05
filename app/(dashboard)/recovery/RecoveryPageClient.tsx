'use client';

import { useRouter } from 'next/navigation';
import { RecoveryPlan } from '@/components/dashboard';
import type { Task } from '@/types';

interface RecoveryPageClientProps {
  overdueTasks: Task[];
}

export function RecoveryPageClient({ overdueTasks }: RecoveryPageClientProps) {
  const router = useRouter();

  const handleMarkDone = async (task: Task) => {
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'DONE',
          completedAt: new Date().toISOString(),
        }),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSnooze = async (task: Task) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);

      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueAt: tomorrow.toISOString() }),
      });
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-800">
          Recovery Plan
        </h1>
        <p className="text-slate-500 mt-1">
          A smart plan to help you catch up on overdue tasks.
        </p>
      </div>

      <RecoveryPlan
        overdueTasks={overdueTasks}
        onMarkDone={handleMarkDone}
        onSnooze={handleSnooze}
      />
    </div>
  );
}
