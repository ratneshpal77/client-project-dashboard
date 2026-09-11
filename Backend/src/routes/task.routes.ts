import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/task.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();



router.post(
  "/projects/:projectId/tasks",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  create,
);



router.get(
  "/projects/:projectId/tasks",
  authenticate,
  authorize(
    "ADMIN",
    "PROJECT_MANAGER",
    "DEVELOPER",
  ),
  getAll,
);



router.get(
  "/tasks/:id",
  authenticate,
  authorize(
    "ADMIN",
    "PROJECT_MANAGER",
    "DEVELOPER",
  ),
  getOne,
);



router.patch(
  "/tasks/:id",
  authenticate,
  authorize(
    "ADMIN",
    "PROJECT_MANAGER",
    "DEVELOPER",
  ),
  update,
);



router.delete(
  "/tasks/:id",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  remove,
);

export default router;