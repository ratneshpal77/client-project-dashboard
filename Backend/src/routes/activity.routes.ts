import { Router } from "express";

import {
  getRecent,
  getProjectActivity,
  getTaskActivity,
} from "../controllers/activity.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();



router.get(
  "/activities/recent",
  authenticate,
  authorize(
    "ADMIN",
    "PROJECT_MANAGER",
    "DEVELOPER",
  ),
  getRecent,
);



router.get(
  "/projects/:projectId/activities",
  authenticate,
  authorize(
    "ADMIN",
    "PROJECT_MANAGER",
    "DEVELOPER",
  ),
  getProjectActivity,
);



router.get(
  "/tasks/:taskId/activities",
  authenticate,
  authorize(
    "ADMIN",
    "PROJECT_MANAGER",
    "DEVELOPER",
  ),
  getTaskActivity,
);

export default router;