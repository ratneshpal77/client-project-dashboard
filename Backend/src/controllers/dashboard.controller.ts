import type { Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import { getAuthenticatedUser } from "../utils/auth.js";

import {
  getAdminDashboard,
  getProjectManagerDashboard,
  getDeveloperDashboard,
} from "../services/dashboard.service.js";

import {
  getOnlineUserCount,
} from "../socket/socket.js";



export const adminDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user =
    getAuthenticatedUser(req);

  const dashboard =
    await getAdminDashboard();

  res.status(200).json({
    success: true,
    data: {
      ...dashboard,
      activeUsersOnline:
        getOnlineUserCount(),
    },
  });
};



export const projectManagerDashboard =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const user =
      getAuthenticatedUser(req);

    const dashboard =
      await getProjectManagerDashboard(
        user.id,
      );

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  };



export const developerDashboard =
  async (
    req: AuthenticatedRequest,
    res: Response,
  ): Promise<void> => {
    const user =
      getAuthenticatedUser(req);

    const dashboard =
      await getDeveloperDashboard(
        user.id,
      );

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  };