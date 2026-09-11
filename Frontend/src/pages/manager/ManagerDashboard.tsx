import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

interface ProjectSummary {
  id: string;
  name: string;
  _count: {
    tasks: number;
  };
}

interface PriorityGroup {
  priority: TaskPriority;
  _count: {
    _all: number;
  };
}

interface UpcomingTask {
  id: string;
  title: string;
  description?: string | null;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: TaskPriority;
  dueDate: string | null;
  project: {
    id: string;
    name: string;
  };
}

interface ManagerDashboardData {
  projects: ProjectSummary[];
  tasksByPriority: PriorityGroup[];
  upcomingTasks: UpcomingTask[];
}

interface ManagerDashboardResponse {
  success: boolean;
  data: ManagerDashboardData;
}

const priorityLabels: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const priorityOrder: TaskPriority[] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

const ManagerDashboard = () => {
  const [dashboard, setDashboard] =
    useState<ManagerDashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setError("");

      const response =
        await api.get<ManagerDashboardResponse>(
          "/dashboard/project-manager",
        );

      setDashboard(response.data.data);
    } catch (err) {
      console.error("Manager dashboard error:", err);

      setError(
        "Unable to load dashboard data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const projects = dashboard?.projects ?? [];
  const tasksByPriority =
    dashboard?.tasksByPriority ?? [];
  const upcomingTasks =
    dashboard?.upcomingTasks ?? [];

  const totalProjects = projects.length;

  const totalTasks = useMemo(() => {
    return tasksByPriority.reduce(
      (total, item) =>
        total + item._count._all,
      0,
    );
  }, [tasksByPriority]);

  const upcomingTaskCount =
    upcomingTasks.length;

  const projectTaskCount = useMemo(() => {
    return projects.reduce(
      (total, project) =>
        total + project._count.tasks,
      0,
    );
  }, [projects]);

  const priorityCounts = useMemo(() => {
    const counts: Record<TaskPriority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    for (const item of tasksByPriority) {
      counts[item.priority] =
        item._count._all;
    }

    return counts;
  }, [tasksByPriority]);

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-10 w-56 animate-pulse rounded-lg bg-slate-200" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 xl:col-span-2" />

            <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
          </div>
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
              Project Manager
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Track your projects, task workload, priorities, and
              upcoming deadlines from one place.
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
            label="Total Projects"
            value={totalProjects}
            description="Projects under management"
            icon="P"
          />

          <StatCard
            label="Total Tasks"
            value={totalTasks}
            description="Across your projects"
            icon="T"
          />

          <StatCard
            label="Upcoming Tasks"
            value={upcomingTaskCount}
            description="Due this week"
            icon="→"
          />

          <StatCard
            label="Critical Tasks"
            value={priorityCounts.CRITICAL}
            description="Highest priority work"
            icon="!"
            alert={priorityCounts.CRITICAL > 0}
          />
        </div>

        {/* Main */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Priority Overview */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6 xl:col-span-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Task Priority Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Distribution of tasks across your managed projects.
              </p>
            </div>

            <div className="mt-7 space-y-5">
              {priorityOrder.map((priority) => {
                const count =
                  priorityCounts[priority];

                const percentage =
                  totalTasks > 0
                    ? Math.round(
                        (count / totalTasks) * 100,
                      )
                    : 0;

                return (
                  <div key={priority}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${getPriorityDotClass(
                            priority,
                          )}`}
                        />

                        <span className="text-sm font-medium text-slate-700">
                          {priorityLabels[priority]}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold text-slate-900">
                          {count}
                        </span>

                        <span className="text-slate-400">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getPriorityBarClass(
                          priority,
                        )}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {priorityOrder.map((priority) => (
                <div
                  key={priority}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-xs text-slate-500">
                    {priorityLabels[priority]}
                  </p>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {priorityCounts[priority]}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Project Summary */}
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Project Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Task workload by project.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {projects.length > 0 ? (
                projects.map((project) => {
                  const projectTasks =
                    project._count.tasks;

                  const percentage =
                    totalTasks > 0
                      ? Math.round(
                          (projectTasks /
                            totalTasks) *
                            100,
                        )
                      : 0;

                  return (
                    <div
                      key={project.id}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="min-w-0 truncate text-sm font-semibold text-slate-800">
                          {project.name}
                        </h3>

                        <span className="shrink-0 text-xs font-semibold text-indigo-600">
                          {projectTasks}{" "}
                          {projectTasks === 1
                            ? "task"
                            : "tasks"}
                        </span>
                      </div>

                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        {percentage}% of total workload
                      </p>
                    </div>
                  );
                })
              ) : (
                <EmptyState message="No projects found." />
              )}
            </div>
          </section>
        </div>

        {/* Upcoming tasks */}
        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Upcoming Tasks
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tasks due this week that are not completed.
              </p>
            </div>

            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
              {upcomingTaskCount} upcoming
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            {upcomingTasks.length > 0 ? (
              <div className="min-w-[700px]">
                <div className="grid grid-cols-[1.6fr_1fr_110px_110px_130px] gap-4 border-b border-slate-100 px-4 pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <span>Task</span>
                  <span>Project</span>
                  <span>Priority</span>
                  <span>Status</span>
                  <span>Due date</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="grid grid-cols-[1.6fr_1fr_110px_110px_130px] items-center gap-4 px-4 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {task.title}
                        </p>

                        {task.description && (
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <p className="truncate text-sm text-slate-600">
                        {task.project.name}
                      </p>

                      <PriorityBadge
                        priority={task.priority}
                      />

                      <StatusBadge
                        status={task.status}
                      />

                      <p className="text-sm font-medium text-slate-600">
                        {formatDate(task.dueDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState message="No upcoming tasks this week." />
            )}
          </div>
        </section>

        {/* Bottom insight */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-sm">
            <p className="text-sm font-medium text-indigo-200">
              Workload overview
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              {projectTaskCount} tasks across{" "}
              {totalProjects}{" "}
              {totalProjects === 1
                ? "project"
                : "projects"}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              Use the priority breakdown and upcoming tasks to
              focus the team on the most important work.
            </p>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-indigo-600">
              Weekly planning
            </p>

            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              {upcomingTaskCount} tasks due this week
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Review upcoming deadlines and coordinate with
              developers before delivery dates arrive.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                →
              </span>

              <span className="text-sm font-medium text-slate-700">
                Plan the week's priorities
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
      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[priority]}`}
    >
      {priorityLabels[priority]}
    </span>
  );
};

const StatusBadge = ({
  status,
}: {
  status: UpcomingTask["status"];
}) => {
  const labels: Record<
    UpcomingTask["status"],
    string
  > = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    DONE: "Done",
  };

  const classes: Record<
    UpcomingTask["status"],
    string
  > = {
    TODO: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-blue-50 text-blue-600",
    IN_REVIEW: "bg-amber-50 text-amber-600",
    DONE: "bg-emerald-50 text-emerald-600",
  };

  return (
    <span
      className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[status]}`}
    >
      {labels[status]}
    </span>
  );
};

const EmptyState = ({
  message,
}: {
  message: string;
}) => {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        ✓
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {message}
      </p>
    </div>
  );
};

const formatDate = (
  date: string | null,
) => {
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

const getPriorityDotClass = (
  priority: TaskPriority,
) => {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-500";
    case "HIGH":
      return "bg-orange-500";
    case "MEDIUM":
      return "bg-indigo-500";
    case "LOW":
      return "bg-slate-400";
    default:
      return "bg-slate-400";
  }
};

const getPriorityBarClass = (
  priority: TaskPriority,
) => {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-500";
    case "HIGH":
      return "bg-orange-500";
    case "MEDIUM":
      return "bg-indigo-500";
    case "LOW":
      return "bg-slate-400";
    default:
      return "bg-slate-400";
  }
};

export default ManagerDashboard;