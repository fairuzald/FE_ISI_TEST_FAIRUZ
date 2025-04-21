import {
  relations,
  type InferInsertModel,
  type InferSelectModel,
} from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["lead", "team"]);
export const taskStatusEnum = pgEnum("task_status", [
  "not_started",
  "on_progress",
  "done",
  "reject",
]);
export const logActionEnum = pgEnum("log_action", [
  "create",
  "update",
  "delete",
  "status_change",
  "assign",
]);

export type UserRole = "lead" | "team";
export type TaskStatus = "not_started" | "on_progress" | "done" | "reject";
export type LogAction =
  | "create"
  | "update"
  | "delete"
  | "status_change"
  | "assign";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("team"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("not_started"),
  createdById: integer("created_by_id")
    .notNull()
    .references(() => users.id),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const taskAssignees = pgTable(
  "task_assignees",
  {
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.taskId, table.userId] }),
    };
  }
);

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  action: logActionEnum("action").notNull(),
  details: text("details"),
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  affectedUserId: integer("affected_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User relations
export const usersRelations = relations(users, ({ many }) => ({
  createdTasks: many(tasks, { relationName: "userCreatedTasks" }),
  assignedTasks: many(tasks, { relationName: "userAssignedTasks" }),
  taskAssignments: many(taskAssignees, { relationName: "userTaskAssignments" }),
  activityLogsAsActor: many(activityLogs, { relationName: "userActionLogs" }),
  activityLogsAsAffected: many(activityLogs, {
    relationName: "userAffectedLogs",
  }),
}));

// Task relations
export const tasksRelations = relations(tasks, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "userCreatedTasks",
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: "userAssignedTasks",
  }),
  assignees: many(taskAssignees, { relationName: "taskAssignees" }),
  activityLogs: many(activityLogs, { relationName: "taskActivityLogs" }),
}));

// Task assignees relations
export const taskAssigneesRelations = relations(taskAssignees, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAssignees.taskId],
    references: [tasks.id],
    relationName: "taskAssignees",
  }),
  user: one(users, {
    fields: [taskAssignees.userId],
    references: [users.id],
    relationName: "userTaskAssignments",
  }),
}));

// Activity logs relations with clearly named relations
export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  task: one(tasks, {
    fields: [activityLogs.taskId],
    references: [tasks.id],
    relationName: "taskActivityLogs",
  }),
  actor: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
    relationName: "userActionLogs",
  }),
  affectedUser: one(users, {
    fields: [activityLogs.affectedUserId],
    references: [users.id],
    relationName: "userAffectedLogs",
  }),
}));

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Task = InferSelectModel<typeof tasks>;
export type NewTask = InferInsertModel<typeof tasks>;

export type TaskAssignee = InferSelectModel<typeof taskAssignees>;
export type NewTaskAssignee = InferInsertModel<typeof taskAssignees>;

export type ActivityLog = InferSelectModel<typeof activityLogs>;
export type NewActivityLog = InferInsertModel<typeof activityLogs>;
