import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createTaskSchema } from '@/lib/validators';

// GET /api/tasks - List tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const householdId = searchParams.get('householdId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignedToId = searchParams.get('assignedToId');
    const search = searchParams.get('search');

    // Verify user is in household
    if (householdId) {
      const membership = await db.householdMember.findFirst({
        where: { userId: session.userId, householdId },
      });
      if (!membership) {
        return NextResponse.json({ error: 'Not a member of this household' }, { status: 403 });
      }
    }

    // Build where clause
    const where: Record<string, unknown> = {};
    if (householdId) where.householdId = householdId;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tasks = await db.task.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ dueAt: 'asc' }, { priority: 'desc' }],
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create task
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { householdId, ...taskData } = body;

    // Validate input
    const result = createTaskSchema.safeParse(taskData);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    // Verify user is in household
    const membership = await db.householdMember.findFirst({
      where: { userId: session.userId, householdId },
    });
    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this household' }, { status: 403 });
    }

    // Create task
    const task = await db.task.create({
      data: {
        ...result.data,
        dueAt: result.data.dueAt ? new Date(result.data.dueAt) : null,
        householdId,
        createdById: session.userId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
