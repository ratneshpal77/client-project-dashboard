import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getRecentActivitiesApi,
} from "../../api/activity.api";

import {
  getSocket,
} from "../../services/socket";

import type {
  Activity,
  ActivityAction,
} from "../../types/activity";

// ============================================================
// HELPERS
// ============================================================

const formatActivityAction = (
  action: ActivityAction,
): string => {
  switch (action) {
    case "TASK_CREATED":
      return "Task created";

    case "TASK_ASSIGNED":
      return "Task assigned";

    case "TASK_STATUS_CHANGED":
      return "Task status changed";

    default:
      return "Activity";
  }
};

const formatTime = (
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

const getStatusLabel = (
  value: string | null,
): string => {
  if (!value) {
    return "";
  }

  switch (value) {
    case "TODO":
      return "To do";

    case "IN_PROGRESS":
      return "In progress";

    case "IN_REVIEW":
      return "In review";

    case "DONE":
      return "Done";

    default:
      return value;
  }
};

const getActivityDescription = (
  activity: Activity,
): string => {
  if (activity.action === "TASK_CREATED") {
    return `${activity.user.name} created a task`;
  }

  if (activity.action === "TASK_ASSIGNED") {
    return `${activity.user.name} assigned a task`;
  }

  if (activity.action === "TASK_STATUS_CHANGED") {
    return `${activity.user.name} changed the task status`;
  }

  return "Activity updated";
};

// ============================================================
// COMPONENT
// ============================================================

const ActivityPage = () => {
  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [selectedFilter, setSelectedFilter] =
    useState<"ALL" | ActivityAction>(
      "ALL",
    );

  // ============================================================
  // LOAD RECENT ACTIVITIES
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadActivities =
      async () => {
        try {
          setIsLoading(true);
          setError("");

          const response =
            await getRecentActivitiesApi();

          if (!mounted) {
            return;
          }

          setActivities(
            response.data.activities,
          );
        } catch (error) {
          console.error(
            "Failed to load activities:",
            error,
          );

          if (mounted) {
            setError(
              "Unable to load activity feed.",
            );
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

    void loadActivities();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // REAL-TIME ACTIVITY
  // ============================================================

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      return;
    }

    const handleActivityCreated = (
      activity: Activity,
    ) => {
      setActivities(
        (currentActivities) => {
          const alreadyExists =
            currentActivities.some(
              (item) =>
                item.id === activity.id,
            );

          if (alreadyExists) {
            return currentActivities;
          }

          return [
            activity,
            ...currentActivities,
          ].slice(0, 20);
        },
      );
    };

    socket.on(
      "activity-created",
      handleActivityCreated,
    );

    return () => {
      socket.off(
        "activity-created",
        handleActivityCreated,
      );
    };
  }, []);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredActivities =
    useMemo(() => {
      if (selectedFilter === "ALL") {
        return activities;
      }

      return activities.filter(
        (activity) =>
          activity.action ===
          selectedFilter,
      );
    }, [
      activities,
      selectedFilter,
    ]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Workspace activity
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Activity
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            See the latest actions performed
            across projects and tasks.
          </p>
        </div>

        {/* LIVE STATUS */}
        <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />

          <span className="text-xs font-semibold text-emerald-700">
            Live activity
          </span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            setSelectedFilter("ALL")
          }
          className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            selectedFilter === "ALL"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          All activity
        </button>

        <button
          type="button"
          onClick={() =>
            setSelectedFilter(
              "TASK_CREATED",
            )
          }
          className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            selectedFilter ===
            "TASK_CREATED"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Task created
        </button>

        <button
          type="button"
          onClick={() =>
            setSelectedFilter(
              "TASK_ASSIGNED",
            )
          }
          className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            selectedFilter ===
            "TASK_ASSIGNED"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Task assigned
        </button>

        <button
          type="button"
          onClick={() =>
            setSelectedFilter(
              "TASK_STATUS_CHANGED",
            )
          }
          className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
            selectedFilter ===
            "TASK_STATUS_CHANGED"
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          Status changed
        </button>
      </div>

      {/* ACTIVITY CARD */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-6 p-6">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="animate-pulse"
                >
                  <div className="flex gap-4">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-slate-100" />

                    <div className="flex-1">
                      <div className="h-4 w-48 rounded bg-slate-100" />

                      <div className="mt-2 h-3 w-72 max-w-full rounded bg-slate-100" />

                      <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-sm font-bold text-red-500">
              !
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              Unable to load activity
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {error}
            </p>
          </div>
        ) : filteredActivities.length ===
          0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              ◷
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              No activity found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              New project and task actions
              will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map(
              (activity) => (
                <div
                  key={activity.id}
                  className="flex gap-4 px-4 py-5 transition hover:bg-slate-50 sm:px-6"
                >
                  {/* AVATAR */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                    {getInitials(
                      activity.user.name,
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {
                            activity.user
                              .name
                          }
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {getActivityDescription(
                            activity,
                          )}
                        </p>
                      </div>

                      <span className="shrink-0 text-[11px] font-medium text-slate-400">
                        {formatTime(
                          activity.createdAt,
                        )}
                      </span>
                    </div>

                    {/* DETAILS */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {activity.project && (
                        <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                          {
                            activity
                              .project
                              .name
                          }
                        </span>
                      )}

                      {activity.task && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {
                            activity.task
                              .title
                          }
                        </span>
                      )}

                      <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                        {formatActivityAction(
                          activity.action,
                        )}
                      </span>
                    </div>

                    {/* STATUS CHANGE */}
                    {activity.action ===
                      "TASK_STATUS_CHANGED" &&
                      activity.oldValue &&
                      activity.newValue && (
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                            {getStatusLabel(
                              activity.oldValue,
                            )}
                          </span>

                          <span className="text-slate-400">
                            →
                          </span>

                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                            {getStatusLabel(
                              activity.newValue,
                            )}
                          </span>
                        </div>
                      )}

                    {/* ASSIGNED */}
                    {activity.action ===
                      "TASK_ASSIGNED" &&
                      activity.newValue && (
                        <p className="mt-3 text-xs text-slate-500">
                          Assigned developer ID:
                          <span className="ml-1 font-medium text-slate-700">
                            {
                              activity.newValue
                            }
                          </span>
                        </p>
                      )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;