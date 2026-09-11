import { Router } from "express";

import {
  adminDashboard,
  projectManagerDashboard,
  developerDashboard,
} from "../controllers/dashboard.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  adminDashboard,
);

router.get(
  "/project-manager",
  authenticate,
  authorize("PROJECT_MANAGER"),
  projectManagerDashboard,
);

router.get(
  "/developer",
  authenticate,
  authorize("DEVELOPER"),
  developerDashboard,
);

export default router;