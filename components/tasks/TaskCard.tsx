'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  User,
  MoreHorizontal,
  Repeat,
  ArrowRight,
  Pencil,
  Trash2,
  Clock,
} from 'lucide-react';
import { cn, getPriorityColor, getPriorityLabel, getTagColor } from '@/lib/utils';
import { formatRelative, isOverdue, formatRecurrence } from '@/lib/dates';
import { Avatar, Badge } from '@/components/ui';
import type { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onSnooze?: (task: Task) => void;
  showAssignee?: boolean;
  compact?: boolean;
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onSnooze,
  showAssignee = true,
  compact = false,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isComplete = task.status === 'DONE';
  const taskOverdue = !isComplete && isOverdue(task.dueAt);

  const handleToggle = () => {
    onToggleComplete?.(task);
  };

  return (
    <div
      className={cn(
        'group relative card p-4 transition-all duration-200 hover:shadow-elevated',
        isComplete && 'opacity-60',
        taskOverdue && 'border-red-200 bg-red-50/50'
      )}
    >
      <div className="flex gap-3">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={cn(
            'flex-shrink-0 mt-0.5 transition-all duration-200',
            isComplete
              ? 'text-emerald-500'
              : 'text-slate-300 hover:text-brand-500'
          )}
        >
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={cn(
                'font-medium text-slate-800 leading-snug',
                isComplete && 'line-through text-slate-500'
              )}
            >
              {task.title}
            </h3>

            {/* Actions menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 -m-1 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-slate-100"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-6 z-20 w-40 bg-white rounded-xl shadow-elevated border border-slate-100 py-1 animate-scale-in">
                    {onEdit && (
                      <button
                        onClick={() => {
                          onEdit(task);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    {onSnooze && !isComplete && (
                      <button
                        onClick={() => {
                          onSnooze(task);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Snooze to tomorrow
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(task);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {!compact && task.description && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            {/* Priority badge */}
            <Badge variant={task.priority.toLowerCase() as 'low' | 'medium' | 'high'}>
              {getPriorityLabel(task.priority)}
            </Badge>

            {/* Due date */}
            {task.dueAt && (
              <span
                className={cn(
                  'inline-flex items-center gap-1',
                  taskOverdue ? 'text-red-600 font-medium' : 'text-slate-500'
                )}
              >
                {taskOverdue ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Calendar className="w-3.5 h-3.5" />
                )}
                {formatRelative(task.dueAt)}
              </span>
            )}

            {/* Recurrence */}
            {task.recurrenceRule !== 'NONE' && (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Repeat className="w-3.5 h-3.5" />
                <span className="text-xs">
                  {formatRecurrence(task.recurrenceRule)}
                </span>
              </span>
            )}

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex gap-1">
                {task.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      getTagColor(tag)
                    )}
                  >
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Assignee */}
          {showAssignee && task.assignedTo && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
              <Avatar
                name={task.assignedTo.name}
                size="sm"
                id={task.assignedTo.id}
              />
              <span>{task.assignedTo.name || task.assignedTo.email}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
