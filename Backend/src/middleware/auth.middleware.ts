import type { NextFunction, Request, Response } from "express";

import { prisma } from "../config/database.js";
import { verifyAccessToken } from "../utils/jwt.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER";
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: {
          message: "Authentication required",
          statusCode: 401,
        },
      });

      return;
    }

    const token = authorization.substring(7);

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          message: "User no longer exists",
          statusCode: 401,
        },
      });

      return;
    }

    if (user.role !== payload.role) {
      res.status(401).json({
        success: false,
        error: {
          message: "Invalid authentication credentials",
          statusCode: 401,
        },
      });

      return;
    }

    req.user = user;

    next();
  } catch {
    res.status(401).json({
      success: false,
      error: {
        message: "Invalid or expired access token",
        statusCode: 401,
      },
    });
  }
};