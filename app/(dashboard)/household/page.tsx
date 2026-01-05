import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { HouseholdPageClient } from './HouseholdPageClient';

export default async function HouseholdPage() {
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
            orderBy: { joinedAt: 'asc' },
          },
          invites: {
            where: {
              acceptedAt: null,
              expiresAt: { gt: new Date() },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });

  if (!membership) {
    redirect('/');
  }

  return (
    <HouseholdPageClient
      household={membership.household}
      currentUserId={session.userId}
      currentUserRole={membership.role}
    />
  );
}
