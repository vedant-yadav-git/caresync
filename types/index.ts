// ============================================
// DATABASE TYPES (mirrors Prisma schema)
// ============================================

export type MemberRole = 'OWNER' | 'MEMBER' | 'VIEWER';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE';
export type RecurrenceRule = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Simplified user for task assignments (what we actually select from DB)
export interface UserSummary {
  id: string;
  email: string;
  name: string | null;
}

export interface Household {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HouseholdMember {
  id: string;
  householdId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
  user?: User | UserSummary;
  household?: Household;
}

export interface Task {
  id: string;
  householdId: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueAt: Date | null;
  tags: string[];
  recurrenceRule: RecurrenceRule;
  createdById: string;
  assignedToId: string | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations - using UserSummary since we only select id, name, email
  createdBy?: UserSummary;
  assignedTo?: UserSummary | null;
}

export interface Invite {
  id: string;
  householdId: string;
  email: string;
  token: string;
  role: MemberRole;
  sentById: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
  household?: Household;
  sentBy?: User;
}

export interface HouseholdNote {
  id: string;
  householdId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklySummary {
  id: string;
  householdId: string;
  weekStarting: Date;
  tasksCreated: number;
  tasksCompleted: number;
  tasksOverdue: number;
  completionRate: number;
  topMissedTags: string[];
  createdAt: Date;
}

// ============================================
// API TYPES
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueAt?: string;
  tags?: string[];
  recurrenceRule?: RecurrenceRule;
  assignedToId?: string;
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
}

export interface CreateHouseholdInput {
  name: string;
}

export interface InviteMemberInput {
  email: string;
  role?: MemberRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  householdName?: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export interface SessionPayload {
  userId: string;
  email: string;
  expiresAt: number;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardStats {
  totalTasks: number;
  completedThisWeek: number;
  overdueCount: number;
  completionRate: number;
}

export interface TasksBySection {
  overdue: Task[];
  dueToday: Task[];
  upcoming: Task[];
  unassigned: Task[];
}

// ============================================
// RECOVERY PLAN TYPES (Smart Feature)
// ============================================

export interface RecoveryTask extends Task {
  urgencyScore: number;
  recommendation: 'must_do_today' | 'can_wait' | 'delegate' | 'reschedule';
}

export interface RecoveryPlan {
  mustDoToday: RecoveryTask[];
  canWait: RecoveryTask[];
  totalOverdue: number;
  estimatedCatchUpDays: number;
  generatedAt: Date;
}

// ============================================
// UTILITY TYPES
// ============================================

export type SortDirection = 'asc' | 'desc';

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  tag?: string;
  search?: string;
}

export interface TaskSort {
  field: 'dueAt' | 'priority' | 'createdAt' | 'title';
  direction: SortDirection;
}
