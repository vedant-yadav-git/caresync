import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { updateTaskSchema } from '@/lib/validators';
import { getNextDueDate } from '@/lib/dates';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/tasks/[id] - Get single task
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const task = await db.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        household: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify user is in household
    const membership = await db.householdMember.findFirst({
      where: { userId: session.userId, householdId: task.householdId },
    });
    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Get task error:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PATCH /api/tasks/[id] - Update task
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Get existing task
    const existingTask = await db.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify user is in household
    const membership = await db.householdMember.findFirst({
      where: { userId: session.userId, householdId: existingTask.householdId },
    });
    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Validate input
    const result = updateTaskSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...result.data };
    
    // Handle due date conversion
    if (updateData.dueAt) {
      updateData.dueAt = new Date(updateData.dueAt as string);
    }

    // Handle completion - if marking as done and recurring, create next instance
    if (updateData.status === 'DONE' && existingTask.status !== 'DONE') {
      updateData.completedAt = new Date();

      // Create next recurring task if applicable
      if (existingTask.recurrenceRule !== 'NONE' && existingTask.dueAt) {
        // Calculate next due date based on recurrence rule
        // For weekly tasks, we want to maintain the same day of the week
        // So we calculate from TODAY, not from the (possibly snoozed) due date
        const today = new Date();
        const originalDueDate = new Date(existingTask.dueAt);
        
        let nextDueDate: Date;
        
        if (existingTask.recurrenceRule === 'WEEKLY') {
          // Get the original day of week (0 = Sunday, 1 = Monday, etc.)
          const originalDayOfWeek = originalDueDate.getDay();
          
          // Find the next occurrence of that day
          nextDueDate = new Date(today);
          const currentDayOfWeek = today.getDay();
          
          // Calculate days until next occurrence of the original day
          let daysUntilNext = originalDayOfWeek - currentDayOfWeek;
          if (daysUntilNext <= 0) {
            daysUntilNext += 7; // Move to next week
          }
          
          nextDueDate.setDate(today.getDate() + daysUntilNext);
          // Preserve the original time
          nextDueDate.setHours(originalDueDate.getHours());
          nextDueDate.setMinutes(originalDueDate.getMinutes());
          nextDueDate.setSeconds(0);
          nextDueDate.setMilliseconds(0);
        } else if (existingTask.recurrenceRule === 'DAILY') {
          // For daily, just add 1 day from today
          nextDueDate = new Date(today);
          nextDueDate.setDate(today.getDate() + 1);
          nextDueDate.setHours(originalDueDate.getHours());
          nextDueDate.setMinutes(originalDueDate.getMinutes());
          nextDueDate.setSeconds(0);
          nextDueDate.setMilliseconds(0);
        } else if (existingTask.recurrenceRule === 'MONTHLY') {
          // For monthly, use the same day of month
          const originalDayOfMonth = originalDueDate.getDate();
          nextDueDate = new Date(today);
          
          // Move to next month
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          
          // Set the same day of month (handle months with fewer days)
          const lastDayOfMonth = new Date(nextDueDate.getFullYear(), nextDueDate.getMonth() + 1, 0).getDate();
          nextDueDate.setDate(Math.min(originalDayOfMonth, lastDayOfMonth));
          
          // If the calculated date is in the past, add another month
          if (nextDueDate <= today) {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
            const newLastDay = new Date(nextDueDate.getFullYear(), nextDueDate.getMonth() + 1, 0).getDate();
            nextDueDate.setDate(Math.min(originalDayOfMonth, newLastDay));
          }
          
          nextDueDate.setHours(originalDueDate.getHours());
          nextDueDate.setMinutes(originalDueDate.getMinutes());
          nextDueDate.setSeconds(0);
          nextDueDate.setMilliseconds(0);
        } else {
          // Fallback to old behavior
          const fallbackDate = getNextDueDate(existingTask.dueAt, existingTask.recurrenceRule);
          nextDueDate = fallbackDate || new Date();
        }

        await db.task.create({
          data: {
            title: existingTask.title,
            description: existingTask.description,
            priority: existingTask.priority,
            status: 'OPEN',
            dueAt: nextDueDate,
            tags: existingTask.tags,
            recurrenceRule: existingTask.recurrenceRule,
            householdId: existingTask.householdId,
            createdById: existingTask.createdById,
            assignedToId: existingTask.assignedToId,
          },
        });
      }
    }

    // If reopening, clear completedAt
    if (updateData.status === 'OPEN' && existingTask.status === 'DONE') {
      updateData.completedAt = null;
    }

    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const task = await db.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Verify user is in household
    const membership = await db.householdMember.findFirst({
      where: { userId: session.userId, householdId: task.householdId },
    });
    if (!membership) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await db.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}