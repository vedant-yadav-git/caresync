'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TaskCard } from './TaskCard';
import { EmptyState } from '@/components/ui';
import type { Task } from '@/types';

interface TaskSectionProps {
  title: string;
  tasks: Task[];
  icon?: React.ReactNode;
  iconColor?: string;
  emptyMessage?: string;
  defaultExpanded?: boolean;
  onToggleComplete?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onSnooze?: (task: Task) => void;
}

export function TaskSection({
  title,
  tasks,
  icon,
  iconColor,
  emptyMessage = 'No tasks',
  defaultExpanded = true,
  onToggleComplete,
  onEdit,
  onDelete,
  onSnooze,
}: TaskSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-2 mb-3 group"
      >
        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </span>
        {icon && (
          <span className={cn('w-5 h-5', iconColor)}>{icon}</span>
        )}
        <h2 className="font-display font-semibold text-slate-800">{title}</h2>
        <span className="text-sm text-slate-400">({tasks.length})</span>
      </button>

      {/* Tasks */}
      {isExpanded && (
        <div className="space-y-2 animate-stagger">
          {tasks.length === 0 ? (
            <div className="pl-6">
              <p className="text-sm text-slate-400 py-4">{emptyMessage}</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
                onSnooze={onSnooze}
                compact
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
