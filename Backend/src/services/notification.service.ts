import { prisma } from "../lib/prisma.js";
import { getIO } from "../socket/socket.js";

type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_MOVED_TO_REVIEW";



export const createNotification = async (
  userId: string,
  type: NotificationType,
  message: string,
  taskId?: string,
) => {
  const notification =
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        taskId,
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

  const io = getIO();

  // Send notification to this user's sockets
  io.to(`user:${userId}`).emit(
    "notification-created",
    notification,
  );

  // Get fresh unread count
  const unreadCount =
    await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

  io.to(`user:${userId}`).emit(
    "unread-count-updated",
    {
      count: unreadCount,
    },
  );

  return notification;
};



export const getUserNotifications = async (
  userId: string,
) => {
  return prisma.notification.findMany({
    where: {
      userId,
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

    orderBy: {
      createdAt: "desc",
    },

    take: 50,
  });
};


export const getUnreadNotificationCount = async (
  userId: string,
) => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};



export const markNotificationAsRead = async (
  notificationId: string,
  userId: string,
) => {
  const notification =
    await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

  if (!notification) {
    return null;
  }

  const updated =
    await prisma.notification.update({
      where: {
        id: notificationId,
      },

      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

  const unreadCount =
    await getUnreadNotificationCount(
      userId,
    );

  getIO()
    .to(`user:${userId}`)
    .emit(
      "unread-count-updated",
      {
        count: unreadCount,
      },
    );

  return updated;
};



export const markAllNotificationsAsRead =
  async (
    userId: string,
  ) => {
    const result =
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },

        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

    getIO()
      .to(`user:${userId}`)
      .emit(
        "unread-count-updated",
        {
          count: 0,
        },
      );

    return result.count;
  };