'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  AlertTriangle,
  Sun,
  Calendar,
  UserX,
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
} from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { TaskSection, TaskForm } from '@/components/tasks';
import { StatsCard } from '@/components/dashboard';
import { formatPercentage } from '@/lib/utils';
import type { Task, UserSummary, DashboardStats, CreateTaskInput } from '@/types';

interface TodayDashboardProps {
  overdueTasks: Task[];
  todayTasks: Task[];
  upcomingTasks: Task[];
  unassignedTasks: Task[];
  stats: DashboardStats;
  members: UserSummary[];
  householdId: string;
  currentUserId: string;
}

export function TodayDashboard({
  overdueTasks,
  todayTasks,
  upcomingTasks,
  unassignedTasks,
  stats,
  members,
  householdId,
  currentUserId,
}: TodayDashboardProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateTask = async (data: CreateTaskInput) => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, householdId }),
      });

      if (!res.ok) throw new Error('Failed to create task');

      setShowCreateModal(false);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const newStatus = task.status === 'DONE' ? 'OPEN' : 'DONE';
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          completedAt: newStatus === 'DONE' ? new Date().toISOString() : null,
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

  const handleDelete = async (task: Task) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-800">
            {greeting()}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            Here&apos;s what&apos;s on your plate today.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Open Tasks"
          value={stats.totalTasks}
          icon={<ListTodo className="w-5 h-5" />}
          color="brand"
        />
        <StatsCard
          label="Completed This Week"
          value={stats.completedThisWeek}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="emerald"
        />
        <StatsCard
          label="Overdue"
          value={stats.overdueCount}
          icon={<Clock className="w-5 h-5" />}
          color={stats.overdueCount > 0 ? 'red' : 'sage'}
        />
        <StatsCard
          label="Completion Rate"
          value={formatPercentage(stats.completionRate)}
          icon={<TrendingUp className="w-5 h-5" />}
          color={stats.completionRate >= 0.7 ? 'emerald' : 'amber'}
        />
      </div>

      {/* Task Sections */}
      <div className="space-y-2">
        {/* Overdue */}
        {overdueTasks.length > 0 && (
          <TaskSection
            title="Overdue"
            tasks={overdueTasks}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconColor="text-red-500"
            emptyMessage="No overdue tasks!"
            onToggleComplete={handleToggleComplete}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onSnooze={handleSnooze}
          />
        )}

        {/* Due Today */}
        <TaskSection
          title="Due Today"
          tasks={todayTasks}
          icon={<Sun className="w-5 h-5" />}
          iconColor="text-amber-500"
          emptyMessage="Nothing due today. Take a break! 🌴"
          onToggleComplete={handleToggleComplete}
          onEdit={setEditingTask}
          onDelete={handleDelete}
          onSnooze={handleSnooze}
        />

        {/* Upcoming */}
        <TaskSection
          title="Upcoming (Next 7 Days)"
          tasks={upcomingTasks}
          icon={<Calendar className="w-5 h-5" />}
          iconColor="text-blue-500"
          emptyMessage="No upcoming tasks this week."
          defaultExpanded={todayTasks.length === 0}
          onToggleComplete={handleToggleComplete}
          onEdit={setEditingTask}
          onDelete={handleDelete}
          onSnooze={handleSnooze}
        />

        {/* Unassigned */}
        {unassignedTasks.length > 0 && (
          <TaskSection
            title="Unassigned"
            tasks={unassignedTasks}
            icon={<UserX className="w-5 h-5" />}
            iconColor="text-slate-400"
            emptyMessage="All tasks are assigned."
            defaultExpanded={false}
            onToggleComplete={handleToggleComplete}
            onEdit={setEditingTask}
            onDelete={handleDelete}
            onSnooze={handleSnooze}
          />
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
      >
        <TaskForm
          members={members}
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateModal(false)}
          loading={loading}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            task={editingTask}
            members={members}
            onSubmit={async (data) => {
              setLoading(true);
              try {
                await fetch(`/api/tasks/${editingTask.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                setEditingTask(null);
                router.refresh();
              } catch (error) {
                console.error(error);
              } finally {
                setLoading(false);
              }
            }}
            onCancel={() => setEditingTask(null)}
            loading={loading}
          />
        )}
      </Modal>
    </div>
  );
}
