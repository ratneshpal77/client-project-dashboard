import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE";

type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

interface DeveloperTask {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  isOverdue?: boolean;
  project?: {
    id: string;
    name: string;
  } | null;
}

interface DeveloperDashboardData {
  totalTasks?: number;
  completedTasks?: number;
  inProgressTasks?: number;
  inReviewTasks?: number;
  todoTasks?: number;
  overdueTasks?: number;
  tasks?: DeveloperTask[];
}

interface DeveloperDashboardResponse {
  success: boolean;
  data: DeveloperDashboardData;
}

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
};

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const DeveloperDashboard = () => {
  const [dashboard, setDashboard] =
    useState<DeveloperDashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setError("");

      const response =
        await api.get<DeveloperDashboardResponse>(
          "/dashboard/developer",
        );

      setDashboard(response.data.data);
    } catch (err) {
      console.error("Developer dashboard error:", err);

      setError(
        "Unable to load your dashboard. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const tasks = dashboard?.tasks ?? [];

  const totalTasks =
    dashboard?.totalTasks ?? tasks.length;

  const completedTasks =
    dashboard?.completedTasks ??
    tasks.filter((task) => task.status === "DONE").length;

  const inProgressTasks =
    dashboard?.inProgressTasks ??
    tasks.filter(
      (task) => task.status === "IN_PROGRESS",
    ).length;

  const inReviewTasks =
    dashboard?.inReviewTasks ??
    tasks.filter(
      (task) => task.status === "IN_REVIEW",
    ).length;

  const todoTasks =
    dashboard?.todoTasks ??
    tasks.filter(
      (task) => task.status === "TODO",
    ).length;

  const overdueTasks =
    dashboard?.overdueTasks ??
    tasks.filter((task) => task.isOverdue).length;

  const completionPercentage =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) * 100,
        )
      : 0;

  const displayedTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;

        return (
          new Date(
            a.dueDate ?? "9999-12-31",
          ).getTime() -
          new Date(
            b.dueDate ?? "9999-12-31",
          ).getTime()
        );
      })
      .slice(0, 8);
  }, [tasks]);

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-200" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
              />
            ))}
          </div>

          <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              !
            </div>

            <h2 className="mt-4 text-lg font-semibold text-red-800">
              Dashboard unavailable
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchDashboard();
              }}
              className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              My workspace
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Developer Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Track your assigned tasks, deadlines, and progress
              from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              fetchDashboard();
            }}
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="My Tasks"
            value={totalTasks}
            description="Assigned to you"
            icon="T"
          />

          <StatCard
            label="In Progress"
            value={inProgressTasks}
            description="Currently working on"
            icon="→"
          />

          <StatCard
            label="In Review"
            value={inReviewTasks}
            description="Waiting for review"
            icon="◉"
          />

          <StatCard
            label="Overdue"
            value={overdueTasks}
            description="Need attention"
            icon="!"
            alert
          />
        </div>

        {/* Main content */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* My progress */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              My Progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your task completion overview.
            </p>

            <div className="mt-7 flex items-center justify-center">
              <div
                className="relative flex h-44 w-44 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(
                    rgb(99 102 241) ${completionPercentage}%,
                    rgb(226 232 240) ${completionPercentage}% 100%
                  )`,
                }}
              >
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-3xl font-bold text-slate-900">
                    {completionPercentage}%
                  </span>

                  <span className="mt-1 text-xs text-slate-400">
                    completed
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-3">
              <ProgressRow
                label="To Do"
                value={todoTasks}
                total={totalTasks}
                dotClass="bg-slate-400"
              />

              <ProgressRow
                label="In Progress"
                value={inProgressTasks}
                total={totalTasks}
                dotClass="bg-blue-500"
              />

              <ProgressRow
                label="In Review"
                value={inReviewTasks}
                total={totalTasks}
                dotClass="bg-amber-500"
              />

              <ProgressRow
                label="Completed"
                value={completedTasks}
                total={totalTasks}
                dotClass="bg-emerald-500"
              />
            </div>
          </section>

          {/* Task list */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6 xl:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  My Tasks
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest assigned work.
                </p>
              </div>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                {totalTasks} total
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {displayedTasks.length > 0 ? (
                displayedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                  />
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    ✓
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No tasks assigned
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    New assignments will appear here.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Bottom cards */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-sm">
            <p className="text-sm font-medium text-indigo-200">
              Completion
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              {completedTasks} of {totalTasks} tasks completed
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Keep your tasks moving through development and
              review to maintain project delivery momentum.
            </p>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white transition-all duration-700"
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-red-600">
              Attention
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              {overdueTasks} overdue{" "}
              {overdueTasks === 1 ? "task" : "tasks"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Prioritize overdue work and update task status as
              soon as progress changes.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-sm font-bold text-red-600">
                !
              </span>

              <span className="text-sm font-medium text-slate-700">
                {overdueTasks > 0
                  ? "Review these tasks first"
                  : "All tasks are on schedule"}
              </span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  description: string;
  icon: string;
  alert?: boolean;
}

const StatCard = ({
  label,
  value,
  description,
  icon,
  alert = false,
}: StatCardProps) => {
  return (
    <div className="group rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p
            className={`mt-2 text-3xl font-bold tracking-tight ${
              alert && value > 0
                ? "text-red-600"
                : "text-slate-900"
            }`}
          >
            {value}
          </p>
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
            alert
              ? "bg-red-50 text-red-600"
              : "bg-indigo-50 text-indigo-600"
          }`}
        >
          {icon}
        </span>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
};

interface ProgressRowProps {
  label: string;
  value: number;
  total: number;
  dotClass: string;
}

const ProgressRow = ({
  label,
  value,
  total,
  dotClass,
}: ProgressRowProps) => {
  const percentage =
    total > 0
      ? Math.round((value / total) * 100)
      : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${dotClass}`}
          />

          <span className="text-sm font-medium text-slate-700">
            {label}
          </span>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          {value}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${dotClass}`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
};

interface TaskRowProps {
  task: DeveloperTask;
}

const TaskRow = ({ task }: TaskRowProps) => {
  return (
    <div
      className={`rounded-xl border p-4 transition ${
        task.isOverdue
          ? "border-red-200 bg-red-50/40"
          : "border-slate-100 bg-slate-50/70 hover:border-indigo-100 hover:bg-indigo-50/30"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-800">
              {task.title}
            </h3>

            <StatusBadge status={task.status} />
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {task.project?.name ?? "Project unavailable"}
          </p>
        </div>

        <PriorityBadge priority={task.priority} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
        <span>
          Due:{" "}
          <span className="font-medium text-slate-700">
            {formatDate(task.dueDate)}
          </span>
        </span>

        {task.isOverdue && (
          <span className="font-semibold text-red-600">
            Overdue
          </span>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({
  status,
}: {
  status: TaskStatus;
}) => {
  const classes: Record<TaskStatus, string> = {
    TODO: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-blue-50 text-blue-600",
    IN_REVIEW: "bg-amber-50 text-amber-600",
    DONE: "bg-emerald-50 text-emerald-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
};

const PriorityBadge = ({
  priority,
}: {
  priority: TaskPriority;
}) => {
  const classes: Record<TaskPriority, string> = {
    LOW: "bg-slate-100 text-slate-500",
    MEDIUM: "bg-indigo-50 text-indigo-600",
    HIGH: "bg-orange-50 text-orange-600",
    CRITICAL: "bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[priority]}`}
    >
      {priorityLabels[priority]}
    </span>
  );
};

const formatDate = (date: string | null | undefined) => {
  if (!date) {
    return "No deadline";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "No deadline";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default DeveloperDashboard;