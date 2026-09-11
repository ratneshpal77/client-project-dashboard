import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/project.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();



router.post(
  "/",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  create,
);



router.get(
  "/",
  authenticate,
  authorize(
    "ADMIN",
    "PROJECT_MANAGER",
    "DEVELOPER",
  ),
  getAll,
);



router.get(
  "/:id",
  authenticate,
  authorize(
    "ADMIN",
    "PROJECT_MANAGER",
    "DEVELOPER",
  ),
  getOne,
);



router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  update,
);



router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "PROJECT_MANAGER"),
  remove,
);

export default router;