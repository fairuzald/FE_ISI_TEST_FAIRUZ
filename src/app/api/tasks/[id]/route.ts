import { withAuth } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import {
  activityLogs,
  LogAction,
  taskAssignees,
  tasks,
  TaskStatus,
  users,
} from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const taskId = parseInt(params.id);

  if (isNaN(taskId)) {
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
  }

  try {
    const task = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const createdBy = await db.query.users.findFirst({
      where: eq(users.id, task.createdById),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    let assignedTo = null;
    if (task.assignedToId) {
      assignedTo = await db.query.users.findFirst({
        where: eq(users.id, task.assignedToId),
        columns: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });
    }

    const assignees = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(taskAssignees)
      .innerJoin(users, eq(taskAssignees.userId, users.id))
      .where(eq(taskAssignees.taskId, taskId));

    const rawActivityLogs = await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.taskId, taskId))
      .orderBy(activityLogs.createdAt);

    const enrichedLogs = await Promise.all(
      rawActivityLogs.map(async (log) => {
        const logUser = await db.query.users.findFirst({
          where: eq(users.id, log.userId),
          columns: {
            id: true,
            name: true,
            email: true,
          },
        });

        let affectedUser = undefined;
        if (log.affectedUserId) {
          affectedUser = await db.query.users.findFirst({
            where: eq(users.id, log.affectedUserId),
            columns: {
              id: true,
              name: true,
              email: true,
            },
          });
        }

        let formattedDetails = log.details || "";
        if (log.action === "assign" && affectedUser) {
          formattedDetails = formattedDetails.replace(
            affectedUser.name,
            `${affectedUser.name} (${affectedUser.email})`
          );
        }

        return {
          ...log,
          user: logUser || { id: 0, name: "Unknown", email: "" },
          affectedUser,
          formattedDetails,
        };
      })
    );

    if (user.role === "team") {
      const isAssigned =
        assignees.some((assignee) => assignee.id === user.userId) ||
        task.assignedToId === user.userId;

      if (!isAssigned) {
        return NextResponse.json(
          { error: "Unauthorized to view this task" },
          { status: 403 }
        );
      }
    }

    const fullTaskData = {
      ...task,
      createdBy: createdBy || { id: 0, name: "Unknown", email: "", role: "" },
      assignedTo,
      assignees,
      activityLogs: enrichedLogs,
    };

    return NextResponse.json({
      task: fullTaskData,
    });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

// UPDATE (PATCH) a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const taskId = parseInt(params.id);

  if (isNaN(taskId)) {
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
  }

  try {
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const currentAssignees = await db
      .select({
        id: taskAssignees.userId,
        name: users.name,
      })
      .from(taskAssignees)
      .innerJoin(users, eq(taskAssignees.userId, users.id))
      .where(eq(taskAssignees.taskId, taskId));

    if (user.role === "team") {
      const isAssigned =
        currentAssignees.some((a) => a.id === user.userId) ||
        existingTask.assignedToId === user.userId;

      if (!isAssigned) {
        return NextResponse.json(
          { error: "You can only update tasks assigned to you" },
          { status: 403 }
        );
      }
    }

    const data = await request.json();
    const { title, description, status, assignedToIds } = data;

    if (user.role === "team") {
      if (title || assignedToIds) {
        return NextResponse.json(
          { error: "You can only update status and description" },
          { status: 403 }
        );
      }
    }

    interface UpdateFields {
      title?: string;
      description?: string | null;
      status?: TaskStatus;
      assignedToId?: number | null;
      updatedAt: Date;
    }

    const updateData: UpdateFields = {
      updatedAt: new Date(),
    };

    let logAction: LogAction = "update";
    let logDetails = "Task updated";
    let affectedUserId: number | null = null;

    if (user.role === "lead") {
      if (title !== undefined) updateData.title = title;

      if (Array.isArray(assignedToIds)) {
        logAction = "assign";

        updateData.assignedToId =
          assignedToIds.length > 0 ? parseInt(assignedToIds[0]) : null;

        const newAssigneeIds = assignedToIds.map((id) => parseInt(id));

        const newAssignees = await db
          .select({
            id: users.id,
            name: users.name,
          })
          .from(users)
          .where(inArray(users.id, newAssigneeIds));

        if (newAssignees.length === 0) {
          logDetails = "Task unassigned from all users";
        } else {
          const newNames = newAssignees.map((a) => a.name).join(", ");
          const currentNames = currentAssignees.map((a) => a.name).join(", ");

          if (currentAssignees.length === 0) {
            logDetails = `Task assigned to ${newNames}`;
          } else {
            logDetails = `Task reassigned from ${currentNames} to ${newNames}`;
          }

          if (newAssignees.length > 0) {
            affectedUserId = newAssignees[0].id;
          }
        }

        await db.delete(taskAssignees).where(eq(taskAssignees.taskId, taskId));

        if (newAssigneeIds.length > 0) {
          const assigneeRecords = newAssigneeIds.map((userId) => ({
            taskId: taskId,
            userId: userId,
          }));

          await db.insert(taskAssignees).values(assigneeRecords);
        }
      }
    }

    if (description !== undefined) updateData.description = description;

    if (status !== undefined) {
      const validStatuses: TaskStatus[] = [
        "not_started",
        "on_progress",
        "done",
        "reject",
      ];
      if (!validStatuses.includes(status as TaskStatus)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }

      updateData.status = status as TaskStatus;
      if (logAction !== "assign") {
        logAction = "status_change";
        logDetails = `Status changed from ${existingTask.status} to ${status}`;
      }
    }

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId))
      .returning();

    await db.insert(activityLogs).values({
      taskId,
      userId: user.userId,
      action: logAction,
      details: logDetails,
      previousValue: JSON.stringify({
        ...existingTask,
        assignees: currentAssignees,
      }),
      newValue: JSON.stringify(updatedTask),
      affectedUserId,
    });

    const updatedAssignees = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(taskAssignees)
      .innerJoin(users, eq(taskAssignees.userId, users.id))
      .where(eq(taskAssignees.taskId, taskId));

    return NextResponse.json({
      task: {
        ...updatedTask,
        assignees: updatedAssignees,
      },
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

// DELETE a task (Lead only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await withAuth(request, "lead");

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const taskId = parseInt(params.id);

  if (isNaN(taskId)) {
    return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
  }

  try {
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.id, taskId),
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const currentAssignees = await db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(taskAssignees)
      .innerJoin(users, eq(taskAssignees.userId, users.id))
      .where(eq(taskAssignees.taskId, taskId));

    await db.insert(activityLogs).values({
      taskId,
      userId: user.userId,
      action: "delete" as LogAction,
      details: `Task "${existingTask.title}" deleted`,
      previousValue: JSON.stringify({
        ...existingTask,
        assignees: currentAssignees,
      }),
    });

    await db.delete(tasks).where(eq(tasks.id, taskId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
