import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { getAuthenticatedUser } from "../utils/auth.js";

import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../services/notification.service.js";



export const getAll = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const notifications = await getUserNotifications(user.id);

  res.status(200).json({
    success: true,
    data: {
      notifications,
    },
  });
};



export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const count = await getUnreadNotificationCount(user.id);

  res.status(200).json({
    success: true,
    data: {
      count,
    },
  });
};



export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const notificationId = req.params.id;

  if (!notificationId || Array.isArray(notificationId)) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid notification ID",
        statusCode: 400,
      },
    });

    return;
  }

  const notification = await markNotificationAsRead(
    notificationId,
    user.id,
  );

  if (!notification) {
    res.status(404).json({
      success: false,
      error: {
        message: "Notification not found",
        statusCode: 404,
      },
    });

    return;
  }

  res.status(200).json({
    success: true,
    data: {
      notification,
    },
  });
};



export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const count = await markAllNotificationsAsRead(user.id);

  res.status(200).json({
    success: true,
    data: {
      message: "All notifications marked as read",
      count,
    },
  });
};