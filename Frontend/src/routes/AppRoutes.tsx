import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "../pages/auth/Login";

import AppLayout from "../components/layout/AppLayout";
import RoleLayout from "../components/layout/RoleLayout";
import ProtectedRoute from "./ProtectedRoute";
import Settings from "../pages/settings/Settings";

import Tasks from "../pages/tasks/Tasks";

import AdminDashboardPage from "../pages/admin/AdminDashboard";
import ManagerDashboardPage from "../pages/manager/ManagerDashboard";
import DeveloperDashboardPage from "../pages/developer/DeveloperDashboard";

import Clients from "../pages/clients/Clients";
import Activity from "../pages/activity/Activity";

import Projects from "../pages/projects/Projects";
import ProjectDetails from "../pages/projects/ProjectDetails";

// ============================================================
// APPLICATION ROUTES
// ============================================================

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================================== */}
        {/* PUBLIC */}
        {/* ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ================================================== */}
        {/* ADMIN */}
        {/* ================================================== */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN"]}
            >
              <AppLayout role="ADMIN">
                <AdminDashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ================================================== */}
        {/* PROJECT MANAGER */}
        {/* ================================================== */}

        <Route
          path="/manager/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["PROJECT_MANAGER"]}
            >
              <AppLayout role="PROJECT_MANAGER">
                <ManagerDashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ================================================== */}
        {/* DEVELOPER */}
        {/* ================================================== */}

        <Route
          path="/developer/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["DEVELOPER"]}
            >
              <AppLayout role="DEVELOPER">
                <DeveloperDashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ================================================== */}
        {/* ACTIVITY */}
        {/* Accessible by ADMIN, PM and DEVELOPER */}
        {/* ================================================== */}

        <Route
          path="/activity"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "PROJECT_MANAGER",
                "DEVELOPER",
              ]}
            >
              <RoleLayout>
                <Activity />
              </RoleLayout>
            </ProtectedRoute>
          }
        />

        {/* ================================================== */}
        {/* PROJECTS */}
        {/* Accessible by ADMIN, PM and DEVELOPER */}
        {/* ================================================== */}

        <Route
          path="/projects"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "PROJECT_MANAGER",
                "DEVELOPER",
              ]}
            >
              <RoleLayout>
                <Projects />
              </RoleLayout>
            </ProtectedRoute>
          }
        />

        {/* ================================================== */}
        {/* TASKS */}
        {/* Accessible by ADMIN, PM and DEVELOPER */}
        {/* ================================================== */}

        <Route
          path="/tasks"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "PROJECT_MANAGER",
                "DEVELOPER",
              ]}
            >
              <Tasks />
            </ProtectedRoute>
          }
        />

        {/* ================================================== */}
        {/* CLIENTS */}
        {/* Accessible by ADMIN and PROJECT MANAGER */}
        {/* ================================================== */}

        <Route
          path="/clients"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "PROJECT_MANAGER",
              ]}
            >
              <RoleLayout>
                <Clients />
              </RoleLayout>
            </ProtectedRoute>
          }
        />

        {/* ================================================== */}
        {/* PROJECT DETAILS */}
        {/* Accessible by ADMIN, PM and DEVELOPER */}
        {/* ================================================== */}

        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute
              allowedRoles={[
                "ADMIN",
                "PROJECT_MANAGER",
                "DEVELOPER",
              ]}
            >
              <RoleLayout>
                <ProjectDetails />
              </RoleLayout>
            </ProtectedRoute>
          }
        />

        {/* ================================================== */}
        {/* DEFAULT */}
        {/* ================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* ================================================== */}
        {/* 404 */}
        {/* ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        <Route
  path="/settings"
  element={
    <ProtectedRoute
      allowedRoles={[
        "ADMIN",
        "PROJECT_MANAGER",
        "DEVELOPER",
      ]}
    >
      <RoleLayout>
        <Settings />
      </RoleLayout>
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;