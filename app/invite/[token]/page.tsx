import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { InviteAcceptClient } from './InviteAcceptClient';

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  
  // Find the invite
  const invite = await db.invite.findUnique({
    where: { token },
    include: {
      household: true,
      sentBy: {
        select: { name: true, email: true },
      },
    },
  });

  // Check if invite exists and is valid
  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-sage-50 p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-display font-bold text-slate-800 mb-2">
            Invalid Invite
          </h1>
          <p className="text-slate-500">
            This invite link is invalid or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Check if invite is expired
  if (invite.expiresAt < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-sage-50 p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-display font-bold text-slate-800 mb-2">
            Invite Expired
          </h1>
          <p className="text-slate-500">
            This invite has expired. Please ask for a new one.
          </p>
        </div>
      </div>
    );
  }

  // Check if invite was already accepted
  if (invite.acceptedAt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-sage-50 p-4">
        <div className="card p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-display font-bold text-slate-800 mb-2">
            Already Accepted
          </h1>
          <p className="text-slate-500">
            This invite has already been used.
          </p>
        </div>
      </div>
    );
  }

  // Check if user is logged in
  const session = await getSession();
  
  return (
    <InviteAcceptClient
      invite={{
        id: invite.id,
        token: invite.token,
        email: invite.email,
        role: invite.role,
        householdName: invite.household.name,
        invitedBy: invite.sentBy.name || invite.sentBy.email,
      }}
      isLoggedIn={!!session}
      currentUserEmail={session ? (await db.user.findUnique({ where: { id: session.userId } }))?.email : undefined}
    />
  );
}
