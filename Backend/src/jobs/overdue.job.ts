import cron from "node-cron";
import { prisma } from "../config/database.js";

export const startOverdueTaskJob = (): void => {
  // Runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      const result = await prisma.task.updateMany({
        where: {
          dueDate: {
            lt: now,
          },

          status: {
            not: "DONE",
          },

          isOverdue: false,
        },

        data: {
          isOverdue: true,
        },
      });

      if (result.count > 0) {
        console.log(
          `[Overdue Job] Marked ${result.count} task(s) as overdue`,
        );
      }
    } catch (error) {
      console.error(
        "[Overdue Job] Failed to update overdue tasks:",
        error,
      );
    }
  });

  console.log(
    "[Overdue Job] Scheduler started - runs every minute",
  );
};