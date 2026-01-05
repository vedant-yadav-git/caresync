'use client';

import { Search, Filter, SortAsc, X } from 'lucide-react';
import { useState } from 'react';
import { Button, Select } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { TaskFilters, TaskSort, User } from '@/types';

interface FiltersBarProps {
  filters: TaskFilters;
  sort: TaskSort;
  onFiltersChange: (filters: TaskFilters) => void;
  onSortChange: (sort: TaskSort) => void;
  members?: User[];
}

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All priorities' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const SORT_OPTIONS = [
  { value: 'dueAt', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
  { value: 'createdAt', label: 'Created date' },
  { value: 'title', label: 'Title' },
];

export function FiltersBar({
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  members = [],
}: FiltersBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const memberOptions = [
    { value: '', label: 'All members' },
    ...members.map((m) => ({
      value: m.id,
      label: m.name || m.email,
    })),
  ];

  const hasActiveFilters = filters.status || filters.priority || filters.assignedToId || filters.search;

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="space-y-3">
      {/* Search and toggle row */}
      <div className="flex gap-2">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value || undefined })
            }
            className="input pl-10"
          />
        </div>

        {/* Filter toggle */}
        <Button
          variant={showFilters ? 'secondary' : 'ghost'}
          onClick={() => setShowFilters(!showFilters)}
          className={cn(hasActiveFilters && 'ring-2 ring-brand-500/30')}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 w-2 h-2 rounded-full bg-brand-500" />
          )}
        </Button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="card p-4 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select
              value={filters.status || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  status: e.target.value as TaskFilters['status'] || undefined,
                })
              }
              options={STATUS_OPTIONS}
            />

            <Select
              value={filters.priority || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priority: e.target.value as TaskFilters['priority'] || undefined,
                })
              }
              options={PRIORITY_OPTIONS}
            />

            <Select
              value={filters.assignedToId || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  assignedToId: e.target.value || undefined,
                })
              }
              options={memberOptions}
            />

            <div className="flex gap-2">
              <Select
                value={sort.field}
                onChange={(e) =>
                  onSortChange({
                    ...sort,
                    field: e.target.value as TaskSort['field'],
                  })
                }
                options={SORT_OPTIONS}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onSortChange({
                    ...sort,
                    direction: sort.direction === 'asc' ? 'desc' : 'asc',
                  })
                }
                className="px-2"
              >
                <SortAsc
                  className={cn(
                    'w-4 h-4 transition-transform',
                    sort.direction === 'desc' && 'rotate-180'
                  )}
                />
              </Button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4" />
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
