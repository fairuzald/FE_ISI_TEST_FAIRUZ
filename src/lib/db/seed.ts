import { hashPassword } from "@/lib/auth/hash-seed";
import { db } from "./index";
import { activityLogs, taskAssignees, tasks, users } from "./schema";

async function seed() {
  try {
    console.log("Starting database seeding...");

    const existingUsers = await db.select().from(users);

    if (existingUsers.length > 0) {
      console.log(
        `Database already has ${existingUsers.length} users. Skipping seed.`
      );
      return;
    }

    console.log("Creating users...");

    const leadPassword = await hashPassword("leadpassword");
    const [leadUser] = await db
      .insert(users)
      .values({
        email: "lead@example.com",
        password: leadPassword,
        name: "Lead User",
        role: "lead",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("Created lead user: lead@example.com / leadpassword");

    const teamNames = ["Team Member 1", "Team Member 2", "Team Member 3"];
    const teamMembers = [];

    for (let i = 0; i < teamNames.length; i++) {
      const teamPassword = await hashPassword("teampassword");
      const [teamMember] = await db
        .insert(users)
        .values({
          email: `team${i + 1}@example.com`,
          password: teamPassword,
          name: teamNames[i],
          role: "team",
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      teamMembers.push(teamMember);
      console.log(`Created team user: team${i + 1}@example.com / teampassword`);
    }

    console.log("\nCreating sample tasks...");

    const [task1] = await db
      .insert(tasks)
      .values({
        title: "Design Login Page",
        description:
          "Create a responsive login page with form validation. Should include email and password fields, remember me checkbox, and forgot password link.",
        status: "not_started",
        createdById: leadUser.id,
        assignedToId: teamMembers[0].id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      })
      .returning();

    await db.insert(taskAssignees).values({
      taskId: task1.id,
      userId: teamMembers[0].id,
      assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    await db.insert(activityLogs).values({
      taskId: task1.id,
      userId: leadUser.id,
      action: "create",
      details: "Task created and assigned to Team Member 1",
      newValue: JSON.stringify(task1),
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    console.log(`Created task: "${task1.title}" (Not Started)`);

    const [task2] = await db
      .insert(tasks)
      .values({
        title: "Implement Authentication Service",
        description:
          "Create authentication service with JWT token implementation. Add login, logout, and token refresh functionality.",
        status: "on_progress",
        createdById: leadUser.id,
        assignedToId: teamMembers[1].id,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      })
      .returning();

    await db.insert(taskAssignees).values([
      {
        taskId: task2.id,
        userId: teamMembers[1].id,
        assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        taskId: task2.id,
        userId: teamMembers[2].id,
        assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ]);

    await db.insert(activityLogs).values([
      {
        taskId: task2.id,
        userId: leadUser.id,
        action: "create",
        details: "Task created and assigned to Team Member 2, Team Member 3",
        newValue: JSON.stringify(task2),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        taskId: task2.id,
        userId: teamMembers[1].id,
        action: "status_change",
        details: "Status changed from not_started to on_progress",
        previousValue: JSON.stringify({ ...task2, status: "not_started" }),
        newValue: JSON.stringify({ ...task2, status: "on_progress" }),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`Created task: "${task2.title}" (In Progress)`);

    const [task3] = await db
      .insert(tasks)
      .values({
        title: "Setup Project Structure",
        description:
          "Initialize Next.js project with TypeScript, configure ESLint and Prettier, setup folder structure.",
        status: "done",
        createdById: leadUser.id,
        assignedToId: teamMembers[2].id,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      })
      .returning();

    await db.insert(taskAssignees).values({
      taskId: task3.id,
      userId: teamMembers[2].id,
      assignedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    });

    await db.insert(activityLogs).values([
      {
        taskId: task3.id,
        userId: leadUser.id,
        action: "create",
        details: "Task created and assigned to Team Member 3",
        newValue: JSON.stringify(task3),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        taskId: task3.id,
        userId: teamMembers[2].id,
        action: "status_change",
        details: "Status changed from not_started to on_progress",
        previousValue: JSON.stringify({ ...task3, status: "not_started" }),
        newValue: JSON.stringify({ ...task3, status: "on_progress" }),
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        taskId: task3.id,
        userId: teamMembers[2].id,
        action: "status_change",
        details: "Status changed from on_progress to done",
        previousValue: JSON.stringify({ ...task3, status: "on_progress" }),
        newValue: JSON.stringify({ ...task3, status: "done" }),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`Created task: "${task3.title}" (Done)`);

    const [task4] = await db
      .insert(tasks)
      .values({
        title: "Integrate Third-party Payment Service",
        description:
          "Integrate with PayPal or Stripe for payment processing. This task was rejected because we decided to use a different solution.",
        status: "reject",
        createdById: leadUser.id,
        assignedToId: null,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      })
      .returning();

    await db.insert(activityLogs).values([
      {
        taskId: task4.id,
        userId: leadUser.id,
        action: "status_change",
        details: "Status changed from not_started to reject",
        previousValue: JSON.stringify({ ...task4, status: "not_started" }),
        newValue: JSON.stringify({ ...task4, status: "reject" }),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(`Created task: "${task4.title}" (Rejected)`);

    const [task5] = await db
      .insert(tasks)
      .values({
        title: "Implement User Dashboard",
        description:
          "Create a dashboard with user statistics, recent activities, and notifications. Include charts and graphs for data visualization.",
        status: "on_progress",
        createdById: leadUser.id,
        assignedToId: teamMembers[0].id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      })
      .returning();

    await db.insert(taskAssignees).values(
      teamMembers.map((member) => ({
        taskId: task5.id,
        userId: member.id,
        assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      }))
    );

    await db.insert(activityLogs).values([
      {
        taskId: task5.id,
        userId: leadUser.id,
        action: "create",
        details: `Task created and assigned to ${teamMembers
          .map((tm) => tm.name)
          .join(", ")}`,
        newValue: JSON.stringify(task5),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        taskId: task5.id,
        userId: teamMembers[0].id,
        action: "status_change",
        details: "Status changed from not_started to on_progress",
        previousValue: JSON.stringify({ ...task5, status: "not_started" }),
        newValue: JSON.stringify({ ...task5, status: "on_progress" }),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        taskId: task5.id,
        userId: teamMembers[0].id,
        action: "update",
        details: "Task description updated",
        previousValue: JSON.stringify({
          ...task5,
          description: "Create a user dashboard with statistics.",
        }),
        newValue: JSON.stringify(task5),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log(
      `Created task: "${task5.title}" (In Progress, multiple assignees)`
    );

    console.log("\nDatabase seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seed();
