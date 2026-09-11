import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  getNotificationsApi,
  getUnreadNotificationCountApi,
  markAllNotificationsAsReadApi,
  markNotificationAsReadApi,
  type Notification,
} from "../../api/notification.api";

import {
  disconnectSocket,
  getSocket,
} from "../../services/socket";

import {
  logoutApi,
} from "../../api/auth.api";

import type {
  RootState,
} from "../../store/auth.store";

import {
  clearAuth,
} from "../../store/auth.store";

interface AppLayoutProps {
  children: ReactNode;
  role:
    | "ADMIN"
    | "PROJECT_MANAGER"
    | "DEVELOPER";
}

const roleLabel: Record<
  AppLayoutProps["role"],
  string
> = {
  ADMIN: "Administrator",
  PROJECT_MANAGER: "Project Manager",
  DEVELOPER: "Developer",
};

const getInitials = (
  name: string,
): string => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "U";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};

const formatNotificationTime = (
  createdAt: string,
): string => {
  const createdTime =
    new Date(createdAt).getTime();

  const diff =
    Date.now() - createdTime;

  const minute =
    60 * 1000;

  const hour =
    60 * minute;

  const day =
    24 * hour;

  if (diff < minute) {
    return "Just now";
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)}m ago`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)}h ago`;
  }

  if (diff < 7 * day) {
    return `${Math.floor(diff / day)}d ago`;
  }

  return new Date(
    createdAt,
  ).toLocaleDateString();
};

const notificationIcon = (
  type: Notification["type"],
) => {
  if (type === "TASK_ASSIGNED") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
          />

          <circle
            cx="9"
            cy="7"
            r="4"
          />

          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 8v6M22 11h-6"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 11l3 3L22 4"
        />

        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h9"
        />
      </svg>
    </div>
  );
};

