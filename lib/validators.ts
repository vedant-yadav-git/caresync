import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  householdName: z.string().min(1).max(100).optional(),
});

// ============================================
// TASK SCHEMAS
// ============================================

export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const taskStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'DONE']);
export const recurrenceRuleSchema = z.enum(['NONE', 'DAILY', 'WEEKLY', 'MONTHLY']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(2000, 'Description is too long').optional(),
  priority: taskPrioritySchema.default('MEDIUM'),
  dueAt: z.string().datetime().optional().nullable(),
  tags: z.array(z.string().max(50)).max(10).default([]),
  recurrenceRule: recurrenceRuleSchema.default('NONE'),
  assignedToId: z.string().cuid().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: taskStatusSchema.optional(),
});

// ============================================
// HOUSEHOLD SCHEMAS
// ============================================

export const memberRoleSchema = z.enum(['OWNER', 'MEMBER', 'VIEWER']);

export const createHouseholdSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: memberRoleSchema.default('MEMBER'),
});

// ============================================
// QUERY SCHEMAS
// ============================================

export const taskFilterSchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  assignedToId: z.string().cuid().optional(),
  tag: z.string().optional(),
  search: z.string().max(100).optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const taskSortSchema = z.object({
  field: z.enum(['dueAt', 'priority', 'createdAt', 'title']).default('dueAt'),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type TaskFilterInput = z.infer<typeof taskFilterSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type TaskSortInput = z.infer<typeof taskSortSchema>;
