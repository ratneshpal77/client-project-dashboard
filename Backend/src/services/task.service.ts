import { prisma } from "../config/database.js";
import { getIO } from "../socket/socket.js";

import type {
  CreateTaskInput,
  UpdateTaskInput,
} from "../validators/task.validator.js";

type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "DEVELOPER";



export const createTask = async (
  projectId: string,
  input: CreateTaskInput,
  userId: string,
  role: UserRole,
) => {
 

  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  

  if (
    role === "PROJECT_MANAGER" &&
    project.createdBy !== userId
  ) {
    throw new Error(
      "You can only manage tasks in your own projects",
    );
  }

 

  if (input.assignedDeveloperId) {
    const developer = await prisma.user.findUnique({
      where: {
        id: input.assignedDeveloperId,
      },

      select: {
        id: true,
        role: true,
      },
    });

    if (!developer) {
      throw new Error("Developer not found");
    }

    if (developer.role !== "DEVELOPER") {
      throw new Error(
        "Task can only be assigned to a developer",
      );
    }
  }



  const task = await prisma.task.create({
    data: {
      projectId,
      title: input.title,
      description: input.description,
      assignedDeveloperId:
        input.assignedDeveloperId,
      status: input.status ?? "TODO",
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate,

      isOverdue:
        input.dueDate !== undefined &&
        input.dueDate < new Date(),
    },

    include: {
      assignedDeveloper: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },

      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });



  const activity =
    await prisma.activity.create({
      data: {
        projectId,
        taskId: task.id,
        userId,
        action: "TASK_CREATED",
        newValue: task.title,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },

        task: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

 

  getIO()
    .to(`project:${projectId}`)
    .emit("activity-created", activity);

  

  if (task.assignedDeveloperId) {
    const notification =
      await prisma.notification.create({
        data: {
          userId:
            task.assignedDeveloperId,

          taskId: task.id,

          type: "TASK_ASSIGNED",

          message:
            `You have been assigned task: ${task.title}`,
        },

        include: {
          task: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });

    // Send notification to developer
    getIO()
      .to(
        `user:${task.assignedDeveloperId}`,
      )
      .emit(
        "notification-created",
        notification,
      );

    // Send fresh unread count
    const unreadCount =
      await prisma.notification.count({
        where: {
          userId:
            task.assignedDeveloperId,

          isRead: false,
        },
      });

    getIO()
      .to(
        `user:${task.assignedDeveloperId}`,
      )
      .emit(
        "unread-count-updated",
        {
          count: unreadCount,
        },
      );
  }

  return task;
};



export const getProjectTasks = async (
  projectId: string,
  userId: string,
  role: UserRole,
  filters?: {
    status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    fromDate?: Date;
    toDate?: Date;
  },
) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // PM can only see tasks from their own projects
  if (
    role === "PROJECT_MANAGER" &&
    project.createdBy !== userId
  ) {
    throw new Error("Project not found");
  }

  const tasks = await prisma.task.findMany({
    where: {
      projectId,

      ...(role === "DEVELOPER"
        ? {
            assignedDeveloperId: userId,
          }
        : {}),



      ...(filters?.status
        ? {
            status: filters.status,
          }
        : {}),

 

      ...(filters?.priority
        ? {
            priority: filters.priority,
          }
        : {}),

 

      ...(filters?.fromDate ||
      filters?.toDate
        ? {
            dueDate: {
              ...(filters.fromDate
                ? {
                    gte: filters.fromDate,
                  }
                : {}),

              ...(filters.toDate
                ? {
                    lte: filters.toDate,
                  }
                : {}),
            },
          }
        : {}),
    },

    include: {
      assignedDeveloper: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return tasks;
};



export const getTaskById = async (
  taskId: string,
  userId: string,
  role: UserRole,
) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },

    include: {
      project: {
        select: {
          id: true,
          name: true,
          createdBy: true,
        },
      },

      assignedDeveloper: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!task) {
    return null;
  }

  // Developer can only see their assigned task
  if (
    role === "DEVELOPER" &&
    task.assignedDeveloperId !== userId
  ) {
    return null;
  }

  // PM can only see tasks in their own project
  if (
    role === "PROJECT_MANAGER" &&
    task.project.createdBy !== userId
  ) {
    return null;
  }

  return task;
};



export const updateTask = async (
  taskId: string,
  input: UpdateTaskInput,
  userId: string,
  role: UserRole,
) => {
 

  const existingTask = await prisma.task.findUnique({
    where: {
      id: taskId,
    },

    include: {
      project: {
        select: {
          id: true,
          createdBy: true,
          managerId: true,
        },
      },
    },
  });

  if (!existingTask) {
    throw new Error("Task not found");
  }



  if (
    role === "DEVELOPER" &&
    existingTask.assignedDeveloperId !== userId
  ) {
    throw new Error(
      "You can only update tasks assigned to you",
    );
  }

  

  if (
    role === "PROJECT_MANAGER" &&
    existingTask.project.createdBy !== userId
  ) {
    throw new Error(
      "You can only manage tasks in your own projects",
    );
  }

 

  if (
    role === "DEVELOPER" &&
    input.assignedDeveloperId !== undefined
  ) {
    throw new Error(
      "Developers cannot reassign tasks",
    );
  }

  

  if (input.assignedDeveloperId) {
    const developer = await prisma.user.findUnique({
      where: {
        id: input.assignedDeveloperId,
      },

      select: {
        id: true,
        role: true,
      },
    });

    if (!developer) {
      throw new Error("Developer not found");
    }

    if (developer.role !== "DEVELOPER") {
      throw new Error(
        "Task can only be assigned to a developer",
      );
    }
  }

 

  const oldStatus = existingTask.status;

  const newStatus =
    input.status ?? oldStatus;

  const isOverdue =
    input.dueDate !== undefined
      ? input.dueDate !== null &&
        input.dueDate < new Date() &&
        newStatus !== "DONE"
      : existingTask.isOverdue;



  const task = await prisma.task.update({
    where: {
      id: taskId,
    },

    data: {
      ...input,
      isOverdue,
    },

    include: {
      assignedDeveloper: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },

      project: {
        select: {
          id: true,
          name: true,
          managerId: true,
        },
      },
    },
  });



  if (
    input.status &&
    input.status !== oldStatus
  ) {
    const activity =
      await prisma.activity.create({
        data: {
          projectId:
            existingTask.project.id,

          taskId,

          userId,

          action:
            "TASK_STATUS_CHANGED",

          oldValue: oldStatus,

          newValue: input.status,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },

          task: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });

   

    getIO()
      .to(
        `project:${existingTask.project.id}`,
      )
      .emit(
        "activity-created",
        activity,
      );



    if (
      input.status === "IN_REVIEW"
    ) {
      const managerId =
        task.project.managerId ??
        existingTask.project.createdBy;

      // Don't notify the same user who
      // performed the action
      if (managerId !== userId) {
        const notification =
          await prisma.notification.create({
            data: {
              userId: managerId,

              taskId: task.id,

              type:
                "TASK_MOVED_TO_REVIEW",

              message:
                `Task "${task.title}" has been moved to review`,
            },

            include: {
              task: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                },
              },
            },
          });

       
        getIO()
          .to(`user:${managerId}`)
          .emit(
            "notification-created",
            notification,
          );

      

        const unreadCount =
          await prisma.notification.count({
            where: {
              userId: managerId,
              isRead: false,
            },
          });

        getIO()
          .to(`user:${managerId}`)
          .emit(
            "unread-count-updated",
            {
              count: unreadCount,
            },
          );
      }
    }
  }



  if (
    input.assignedDeveloperId !==
      undefined &&
    input.assignedDeveloperId !==
      existingTask.assignedDeveloperId
  ) {
    const activity =
      await prisma.activity.create({
        data: {
          projectId:
            existingTask.project.id,

          taskId,

          userId,

          action:
            "TASK_ASSIGNED",

          oldValue:
            existingTask.assignedDeveloperId ??
            "UNASSIGNED",

          newValue:
            input.assignedDeveloperId ??
            "UNASSIGNED",
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },

          task: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      });


    getIO()
      .to(
        `project:${existingTask.project.id}`,
      )
      .emit(
        "activity-created",
        activity,
      );

   

    if (
      input.assignedDeveloperId
    ) {
      const notification =
        await prisma.notification.create({
          data: {
            userId:
              input.assignedDeveloperId,

            taskId: task.id,

            type:
              "TASK_ASSIGNED",

            message:
              `You have been assigned task: ${task.title}`,
          },

          include: {
            task: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
        });

      

      getIO()
        .to(
          `user:${input.assignedDeveloperId}`,
        )
        .emit(
          "notification-created",
          notification,
        );

     

      const unreadCount =
        await prisma.notification.count({
          where: {
            userId:
              input.assignedDeveloperId,

            isRead: false,
          },
        });

      getIO()
        .to(
          `user:${input.assignedDeveloperId}`,
        )
        .emit(
          "unread-count-updated",
          {
            count: unreadCount,
          },
        );
    }
  }

  return task;
};



export const deleteTask = async (
  taskId: string,
  userId: string,
  role: UserRole,
) => {
 

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },

    include: {
      project: {
        select: {
          id: true,
          createdBy: true,
        },
      },
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

 

  if (role === "DEVELOPER") {
    throw new Error(
      "Developers cannot delete tasks",
    );
  }



  if (
    role === "PROJECT_MANAGER" &&
    task.project.createdBy !== userId
  ) {
    throw new Error(
      "You can only delete tasks from your own projects",
    );
  }



  await prisma.task.delete({
    where: {
      id: taskId,
    },
  });

 

  getIO()
    .to(`project:${task.project.id}`)
    .emit("task-deleted", {
      taskId,
      projectId: task.project.id,
    });
};