import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../services/auth.service.js";

import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator.js";

const REFRESH_COOKIE_NAME = "refreshToken";

const setRefreshCookie = (
  res: Response,
  refreshToken: string,
): void => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth",
  });
};

const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth",
  });
};



export const register = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = registerSchema.parse(req.body);

  const result = await registerUser(input);

  setRefreshCookie(res, result.refreshToken);

  res.status(201).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};



export const login = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const input = loginSchema.parse(req.body);

  const result = await loginUser(input);

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};



export const refresh = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const refreshToken = req.cookies?.[
    REFRESH_COOKIE_NAME
  ] as string | undefined;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: {
        message: "Refresh token is required",
        statusCode: 401,
      },
    });

    return;
  }

  const accessToken = await refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,
    data: {
      accessToken,
    },
  });
};



export const logout = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const refreshToken = req.cookies?.[
    REFRESH_COOKIE_NAME
  ] as string | undefined;

  if (refreshToken) {
    await logoutUser(refreshToken);
  }

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    data: {
      message: "Logged out successfully",
    },
  });
};





export const me = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        message: "Authentication required",
        statusCode: 401,
      },
    });

    return;
  }

  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
};







export const adminTest = async (
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      message: "Admin resource accessed successfully",
    },
  });
};

export const managerTest = async (
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      message: "Project Manager resource accessed successfully",
    },
  });
};

export const developerTest = async (
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  res.status(200).json({
    success: true,
    data: {
      message: "Developer resource accessed successfully",
    },
  });
};