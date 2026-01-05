import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

// POST /api/invites/accept - Accept an invite
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the invite
    const invite = await db.invite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 400 });
    }

    if (invite.acceptedAt) {
      return NextResponse.json(
        { error: 'Invite has already been used' },
        { status: 400 }
      );
    }

    // Check if user is already a member of this household
    const existingMembership = await db.householdMember.findFirst({
      where: {
        userId: session.userId,
        householdId: invite.householdId,
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: 'You are already a member of this household' },
        { status: 400 }
      );
    }

    // Accept the invite - create membership and update invite
    await db.$transaction([
      db.householdMember.create({
        data: {
          userId: session.userId,
          householdId: invite.householdId,
          role: invite.role,
        },
      }),
      db.invite.update({
        where: { id: invite.id },
        data: {
          acceptedAt: new Date(),
          acceptedById: session.userId,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Accept invite error:', error);
    return NextResponse.json(
      { error: 'Failed to accept invite' },
      { status: 500 }
    );
  }
}
