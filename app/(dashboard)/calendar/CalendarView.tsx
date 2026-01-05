'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import type { Task } from '@/types';

interface CalendarViewProps {
  tasks: Task[];
}

export function CalendarView({ tasks }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueAt) return false;
      const taskDate = typeof task.dueAt === 'string' ? parseISO(task.dueAt) : task.dueAt;
      return isSameDay(taskDate, date);
    });
  };

  const selectedDateTasks = selectedDate ? getTasksForDay(selectedDate) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-800">
          Calendar
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-display font-semibold text-lg text-slate-800 min-w-[160px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Calendar grid */}
        <div className="card p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-slate-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasOverdue = dayTasks.some(
                (t) => t.status !== 'DONE' && new Date(t.dueAt!) < new Date()
              );

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'aspect-square p-1 rounded-xl text-sm transition-all hover:bg-slate-50 relative',
                    !isCurrentMonth && 'text-slate-300',
                    isToday(day) && 'ring-2 ring-brand-500 ring-inset',
                    isSelected && 'bg-brand-50 text-brand-700'
                  )}
                >
                  <span
                    className={cn(
                      'block w-7 h-7 mx-auto flex items-center justify-center rounded-full',
                      isToday(day) && 'bg-brand-500 text-white font-semibold'
                    )}
                  >
                    {format(day, 'd')}
                  </span>

                  {/* Task indicators */}
                  {dayTasks.length > 0 && (
                    <div className="flex justify-center gap-0.5 mt-0.5">
                      {dayTasks.slice(0, 3).map((task) => (
                        <span
                          key={task.id}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            task.status === 'DONE'
                              ? 'bg-emerald-400'
                              : hasOverdue
                              ? 'bg-red-400'
                              : task.priority === 'HIGH'
                              ? 'bg-red-400'
                              : task.priority === 'MEDIUM'
                              ? 'bg-amber-400'
                              : 'bg-sage-400'
                          )}
                        />
                      ))}
                      {dayTasks.length > 3 && (
                        <span className="text-[10px] text-slate-400">
                          +{dayTasks.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected day tasks */}
        <div className="card p-4">
          <h3 className="font-display font-semibold text-slate-800 mb-3">
            {selectedDate
              ? format(selectedDate, 'EEEE, MMMM d')
              : 'Select a date'}
          </h3>

          {selectedDate ? (
            selectedDateTasks.length > 0 ? (
              <div className="space-y-2">
                {selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      'p-3 rounded-xl border',
                      task.status === 'DONE'
                        ? 'bg-slate-50 border-slate-100'
                        : 'bg-white border-slate-200'
                    )}
                  >
                    <p
                      className={cn(
                        'font-medium text-sm',
                        task.status === 'DONE' && 'line-through text-slate-400'
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded',
                          task.priority === 'HIGH'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-sage-100 text-sage-700'
                        )}
                      >
                        {task.priority}
                      </span>
                      {task.assignedTo && (
                        <span className="text-slate-500">
                          {task.assignedTo.name || task.assignedTo.email}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No tasks scheduled for this day.
              </p>
            )
          ) : (
            <p className="text-sm text-slate-500">
              Click on a date to see tasks.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
