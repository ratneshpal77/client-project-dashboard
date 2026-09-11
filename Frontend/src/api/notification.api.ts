import api from "./axios";

// ============================================================
// NOTIFICATION TYPES
// ============================================================

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_MOVED_TO_REVIEW";

export interface NotificationTask {
  id: string;
  title: string;
  status: string;
}

export interface Notification {
  id: string;
  userId: string;
  taskId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  task?: NotificationTask | null;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
  };
}

interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

interface NotificationActionResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// ============================================================
// GET NOTIFICATIONS
// ============================================================

export const getNotificationsApi =
  async (): Promise<NotificationsResponse> => {
    const response =
      await api.get<NotificationsResponse>(
        "/notifications",
      );

    return response.data;
  };

// ============================================================
// GET UNREAD COUNT
// ============================================================

export const getUnreadNotificationCountApi =
  async (): Promise<UnreadCountResponse> => {
    const response =
      await api.get<UnreadCountResponse>(
        "/notifications/unread-count",
      );

    return response.data;
  };

// ============================================================
// MARK ONE AS READ
// ============================================================

export const markNotificationAsReadApi =
  async (
    notificationId: string,
  ): Promise<NotificationActionResponse> => {
    const response =
      await api.patch<NotificationActionResponse>(
        `/notifications/${notificationId}/read`,
      );

    return response.data;
  };

// ============================================================
// MARK ALL AS READ
// ============================================================

export const markAllNotificationsAsReadApi =
  async (): Promise<NotificationActionResponse> => {
    const response =
      await api.patch<NotificationActionResponse>(
        "/notifications/read-all",
      );

    return response.data;
  };