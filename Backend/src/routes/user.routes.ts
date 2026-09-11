import { Router } from "express";

import {
  getDevelopers,
} from "../controllers/user.controller.js";

import {
  authenticate,
} from "../middleware/auth.middleware.js";

import {
  authorize,
} from "../middleware/role.middleware.js";

import {
  asyncHandler,
} from "../utils/asyncHandler.js";

const router = Router();



router.get(
  "/developers",
  authenticate,
  authorize(
    "ADMIN",
    "PROJECT_MANAGER",
  ),
  asyncHandler(getDevelopers),
);

export default router;