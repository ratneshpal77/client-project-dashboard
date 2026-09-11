import type { Response } from "express";

import type {
  AuthenticatedRequest,
} from "../middleware/auth.middleware.js";

import { prisma } from "../config/database.js";



export const getDevelopers = async (
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

  const developers =
    await prisma.user.findMany({
      where: {
        role: "DEVELOPER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

  res.status(200).json({
    success: true,
    data: {
      developers,
    },
  });
};