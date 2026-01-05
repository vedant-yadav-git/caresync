'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, CheckSquare } from 'lucide-react';
import { Button, Modal, EmptyState } from '@/components/ui';
import { TaskCard, TaskForm, FiltersBar } from '@/components/tasks';
import { sortBy } from '@/lib/utils';
import type { Task, User, TaskFilters, TaskSort, CreateTaskInput } from '@/types';

interface TasksListPageProps {
  tasks: Task[];
  members: User[];
  householdId: string;
}

export function TasksListPage({
  tasks: initialTasks,
  members,
  householdId,
}: TasksListPageProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<TaskFilters>({});
  const [sort, setSort] = useState<TaskSort>({ field: 'dueAt', direction: 'asc' });

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let result = [...initialTasks];

    // Apply filters
    if (filters.status) {
      result = result.filter((t) => t.status === filters.status);
    }
    if (filters.priority) {
      result = result.filter((t) => t.priority === filters.priority);
    }
    if (filters.assignedToId) {
      result = result.filter((t) => t.assignedToId === filters.assignedToId);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(search) ||
          t.description?.toLowerCase().includes(search) ||
          t.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Apply sort
    result = sortBy(
      result,
      (t) => {
        switch (sort.field) {
          case 'dueAt':
            return t.dueAt;
          case 'priority':
            return { HIGH: 3, MEDIUM: 2, LOW: 1 }[t.priority];
          case 'createdAt':
            return t.createdAt;
          case 'title':
            return t.title;
          default:
            return t.dueAt;
        }
      },
      sort.direction
    );

    return result;
  }, [initialTasks, filters, sort]);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-800">
            All Tasks
          </h1>
          <p className="text-slate-500 mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 && 's'}
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <FiltersBar
        filters={filters}
        sort={sort}
        onFiltersChange={setFilters}
        onSortChange={setSort}
        members={members}
      />

      {/* Tasks list */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-12 h-12" />}
          title="No tasks found"
          description={
            filters.search || filters.status || filters.priority
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'
          }
          action={
            !filters.search && !filters.status && !filters.priority && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" />
                Create Task
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={setEditingTask}
              onDelete={handleDelete}
              onSnooze={handleSnooze}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
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

      {/* Edit Modal */}
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
