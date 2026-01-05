import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { inviteMemberSchema } from '@/lib/validators';
import { addDays } from 'date-fns';

// POST /api/invites - Create invite
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { householdId, ...inviteData } = body;

    // Validate input
    const result = inviteMemberSchema.safeParse(inviteData);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    // Check user is owner of household
    const membership = await db.householdMember.findFirst({
      where: {
        userId: session.userId,
        householdId,
        role: 'OWNER',
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: 'Only owners can invite members' },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = await db.householdMember.findFirst({
      where: {
        householdId,
        user: { email: result.data.email.toLowerCase() },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'This user is already a member' },
        { status: 400 }
      );
    }

    // Check for existing pending invite
    const existingInvite = await db.invite.findFirst({
      where: {
        householdId,
        email: result.data.email.toLowerCase(),
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: 'An invite has already been sent to this email' },
        { status: 400 }
      );
    }

    // Create invite
    const invite = await db.invite.create({
      data: {
        householdId,
        email: result.data.email.toLowerCase(),
        role: result.data.role,
        sentById: session.userId,
        expiresAt: addDays(new Date(), 7),
      },
    });

    return NextResponse.json({ success: true, data: invite }, { status: 201 });
  } catch (error) {
    console.error('Create invite error:', error);
    return NextResponse.json(
      { error: 'Failed to create invite' },
      { status: 500 }
    );
  }
}
