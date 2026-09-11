import { Router } from "express";

import {
  getAll,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// GET /api/notifications
router.get(
  "/",
  authenticate,
  getAll,
);

// GET /api/notifications/unread-count
router.get(
  "/unread-count",
  authenticate,
  getUnreadCount,
);

// PATCH /api/notifications/:id/read
router.patch(
  "/:id/read",
  authenticate,
  markAsRead,
);

// PATCH /api/notifications/read-all
router.patch(
  "/read-all",
  authenticate,
  markAllAsRead,
);

export default router;