import "dotenv/config";
import { createServer } from "node:http";
import { startOverdueTaskJob } from "./jobs/overdue.job.js";

import app from "./app.js";
import { initializeSocket } from "./socket/socket.js";

import {
  connectDatabase,
  disconnectDatabase,
} from "./config/database.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    startOverdueTaskJob();

    // Create HTTP server from Express app
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`,
      );

      console.log(
        `Socket.IO running on ws://localhost:${PORT}`,
      );
    });

    const shutdown = async (
      signal: string,
    ): Promise<void> => {
      console.log(
        `${signal} received. Shutting down...`,
      );

      httpServer.close(async () => {
        await disconnectDatabase();

        process.exit(0);
      });
    };

    process.on("SIGINT", () => {
      void shutdown("SIGINT");
    });

    process.on("SIGTERM", () => {
      void shutdown("SIGTERM");
    });
  } catch (error) {
    console.error(
      "Failed to start server:",
      error,
    );

    process.exit(1);
  }
};

void startServer();