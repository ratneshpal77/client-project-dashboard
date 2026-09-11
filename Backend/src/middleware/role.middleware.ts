import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";

export type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "DEVELOPER";

export const authorize = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): void => {
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

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          message: "You do not have permission to access this resource",
          statusCode: 403,
        },
      });

      return;
    }

    next();
  };
};