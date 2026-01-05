import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { TodayDashboard } from './TodayDashboard';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Get user's household
  const membership = await db.householdMember.findFirst({
    where: { userId: session.userId },
    include: {
      household: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!membership) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-display font-semibold text-slate-800">
          No household found
        </h2>
        <p className="text-slate-500 mt-2">
          Please create or join a household to get started.
        </p>
      </div>
    );
  }

  const householdId = membership.householdId;
  const now = new Date();
  const today = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekEnd = endOfDay(addDays(now, 7));
  const weekStart = startOfWeek(now);
  const weekEndDate = endOfWeek(now);

  // Fetch tasks by category
  const [overdueTasks, todayTasks, upcomingTasks, unassignedTasks, completedThisWeek] =
    await Promise.all([
      // Overdue
      db.task.findMany({
        where: {
          householdId,
          status: { not: 'DONE' },
          dueAt: { lt: today },
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { dueAt: 'asc' },
      }),
      // Due today
      db.task.findMany({
        where: {
          householdId,
          status: { not: 'DONE' },
          dueAt: { gte: today, lte: todayEnd },
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }],
      }),
      // Upcoming (next 7 days, excluding today)
      db.task.findMany({
        where: {
          householdId,
          status: { not: 'DONE' },
          dueAt: { gt: todayEnd, lte: weekEnd },
        },
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { dueAt: 'asc' },
        take: 10,
      }),
      // Unassigned
      db.task.findMany({
        where: {
          householdId,
          status: { not: 'DONE' },
          assignedToId: null,
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Completed this week
      db.task.count({
        where: {
          householdId,
          status: 'DONE',
          completedAt: { gte: weekStart, lte: weekEndDate },
        },
      }),
    ]);

  // Calculate stats
  const totalTasks = await db.task.count({
    where: { householdId, status: { not: 'DONE' } },
  });

  const stats = {
    totalTasks,
    completedThisWeek,
    overdueCount: overdueTasks.length,
    completionRate:
      completedThisWeek + overdueTasks.length > 0
        ? completedThisWeek / (completedThisWeek + overdueTasks.length)
        : 1,
  };

  const members = membership.household.members.map((m) => m.user);

  return (
    <TodayDashboard
      overdueTasks={overdueTasks}
      todayTasks={todayTasks}
      upcomingTasks={upcomingTasks}
      unassignedTasks={unassignedTasks}
      stats={stats}
      members={members}
      householdId={householdId}
      currentUserId={session.userId}
    />
  );
}
