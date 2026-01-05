import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { TasksListPage } from './TasksListPage';

export default async function TasksPage() {
  const session = await getSession();
  if (!session) redirect('/login');

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
    redirect('/');
  }

  const tasks = await db.task.findMany({
    where: { householdId: membership.householdId },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ status: 'asc' }, { dueAt: 'asc' }, { priority: 'desc' }],
  });

  const members = membership.household.members.map((m) => m.user);

  return (
    <TasksListPage
      tasks={tasks}
      members={members}
      householdId={membership.householdId}
    />
  );
}
