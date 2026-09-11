import { prisma } from "../lib/prisma.js";

type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "DEVELOPER";



export const getRecentActivities = async (
  userId: string,
  role: UserRole,
) => {
  let where = {};

  if (role === "PROJECT_MANAGER") {
    where = {
      project: {
        createdBy: userId,
      },
    };
  }

  if (role === "DEVELOPER") {
    where = {
      task: {
        assignedDeveloperId: userId,
      },
    };
  }

  const activities = await prisma.activity.findMany({
    where,

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

      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 20,
  });

  return activities;
};



export const getProjectActivities = async (
  projectId: string,
  userId: string,
  role: UserRole,
) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },

    select: {
      id: true,
      createdBy: true,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  // PM can only access their own projects
  if (
    role === "PROJECT_MANAGER" &&
    project.createdBy !== userId
  ) {
    throw new Error("Project not found");
  }

  const activities = await prisma.activity.findMany({
    where: {
      projectId,

      // Developer only sees activities
      // related to their assigned tasks
      ...(role === "DEVELOPER"
        ? {
            task: {
              assignedDeveloperId: userId,
            },
          }
        : {}),
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

    orderBy: {
      createdAt: "desc",
    },

    take: 20,
  });

  return activities;
};




export const getTaskActivities = async (
  taskId: string,
  userId: string,
  role: UserRole,
) => {
  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },

    select: {
      id: true,
      assignedDeveloperId: true,

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

  // Developer can only see their assigned task activity
  if (
    role === "DEVELOPER" &&
    task.assignedDeveloperId !== userId
  ) {
    throw new Error("Task not found");
  }

  // PM can only see activities from their own projects
  if (
    role === "PROJECT_MANAGER" &&
    task.project.createdBy !== userId
  ) {
    throw new Error("Task not found");
  }

  const activities = await prisma.activity.findMany({
    where: {
      taskId,
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

    orderBy: {
      createdAt: "desc",
    },

    take: 20,
  });

  return activities;
};