const AppLayout = ({
  children,
  role,
}: AppLayoutProps) => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const user = useSelector(
    (state: RootState) =>
      state.auth.user,
  );

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [isNotificationOpen, setIsNotificationOpen] =
    useState(false);

  const [isNotificationLoading, setIsNotificationLoading] =
    useState(false);

  const [notificationError, setNotificationError] =
    useState("");

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  // ==========================================================
  // LOAD NOTIFICATIONS
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadNotifications =
      async () => {
        try {
          setIsNotificationLoading(true);
          setNotificationError("");

          const [
            notificationsResponse,
            unreadResponse,
          ] = await Promise.all([
            getNotificationsApi(),
            getUnreadNotificationCountApi(),
          ]);

          if (!mounted) {
            return;
          }

          setNotifications(
            notificationsResponse.data.notifications,
          );

          setUnreadCount(
            unreadResponse.data.count,
          );
        } catch (error) {
          console.error(
            "Failed to load notifications:",
            error,
          );

          if (mounted) {
            setNotificationError(
              "Unable to load notifications.",
            );
          }
        } finally {
          if (mounted) {
            setIsNotificationLoading(false);
          }
        }
      };

    void loadNotifications();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // REAL-TIME NOTIFICATIONS
  // ==========================================================

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      return;
    }

    const handleNotificationCreated = (
      notification: Notification,
    ) => {
      setNotifications(
        (currentNotifications) => {
          const exists =
            currentNotifications.some(
              (item) =>
                item.id === notification.id,
            );

          if (exists) {
            return currentNotifications;
          }

          return [
            notification,
            ...currentNotifications,
          ].slice(0, 50);
        },
      );

      setUnreadCount(
        (currentCount) =>
          notification.isRead
            ? currentCount
            : currentCount + 1,
      );
    };

    const handleUnreadCountUpdated = (
      payload: {
        count?: number;
      },
    ) => {
      if (
        typeof payload?.count ===
        "number"
      ) {
        setUnreadCount(
          payload.count,
        );
      }
    };

    socket.on(
      "notification-created",
      handleNotificationCreated,
    );

    socket.on(
      "unread-count-updated",
      handleUnreadCountUpdated,
    );

    return () => {
      socket.off(
        "notification-created",
        handleNotificationCreated,
      );

      socket.off(
        "unread-count-updated",
        handleUnreadCountUpdated,
      );
    };
  }, []);

  // ==========================================================
  // MARK ONE AS READ
  // ==========================================================

  const handleNotificationClick = async (
    notification: Notification,
  ) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsReadApi(
          notification.id,
        );

        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (item) =>
                item.id === notification.id
                  ? {
                      ...item,
                      isRead: true,
                      readAt:
                        new Date().toISOString(),
                    }
                  : item,
            ),
        );

        setUnreadCount(
          (currentCount) =>
            Math.max(
              0,
              currentCount - 1,
            ),
        );
      }

      setIsNotificationOpen(false);

      if (notification.taskId) {
        navigate(
          `/projects/${
            notification.task?.id
              ? notification.task.id
              : ""
          }`,
        );
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error,
      );
    }
  };

  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const handleMarkAllAsRead =
    async () => {
      try {
        await markAllNotificationsAsReadApi();

        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (notification) => ({
                ...notification,
                isRead: true,
                readAt:
                  notification.readAt ??
                  new Date().toISOString(),
              }),
            ),
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(
          "Failed to mark all notifications as read:",
          error,
        );
      }
    };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error(
        "Logout request failed:",
        error,
      );
    } finally {
      disconnectSocket();

      dispatch(clearAuth());

      setIsMobileMenuOpen(false);
      setIsNotificationOpen(false);

      navigate("/login", {
        replace: true,
      });
    }
  };

  const initials = getInitials(
    user?.name || "User",
  );

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const dashboardPath =
    role === "ADMIN"
      ? "/admin/dashboard"
      : role === "PROJECT_MANAGER"
        ? "/manager/dashboard"
        : "/developer/dashboard";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex min-h-screen">
        {/* ================================================== */}
        {/* DESKTOP SIDEBAR */}
        {/* ================================================== */}

        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-slate-800 px-6">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Project
                <span className="text-indigo-400">
                  Hub
                </span>
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Client project dashboard
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Workspace
            </p>

            <div className="space-y-1">
              <NavLink
                to={dashboardPath}
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-300"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <span>▦</span>
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    isActive
                      ? "bg-indigo-500/10 font-medium text-indigo-300"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <span>◫</span>
                <span>Projects</span>
              </NavLink>

              {/* CLIENTS */}
              {(role === "ADMIN" ||
                role === "PROJECT_MANAGER") && (
                <NavLink
                  to="/clients"
                  className={({ isActive }) =>
                    `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                      isActive
                        ? "bg-indigo-500/10 font-medium text-indigo-300"
                        : "text-slate-400 hover:bg-slate-900 hover:text-white"
                    }`
                  }
                >
                  <span>◉</span>
                  <span>Clients</span>
                </NavLink>
              )}

              {/* TASKS */}
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    isActive
                      ? "bg-indigo-500/10 font-medium text-indigo-300"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <span>✓</span>
                <span>Tasks</span>
              </NavLink>

              {/* ACTIVITY */}
              <NavLink
                to="/activity"
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    isActive
                      ? "bg-indigo-500/10 font-medium text-indigo-300"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <span>◷</span>
                <span>Activity</span>
              </NavLink>
            </div>

            <p className="mb-3 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Account
            </p>

            <div className="space-y-1">
              {/* SETTINGS */}
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    isActive
                      ? "bg-indigo-500/10 font-medium text-indigo-300"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`
                }
              >
                <span>⚙</span>
                <span>Settings</span>
              </NavLink>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={() =>
                  void handleLogout()
                }
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
              >
                <span>↪</span>
                <span>Logout</span>
              </button>
            </div>
          </nav>

          {/* User card */}
          <div className="border-t border-slate-800 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-900 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "User"}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {roleLabel[role]}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ================================================== */}
        {/* MAIN */}
        {/* ================================================== */}

        <div className="flex min-w-0 flex-1 flex-col bg-slate-100">
          {/* ================================================== */}
          {/* TOPBAR */}
          {/* ================================================== */}

          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {roleLabel[role]}
              </p>

              <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">
                Client Project Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* ================================================== */}
              {/* NOTIFICATION */}
              {/* ================================================== */}

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setIsNotificationOpen(
                      (open) => !open,
                    )
                  }
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                  aria-label="Notifications"
                  aria-expanded={
                    isNotificationOpen
                  }
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                    />

                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10 21h4"
                    />
                  </svg>

                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 99
                        ? "99+"
                        : unreadCount}
                    </span>
                  )}
                </button>

                {/* ================================================== */}
                {/* NOTIFICATION PANEL */}
                {/* ================================================== */}

                {isNotificationOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 sm:w-96">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Notifications
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {unreadCount} unread
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            void handleMarkAllAsRead()
                          }
                          className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[420px] overflow-y-auto">
                      {isNotificationLoading ? (
                        <div className="space-y-3 p-4">
                          {[1, 2, 3].map(
                            (item) => (
                              <div
                                key={item}
                                className="animate-pulse"
                              >
                                <div className="flex gap-3">
                                  <div className="h-9 w-9 rounded-xl bg-slate-100" />

                                  <div className="flex-1">
                                    <div className="h-3 w-32 rounded bg-slate-100" />

                                    <div className="mt-2 h-3 w-full rounded bg-slate-100" />

                                    <div className="mt-2 h-2 w-20 rounded bg-slate-100" />
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : notificationError ? (
                        <div className="p-6 text-center">
                          <p className="text-sm text-red-600">
                            {notificationError}
                          </p>
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              className="h-6 w-6"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M18 8a6 6 0 00-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10 21h4"
                              />
                            </svg>
                          </div>

                          <p className="mt-3 text-sm font-semibold text-slate-700">
                            You’re all caught up
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            No notifications to show.
                          </p>
                        </div>
                      ) : (
                        notifications.map(
                          (notification) => (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() =>
                                void handleNotificationClick(
                                  notification,
                                )
                              }
                              className={`flex w-full gap-3 border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                                !notification.isRead
                                  ? "bg-indigo-50/40"
                                  : "bg-white"
                              }`}
                            >
                              {notificationIcon(
                                notification.type,
                              )}

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-xs font-semibold text-slate-800">
                                    {notification.type ===
                                    "TASK_ASSIGNED"
                                      ? "Task assigned"
                                      : "Task moved to review"}
                                  </p>

                                  {!notification.isRead && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                                  )}
                                </div>

                                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">
                                  {notification.message}
                                </p>

                                {notification.task?.title && (
                                  <p className="mt-1 truncate text-xs font-medium text-indigo-600">
                                    {notification.task.title}
                                  </p>
                                )}

                                <p className="mt-1 text-[11px] text-slate-400">
                                  {formatNotificationTime(
                                    notification.createdAt,
                                  )}
                                </p>
                              </div>
                            </button>
                          ),
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ================================================== */}
              {/* USER */}
              {/* ================================================== */}

              <div className="hidden h-10 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                  {initials}
                </div>

                <div className="max-w-[150px] text-left">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {user?.name || "User"}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {roleLabel[role]}
                  </p>
                </div>
              </div>

              {/* ================================================== */}
              {/* MOBILE MENU */}
              {/* ================================================== */}

              <button
                type="button"
                onClick={() =>
                  setIsMobileMenuOpen(
                    (open) => !open,
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 lg:hidden"
                aria-label="Open menu"
                aria-expanded={
                  isMobileMenuOpen
                }
              >
                {isMobileMenuOpen
                  ? "×"
                  : "☰"}
              </button>
            </div>
          </header>

          {/* ================================================== */}
          {/* MOBILE NAV */}
          {/* ================================================== */}

          {isMobileMenuOpen && (
            <div className="border-b border-slate-200 bg-white px-4 py-4 lg:hidden sm:px-6">
              <nav className="space-y-1">
                <NavLink
                  to={dashboardPath}
                  onClick={() =>
                    setIsMobileMenuOpen(false)
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <span>▦</span>
                  <span>Dashboard</span>
                </NavLink>

                <NavLink
                  to="/projects"
                  onClick={() =>
                    setIsMobileMenuOpen(false)
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <span>◫</span>
                  <span>Projects</span>
                </NavLink>

                {/* MOBILE CLIENTS */}
                {(role === "ADMIN" ||
                  role === "PROJECT_MANAGER") && (
                  <NavLink
                    to="/clients"
                    onClick={() =>
                      setIsMobileMenuOpen(false)
                    }
                    className={({ isActive }) =>
                      `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-600 hover:bg-slate-50"
                      }`
                    }
                  >
                    <span>◉</span>
                    <span>Clients</span>
                  </NavLink>
                )}

                {/* MOBILE TASKS */}
                <NavLink
                  to="/tasks"
                  onClick={() =>
                    setIsMobileMenuOpen(false)
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                      isActive
                        ? "bg-indigo-50 font-medium text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <span>✓</span>
                  <span>Tasks</span>
                </NavLink>

                {/* MOBILE ACTIVITY */}
                <NavLink
                  to="/activity"
                  onClick={() =>
                    setIsMobileMenuOpen(false)
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                      isActive
                        ? "bg-indigo-50 font-medium text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <span>◷</span>
                  <span>Activity</span>
                </NavLink>

                {/* MOBILE SETTINGS */}
                <NavLink
                  to="/settings"
                  onClick={() =>
                    setIsMobileMenuOpen(false)
                  }
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                      isActive
                        ? "bg-indigo-50 font-medium text-indigo-600"
                        : "text-slate-600 hover:bg-slate-50"
                    }`
                  }
                >
                  <span>⚙</span>
                  <span>Settings</span>
                </NavLink>

                {/* MOBILE LOGOUT */}
                <button
                  type="button"
                  onClick={() =>
                    void handleLogout()
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                >
                  <span>↪</span>
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          )}

          {/* ================================================== */}
          {/* PAGE CONTENT */}
          {/* ================================================== */}

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;