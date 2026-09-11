import { Router } from "express";

import {
     adminTest,
       developerTest,
  login,
  logout,
    managerTest,
  refresh,
  register,
  me,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.post("/refresh", asyncHandler(refresh));
router.post("/logout", asyncHandler(logout));

router.get(
  "/me",
  authenticate,
  asyncHandler(me),
);

router.get(
  "/admin-test",
  authenticate,
  authorize("ADMIN"),
  asyncHandler(adminTest),
);

router.get(
  "/manager-test",
  authenticate,
  authorize("PROJECT_MANAGER"),
  asyncHandler(managerTest),
);

router.get(
  "/developer-test",
  authenticate,
  authorize("DEVELOPER"),
  asyncHandler(developerTest),
);

export default router;