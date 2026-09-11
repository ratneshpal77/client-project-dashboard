import type { Server as HTTPServer } from "node:http";
import { Server } from "socket.io";

import { prisma } from "../config/database.js";

import {
  verifyAccessToken,
  type AccessTokenPayload,
} from "../utils/jwt.js";

interface AuthenticatedSocket {
  userId: string;
  role: AccessTokenPayload["role"];
}

// userId -> active socket IDs
const onlineUsers = new Map<string, Set<string>>();

let io: Server | null = null;

export const initializeSocket = (
  httpServer: HTTPServer,
): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:3000",
      ],
      credentials: true,
    },
  });

  

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (
        typeof token !== "string" ||
        !token
      ) {
        return next(
          new Error("Authentication required"),
        );
      }

      const payload = verifyAccessToken(token);

      socket.data.user = {
        userId: payload.userId,
        role: payload.role,
      } satisfies AuthenticatedSocket;

      next();
    } catch {
      next(
        new Error(
          "Invalid or expired access token",
        ),
      );
    }
  });

  

  io.on("connection", (socket) => {
    const user =
      socket.data.user as AuthenticatedSocket;

    console.log(
      `Socket connected: ${socket.id} | User: ${user.userId} | Role: ${user.role}`,
    );



    let userSockets = onlineUsers.get(user.userId);

    if (!userSockets) {
      userSockets = new Set<string>();
      onlineUsers.set(user.userId, userSockets);
    }

    userSockets.add(socket.id);

    emitPresenceCount();

    // User-specific room
    socket.join(`user:${user.userId}`);

    // ==========================================================
    // JOIN PROJECT ROOM
    // ==========================================================

    socket.on(
      "join-project",
      async (
        projectId: string,
        callback,
      ) => {
        try {
          if (
            typeof projectId !== "string" ||
            !projectId
          ) {
            return callback({
              success: false,
              message: "Invalid project ID",
            });
          }

          const project =
            await prisma.project.findUnique({
              where: {
                id: projectId,
              },
              select: {
                id: true,
                createdBy: true,
                managerId: true,
              },
            });

          if (!project) {
            return callback({
              success: false,
              message: "Project not found",
            });
          }

          // ADMIN
          if (user.role === "ADMIN") {
            socket.join(
              `project:${projectId}`,
            );

            return callback({
              success: true,
              message: "Joined project room",
            });
          }

          // PROJECT MANAGER
          if (
            user.role === "PROJECT_MANAGER" &&
            project.createdBy !== user.userId
          ) {
            return callback({
              success: false,
              message:
                "You do not have access to this project",
            });
          }

          // DEVELOPER
          if (user.role === "DEVELOPER") {
            const assignedTask =
              await prisma.task.findFirst({
                where: {
                  projectId,
                  assignedDeveloperId:
                    user.userId,
                },
                select: {
                  id: true,
                },
              });

            if (!assignedTask) {
              return callback({
                success: false,
                message:
                  "You do not have access to this project",
              });
            }
          }

          socket.join(
            `project:${projectId}`,
          );

          return callback({
            success: true,
            message: "Joined project room",
          });
        } catch (error) {
          console.error(
            "Join project room error:",
            error,
          );

          return callback({
            success: false,
            message:
              "Failed to join project room",
          });
        }
      },
    );


    socket.on("disconnect", () => {
      const userSockets =
        onlineUsers.get(user.userId);

      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          onlineUsers.delete(user.userId);
        }
      }

      emitPresenceCount();

      console.log(
        `Socket disconnected: ${socket.id}`,
      );
    });
  });

  return io;
};



const emitPresenceCount = (): void => {
  if (!io) {
    return;
  }

  const count = onlineUsers.size;

  io.emit("presence-count", {
    count,
  });
};



export const getIO = (): Server => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized",
    );
  }

  return io;
};



export const isUserOnline = (
  userId: string,
): boolean => {
  return onlineUsers.has(userId);
};


export const getOnlineUserCount = (): number => {
  return onlineUsers.size;
};