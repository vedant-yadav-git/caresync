import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { CalendarView } from './CalendarView';

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const membership = await db.householdMember.findFirst({
    where: { userId: session.userId },
  });

  if (!membership) {
    redirect('/');
  }

  const tasks = await db.task.findMany({
    where: {
      householdId: membership.householdId,
      dueAt: { not: null },
    },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
    },
    orderBy: { dueAt: 'asc' },
  });

  return <CalendarView tasks={tasks} />;
}
