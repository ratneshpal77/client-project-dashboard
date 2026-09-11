import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "../store/auth.store";
import type { UserRole } from "../types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({
  children,
  allowedRoles,
}: ProtectedRouteProps) => {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useSelector(
    (state: RootState) => state.auth,
  );

  // Still checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // User authenticated but wrong role
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    if (user.role === "ADMIN") {
      return (
        <Navigate
          to="/admin/dashboard"
          replace
        />
      );
    }

    if (
      user.role ===
      "PROJECT_MANAGER"
    ) {
      return (
        <Navigate
          to="/manager/dashboard"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/developer/dashboard"
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;