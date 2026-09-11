import type {
  Activity,
} from "../../types/activity";

interface ActivityItemProps {
  activity: Activity;
}

const formatTimeAgo = (
  dateString: string,
): string => {
  const createdAt =
    new Date(dateString).getTime();

  const now = Date.now();

  const difference = Math.max(
    0,
    now - createdAt,
  );

  const minutes = Math.floor(
    difference / 60000,
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes === 1) {
    return "1 min ago";
  }

  if (minutes < 60) {
    return `${minutes} mins ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours === 1) {
    return "1 hour ago";
  }

  if (hours < 24) {
    return `${hours} hours ago`;
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days === 1) {
    return "1 day ago";
  }

  return `${days} days ago`;
};

const getActivityText = (
  activity: Activity,
): string => {
  const userName =
    activity.user.name;

  const taskTitle =
    activity.task?.title ??
    "Unknown task";

  if (
    activity.action ===
    "TASK_CREATED"
  ) {
    return `${userName} created task "${taskTitle}"`;
  }

  if (
    activity.action ===
    "TASK_ASSIGNED"
  ) {
    return `${userName} assigned "${taskTitle}"`;
  }

  if (
    activity.action ===
    "TASK_STATUS_CHANGED"
  ) {
    return `${userName} moved "${taskTitle}" from ${formatStatus(
      activity.oldValue,
    )} → ${formatStatus(
      activity.newValue,
    )}`;
  }

  return `${userName} updated "${taskTitle}"`;
};

const formatStatus = (
  status: string | null,
): string => {
  if (!status) {
    return "Unknown";
  }

  const labels: Record<
    string,
    string
  > = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    DONE: "Done",
  };

  return labels[status] ?? status;
};

const getActionIcon = (
  action: Activity["action"],
) => {
  if (
    action === "TASK_CREATED"
  ) {
    return "＋";
  }

  if (
    action === "TASK_ASSIGNED"
  ) {
    return "↗";
  }

  return "✓";
};

const ActivityItem = ({
  activity,
}: ActivityItemProps) => {
  return (
    <div className="group flex gap-4">
      {/* Timeline */}
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600 ring-4 ring-white">
          {getActionIcon(
            activity.action,
          )}
        </div>

        <div className="mt-2 h-full min-h-8 w-px bg-slate-200 group-last:hidden" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-6">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition group-hover:border-indigo-100 group-hover:bg-indigo-50/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <p className="text-sm leading-6 text-slate-700">
              {getActivityText(
                activity,
              )}
            </p>

            <span className="shrink-0 text-xs font-medium text-slate-400">
              {formatTimeAgo(
                activity.createdAt,
              )}
            </span>
          </div>

          {activity.project && (
            <p className="mt-2 text-xs text-slate-400">
              {activity.project.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityItem;