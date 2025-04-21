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
import { and, desc, eq, inArray, SQL } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET all tasks
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;
  const searchParams = request.nextUrl.searchParams;
  const assignedToValues = searchParams.getAll("assignedTo");
  const statusValues = searchParams.getAll("status");
  const limit = searchParams.get("limit")
    ? parseInt(searchParams.get("limit") as string)
    : undefined;

  try {
    const conditions: SQL[] = [];

    if (user.role === "team") {
      const userAssignedTasks = await db
        .select({ taskId: taskAssignees.taskId })
        .from(taskAssignees)
        .where(eq(taskAssignees.userId, user.userId));

      const userTaskIds = userAssignedTasks.map((t) => t.taskId);

      if (userTaskIds.length > 0) {
        conditions.push(inArray(tasks.id, userTaskIds));
      } else {
        conditions.push(eq(tasks.assignedToId, user.userId));
      }
    } else if (assignedToValues.length > 0) {
      const assigneeIds = assignedToValues.map((id) => parseInt(id));
      const assignedTasks = await db
        .select({ taskId: taskAssignees.taskId })
        .from(taskAssignees)
        .where(inArray(taskAssignees.userId, assigneeIds));

      const assignedTaskIds = assignedTasks.map((t) => t.taskId);

      if (assignedTaskIds.length > 0) {
        conditions.push(inArray(tasks.id, assignedTaskIds));
      }
    }

    if (statusValues.length > 0) {
      const validStatuses: TaskStatus[] = [
        "not_started",
        "on_progress",
        "done",
        "reject",
      ];

      const filteredStatuses = statusValues.filter((status) =>
        validStatuses.includes(status as TaskStatus)
      ) as TaskStatus[];

      if (filteredStatuses.length > 0) {
        conditions.push(inArray(tasks.status, filteredStatuses));
      }
    }

    let tasksList;

    if (conditions.length === 0) {
      const baseQuery = db.select().from(tasks).orderBy(desc(tasks.createdAt));
      tasksList =
        limit !== undefined ? await baseQuery.limit(limit) : await baseQuery;
    } else if (conditions.length === 1) {
      const baseQuery = db
        .select()
        .from(tasks)
        .where(conditions[0])
        .orderBy(desc(tasks.createdAt));
      tasksList =
        limit !== undefined ? await baseQuery.limit(limit) : await baseQuery;
    } else {
      const baseQuery = db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.createdAt));
      tasksList =
        limit !== undefined ? await baseQuery.limit(limit) : await baseQuery;
    }

    const tasksWithAssignees = await Promise.all(
      tasksList.map(async (task) => {
        if (!task) return null;

        const assignees = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
          })
          .from(taskAssignees)
          .innerJoin(users, eq(taskAssignees.userId, users.id))
          .where(eq(taskAssignees.taskId, task.id));

        return {
          ...task,
          assignees,
        };
      })
    );

    const validTasks = tasksWithAssignees.filter((task) => task !== null);

    return NextResponse.json({ tasks: validTasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

// POST new task (Lead only)
export async function POST(request: NextRequest) {
  const authResult = await withAuth(request, "lead");

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const { title, description, status, assignedToIds } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const [newTask] = await db
      .insert(tasks)
      .values({
        title,
        description,
        status: status || ("not_started" as TaskStatus),
        assignedToId:
          Array.isArray(assignedToIds) && assignedToIds.length > 0
            ? parseInt(assignedToIds[0]) // Keep first assignee for backward compatibility
            : null,
        createdById: user.userId,
      })
      .returning();

    if (!newTask) {
      throw new Error("Failed to create task");
    }

    if (Array.isArray(assignedToIds) && assignedToIds.length > 0) {
      const assigneeRecords = assignedToIds.map((userId) => ({
        taskId: newTask.id,
        userId: parseInt(userId),
      }));

      await db.insert(taskAssignees).values(assigneeRecords);

      const assignees = await db
        .select({
          id: users.id,
          name: users.name,
        })
        .from(users)
        .where(
          inArray(
            users.id,
            assignedToIds.map((id) => parseInt(id))
          )
        );

      const assigneeNames = assignees.map((a) => a.name).join(", ");

      await db.insert(activityLogs).values({
        taskId: newTask.id,
        userId: user.userId,
        action: "create" as LogAction,
        details: `Task created and assigned to ${assigneeNames}`,
        newValue: JSON.stringify({
          ...newTask,
          assignees: assignees,
        }),
      });
    } else {
      await db.insert(activityLogs).values({
        taskId: newTask.id,
        userId: user.userId,
        action: "create" as LogAction,
        details: "Task created",
        newValue: JSON.stringify(newTask),
      });
    }

    const assignees = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(taskAssignees)
      .innerJoin(users, eq(taskAssignees.userId, users.id))
      .where(eq(taskAssignees.taskId, newTask.id));

    return NextResponse.json(
      {
        task: {
          ...newTask,
          assignees,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
