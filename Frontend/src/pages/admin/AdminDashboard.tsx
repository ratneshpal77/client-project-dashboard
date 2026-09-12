import { useEffect, useState } from "react";

import {
  getAdminDashboardApi,
} from "../../api/dashboard.api";

import type {
  AdminDashboardData,
} from "../../types/dashboard";

import { getSocket } from "../../services/socket";

const emptyDashboard: AdminDashboardData = {
  totalProjects: 0,
  totalTasks: 0,
  overdueTasks: 0,
  activeUsersOnline: 0,

  tasksByStatus: {
    TODO: 0,
    IN_PROGRESS: 0,
    IN_REVIEW: 0,
    DONE: 0,
  },
};

const AdminDashboard = () => {
  const [dashboard, setDashboard] =
    useState<AdminDashboardData>(
      emptyDashboard,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

 

  useEffect(() => {
    let isMounted = true;

    const loadDashboard =
      async () => {
        try {
          setIsLoading(true);
          setError("");

          const response =
            await getAdminDashboardApi();

          if (!isMounted) {
            return;
          }

          setDashboard(
            response.data,
          );
        } catch (error) {
          console.error(
            "Failed to load admin dashboard:",
            error,
          );

          if (isMounted) {
            setError(
              "Unable to load dashboard data.",
            );
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);



  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      return;
    }

    const handlePresenceCount = (data: {
      count: number;
    }) => {
      setDashboard((current) => ({
        ...current,
        activeUsersOnline: data.count,
      }));
    };

    socket.on(
      "presence-count",
      handlePresenceCount,
    );

    return () => {
      socket.off(
        "presence-count",
        handlePresenceCount,
      );
    };
  }, []);

  const statusItems = [
    {
      key: "TODO" as const,
      label: "To Do",
    },
    {
      key: "IN_PROGRESS" as const,
      label: "In Progress",
    },
    {
      key: "IN_REVIEW" as const,
      label: "In Review",
    },
    {
      key: "DONE" as const,
      label: "Done",
    },
  ];

  return (
    <div className="space-y-6">
     

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Overview
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor projects, tasks, activity and
            team presence from one place.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          System connected
        </div>
      </div>

    

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Projects */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Projects
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {isLoading
                  ? "—"
                  : dashboard.totalProjects}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg text-indigo-600">
              ◫
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            All agency projects
          </p>
        </div>

        {/* Tasks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Tasks
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {isLoading
                  ? "—"
                  : dashboard.totalTasks}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-lg text-violet-600">
              ✓
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Across all projects
          </p>
        </div>

        {/* Overdue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Overdue Tasks
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {isLoading
                  ? "—"
                  : dashboard.overdueTasks}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-lg text-red-500">
              !
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Require attention
          </p>
        </div>

        {/* Online */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Users
              </p>

              <div className="mt-3 flex items-center gap-2">
                <p className="text-3xl font-bold text-slate-900">
                  {isLoading
                    ? "—"
                    : dashboard.activeUsersOnline}
                </p>

                {!isLoading && (
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                )}
              </div>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-600">
              ●
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Live online count
          </p>
        </div>
      </div>

   

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Task overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current distribution of tasks by status.
            </p>
          </div>

          <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Live dashboard
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statusItems.map((item) => (
            <div
              key={item.key}
              className="rounded-xl border border-slate-100 bg-slate-50 p-4"
            >
              <p className="text-xs font-medium text-slate-500">
                {item.label}
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {isLoading
                  ? "—"
                  : dashboard.tasksByStatus[
                      item.key
                    ]}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
          {!isLoading &&
            dashboard.totalTasks > 0 && (
              <div className="flex h-full w-full">
                <div
                  className="bg-slate-400"
                  style={{
                    width: `${
                      (dashboard
                        .tasksByStatus
                        .TODO /
                        dashboard.totalTasks) *
                      100
                    }%`,
                  }}
                />

                <div
                  className="bg-indigo-500"
                  style={{
                    width: `${
                      (dashboard
                        .tasksByStatus
                        .IN_PROGRESS /
                        dashboard.totalTasks) *
                      100
                    }%`,
                  }}
                />

                <div
                  className="bg-violet-500"
                  style={{
                    width: `${
                      (dashboard
                        .tasksByStatus
                        .IN_REVIEW /
                        dashboard.totalTasks) *
                      100
                    }%`,
                  }}
                />

                <div
                  className="bg-emerald-500"
                  style={{
                    width: `${
                      (dashboard
                        .tasksByStatus
                        .DONE /
                        dashboard.totalTasks) *
                      100
                    }%`,
                  }}
                />
              </div>
            )}
        </div>

        {/* Status legend */}
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-slate-400" />
            To Do
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            In Progress
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            In Review
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Done
          </div>
        </div>
      </div>

     

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-slate-900 p-6 text-white shadow-lg shadow-indigo-500/10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-indigo-100">
              Team presence
            </p>

            <span className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-indigo-100">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Live
            </span>
          </div>

          <h2 className="mt-3 text-2xl font-bold">
            {isLoading
              ? "—"
              : dashboard.activeUsersOnline}{" "}
            users online
          </h2>

          <p className="mt-2 max-w-md text-sm leading-6 text-indigo-100/70">
            Current active users connected to the
            project workspace through the real-time
            channel.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Attention needed
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {isLoading
              ? "—"
              : dashboard.overdueTasks}{" "}
            overdue
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Review overdue work and update task
            progress to keep projects on track.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;