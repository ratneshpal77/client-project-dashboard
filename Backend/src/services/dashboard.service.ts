import { prisma } from "../lib/prisma.js";



export const getAdminDashboard = async () => {
  const [
    totalProjects,
    totalTasks,
    overdueTasks,
    tasksByStatus,
  ] = await Promise.all([
    prisma.project.count(),

    prisma.task.count(),

    prisma.task.count({
      where: {
        isOverdue: true,
      },
    }),

    prisma.task.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),
  ]);

  const statusCounts = {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  };

  for (const item of tasksByStatus) {
    statusCounts[item.status] =
      item._count._all;
  }

  return {
    totalProjects,
    totalTasks,
    tasksByStatus: statusCounts,
    overdueTasks,
  };
};



export const getProjectManagerDashboard =
  async (
    userId: string,
  ) => {
    const startOfToday = new Date();

    startOfToday.setHours(
      0,
      0,
      0,
      0,
    );

    const endOfWeek =
      new Date(startOfToday);

    const day =
      endOfWeek.getDay();

    const daysUntilSunday =
      day === 0
        ? 0
        : 7 - day;

    endOfWeek.setDate(
      endOfWeek.getDate() +
        daysUntilSunday,
    );

    endOfWeek.setHours(
      23,
      59,
      59,
      999,
    );

    const projects =
      await prisma.project.findMany({
        where: {
          createdBy: userId,
        },

        select: {
          id: true,
          name: true,

          _count: {
            select: {
              tasks: true,
            },
          },
        },
      });

    const projectIds =
      projects.map(
        (project) => project.id,
      );

    const tasksByPriority =
      projectIds.length === 0
        ? []
        : await prisma.task.groupBy({
            by: ["priority"],
            where: {
              projectId: {
                in: projectIds,
              },
            },
            _count: {
              _all: true,
            },
          });

    const upcomingTasks =
      projectIds.length === 0
        ? []
        : await prisma.task.findMany({
            where: {
              projectId: {
                in: projectIds,
              },

              dueDate: {
                gte: startOfToday,
                lte: endOfWeek,
              },

              status: {
                not: "DONE",
              },
            },

            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },

            orderBy: {
              dueDate: "asc",
            },

            take: 20,
          });

    return {
      projects,
      tasksByPriority,
      upcomingTasks,
    };
  };



export const getDeveloperDashboard =
  async (
    userId: string,
  ) => {
    const tasks =
      await prisma.task.findMany({
        where: {
          assignedDeveloperId: userId,
        },

        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },

        orderBy: {
          dueDate: "asc",
        },
      });

    const priorityRank: Record<
      string,
      number
    > = {
      CRITICAL: 1,
      HIGH: 2,
      MEDIUM: 3,
      LOW: 4,
    };

    tasks.sort((a, b) => {
      const priorityDifference =
        priorityRank[a.priority] -
        priorityRank[b.priority];

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      if (!a.dueDate && !b.dueDate) {
        return 0;
      }

      if (!a.dueDate) {
        return 1;
      }

      if (!b.dueDate) {
        return -1;
      }

      return (
        a.dueDate.getTime() -
        b.dueDate.getTime()
      );
    });

    return {
      tasks,
    };
  };