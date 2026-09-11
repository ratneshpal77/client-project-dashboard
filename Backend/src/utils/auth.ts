import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const getAuthenticatedUser = (
  req: AuthenticatedRequest,
) => {
  if (!req.user) {
    throw new Error("Authentication required");
  }

  return req.user;
};