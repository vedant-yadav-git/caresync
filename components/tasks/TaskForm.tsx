'use client';

import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { cn, getTagColor } from '@/lib/utils';
import type { Task, CreateTaskInput, UserSummary } from '@/types';

interface TaskFormProps {
  task?: Task | null;
  members?: UserSummary[];
  onSubmit: (data: CreateTaskInput) => void;
  onCancel: () => void;
  loading?: boolean;
}

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

const RECURRENCE_OPTIONS = [
  { value: 'NONE', label: 'Does not repeat' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

const SUGGESTED_TAGS = [
  'home',
  'health',
  'paperwork',
  'school',
  'groceries',
  'appointments',
  'bills',
  'cleaning',
];

export function TaskForm({
  task,
  members = [],
  onSubmit,
  onCancel,
  loading = false,
}: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<string>(task?.priority || 'MEDIUM');
  const [dueAt, setDueAt] = useState(
    task?.dueAt
      ? new Date(task.dueAt).toISOString().slice(0, 16)
      : ''
  );
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [recurrenceRule, setRecurrenceRule] = useState<string>(
    task?.recurrenceRule || 'NONE'
  );
  const [assignedToId, setAssignedToId] = useState(task?.assignedToId || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag) && tags.length < 10) {
      setTags([...tags, normalizedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority: priority as 'LOW' | 'MEDIUM' | 'HIGH',
      dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      tags,
      recurrenceRule: recurrenceRule as 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY',
      assignedToId: assignedToId || undefined,
    });
  };

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({
      value: m.id,
      label: m.name || m.email,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Task title"
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          setErrors({ ...errors, title: '' });
        }}
        error={errors.title}
        autoFocus
      />

      <Textarea
        label="Description (optional)"
        placeholder="Add more details..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          options={PRIORITY_OPTIONS}
        />

        <Select
          label="Assign to"
          value={assignedToId}
          onChange={(e) => setAssignedToId(e.target.value)}
          options={memberOptions}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="datetime-local"
          label="Due date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />

        <Select
          label="Repeat"
          value={recurrenceRule}
          onChange={(e) => setRecurrenceRule(e.target.value)}
          options={RECURRENCE_OPTIONS}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="label">Tags</label>
        
        {/* Tag input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag(tagInput);
              }
            }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => handleAddTag(tagInput)}
            disabled={!tagInput.trim() || tags.length >= 10}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Selected tags */}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium',
                  getTagColor(tag)
                )}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:opacity-70"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Suggested tags */}
        {tags.length < 10 && (
          <div className="mt-2">
            <span className="text-xs text-slate-500 mr-2">Suggestions:</span>
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
              .slice(0, 5)
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="text-xs text-slate-500 hover:text-brand-600 mr-2"
                >
                  +{tag}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
