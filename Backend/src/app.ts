import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/client.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import activityRoutes from "./routes/activity.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import userRoutes from "./routes/user.routes.js";



const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(
  "/api/dashboard",
  dashboardRoutes,
);


app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", taskRoutes);
app.use("/api", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Client Project Dashboard API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handler MUST be last
app.use(errorHandler);

export default app;