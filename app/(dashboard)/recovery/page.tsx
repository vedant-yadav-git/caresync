import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { startOfDay } from 'date-fns';
import { RecoveryPageClient } from './RecoveryPageClient';

export default async function RecoveryPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const membership = await db.householdMember.findFirst({
    where: { userId: session.userId },
  });

  if (!membership) {
    redirect('/');
  }

  const today = startOfDay(new Date());

  // Get all overdue tasks
  const overdueTasks = await db.task.findMany({
    where: {
      householdId: membership.householdId,
      status: { not: 'DONE' },
      dueAt: { lt: today },
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }],
  });

  return <RecoveryPageClient overdueTasks={overdueTasks} />;
}
