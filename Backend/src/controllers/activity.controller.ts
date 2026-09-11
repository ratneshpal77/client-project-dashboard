import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import { getAuthenticatedUser } from "../utils/auth.js";

import {
  getRecentActivities,
  getProjectActivities,
  getTaskActivities,
} from "../services/activity.service.js";



export const getRecent = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const activities = await getRecentActivities(
    user.id,
    user.role,
  );

  res.status(200).json({
    success: true,
    data: {
      activities,
    },
  });
};



export const getProjectActivity = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const projectId = req.params.projectId;

  if (!projectId || Array.isArray(projectId)) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid project ID",
        statusCode: 400,
      },
    });

    return;
  }

  const activities = await getProjectActivities(
    projectId,
    user.id,
    user.role,
  );

  res.status(200).json({
    success: true,
    data: {
      activities,
    },
  });
};



export const getTaskActivity = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const taskId = req.params.taskId;

  if (!taskId || Array.isArray(taskId)) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid task ID",
        statusCode: 400,
      },
    });

    return;
  }

  const activities = await getTaskActivities(
    taskId,
    user.id,
    user.role,
  );

  res.status(200).json({
    success: true,
    data: {
      activities,
    },
  });
};