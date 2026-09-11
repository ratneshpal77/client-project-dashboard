import { Router } from "express";

import {
  create,
  getAll,
  getOne,
  remove,
  update,
} from "../controllers/client.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize("ADMIN"),
  asyncHandler(create),
);

router.get(
  "/",
  authorize("ADMIN", "PROJECT_MANAGER"),
  asyncHandler(getAll),
);

router.get(
  "/:id",
  authorize("ADMIN", "PROJECT_MANAGER"),
  asyncHandler(getOne),
);

router.patch(
  "/:id",
  authorize("ADMIN"),
  asyncHandler(update),
);

router.delete(
  "/:id",
  authorize("ADMIN"),
  asyncHandler(remove),
);

export default router;