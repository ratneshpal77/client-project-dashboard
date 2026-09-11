import {
  useEffect,
  useState,
} from "react";

import {
  getProjectActivitiesApi,
} from "../../api/activity.api";

import {
  getSocket,
} from "../../services/socket";

import type {
  Activity,
} from "../../types/activity";

import ActivityItem from "./ActivityItem";

interface ActivityFeedProps {
  projectId: string;
}

const ActivityFeed = ({
  projectId,
}: ActivityFeedProps) => {
  const [activities, setActivities] =
    useState<Activity[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================================
  // LOAD HISTORICAL ACTIVITIES
  // ==========================================================

  useEffect(() => {
    let isMounted = true;

    const loadActivities =
      async () => {
        try {
          setIsLoading(true);
          setError("");

          const response =
            await getProjectActivitiesApi(
              projectId,
            );

          if (!isMounted) {
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

          if (isMounted) {
            setError(
              "Unable to load activity feed.",
            );
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

    void loadActivities();

    return () => {
      isMounted = false;
    };
  }, [projectId]);

  // ==========================================================
  // JOIN PROJECT ROOM + LISTEN FOR LIVE ACTIVITIES
  // ==========================================================

  useEffect(() => {
    const socket = getSocket();

    if (!socket) {
      return;
    }

    const handleActivityCreated = (
      activity: Activity,
    ) => {
      if (
        activity.projectId !==
        projectId
      ) {
        return;
      }

      setActivities(
        (currentActivities) => {
          const alreadyExists =
            currentActivities.some(
              (item) =>
                item.id ===
                activity.id,
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

    const joinProject = () => {
      socket.emit(
        "join-project",
        projectId,
        (
          response: {
            success: boolean;
            message: string;
          },
        ) => {
          if (!response.success) {
            console.error(
              "Failed to join project:",
              response.message,
            );
          }
        },
      );
    };

    socket.on(
      "connect",
      joinProject,
    );

    socket.on(
      "activity-created",
      handleActivityCreated,
    );

    // Socket may already be connected
    if (socket.connected) {
      joinProject();
    }

    return () => {
      socket.off(
        "connect",
        joinProject,
      );

      socket.off(
        "activity-created",
        handleActivityCreated,
      );
    };
  }, [projectId]);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse space-y-5">
          <div className="h-5 w-40 rounded bg-slate-200" />
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
        {error}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Live activity
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Project activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recent changes happening in this project.
          </p>
        </div>

        <div className="flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live
        </div>
      </div>

      {/* Empty */}
      {activities.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm font-medium text-slate-600">
            No activity yet
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Task changes will appear here in real time.
          </p>
        </div>
      )}

      {/* Activity list */}
      {activities.length > 0 && (
        <div className="mt-7">
          {activities.map(
            (activity) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
};

export default ActivityFeed;