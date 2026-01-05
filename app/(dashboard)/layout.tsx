import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { Navbar } from '@/components/Navbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Get user and household info
  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      memberships: {
        include: {
          household: true,
        },
        take: 1,
      },
    },
  });

  if (!user) {
    redirect('/login');
  }

  const household = user.memberships[0]?.household;

  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
        }}
        householdName={household?.name}
      />

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="max-w-5xl mx-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
