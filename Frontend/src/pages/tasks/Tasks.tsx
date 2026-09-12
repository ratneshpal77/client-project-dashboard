import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import RoleLayout from "../../components/layout/RoleLayout";

// type UserRole =
//   | "ADMIN"
//   | "PROJECT_MANAGER"
//   | "DEVELOPER";

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

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  isOverdue?: boolean;
  assignedDeveloper?: {
    id: string;
    name: string;
    email: string;
    role: "DEVELOPER";
  } | null;
  project?: {
    id: string;
    name: string;
  } | null;
}

interface ProjectsResponse {
  success: boolean;
  data: {
    projects: Project[];
  };
}

interface TasksResponse {
  success: boolean;
  data: {
    tasks: Task[];
  };
}

const statusOptions: Array<{
  value: TaskStatus | "ALL";
  label: string;
}> = [
  { value: "ALL", label: "All Status" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
];

const priorityOptions: Array<{
  value: TaskPriority | "ALL";
  label: string;
}> = [
  { value: "ALL", label: "All Priority" },
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<TaskStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] =
    useState<TaskPriority | "ALL">("ALL");
  const [projectFilter, setProjectFilter] =
    useState("ALL");

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const projectsResponse =
        await api.get<ProjectsResponse>("/projects");

      const projects =
        projectsResponse.data.data.projects ?? [];

      if (projects.length === 0) {
        setTasks([]);
        return;
      }

      const taskResponses = await Promise.all(
        projects.map(async (project) => {
          const response =
            await api.get<TasksResponse>(
              `/projects/${project.id}/tasks`,
            );

          return response.data.data.tasks.map((task) => ({
            ...task,
            project: task.project ?? {
              id: project.id,
              name: project.name,
            },
          }));
        }),
      );

      const mergedTasks = taskResponses
        .flat()
        .filter(
          (task, index, array) =>
            array.findIndex(
              (item) => item.id === task.id,
            ) === index,
        );

      setTasks(mergedTasks);
    } catch (err) {
      console.error("Tasks page error:", err);

      setError(
        "Unable to load tasks. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const projects = useMemo(() => {
    const map = new Map<string, string>();

    tasks.forEach((task) => {
      if (task.project) {
        map.set(
          task.project.id,
          task.project.name,
        );
      }
    });

    return Array.from(map.entries()).map(
      ([id, name]) => ({
        id,
        name,
      }),
    );
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        task.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        task.description
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        task.project?.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        task.assignedDeveloper?.name
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" ||
        task.priority === priorityFilter;

      const matchesProject =
        projectFilter === "ALL" ||
        task.project?.id === projectFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesProject
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    priorityFilter,
    projectFilter,
  ]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter(
        (task) => task.status === "TODO",
      ).length,
      inProgress: tasks.filter(
        (task) => task.status === "IN_PROGRESS",
      ).length,
      review: tasks.filter(
        (task) => task.status === "IN_REVIEW",
      ).length,
      done: tasks.filter(
        (task) => task.status === "DONE",
      ).length,
      overdue: tasks.filter(
        (task) => task.isOverdue,
      ).length,
    };
  }, [tasks]);

  return (
    <RoleLayout>
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">
                Work management
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Tasks
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
                View and filter the tasks available to you.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchTasks}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <MiniStat
              label="Total"
              value={stats.total}
            />

            <MiniStat
              label="To Do"
              value={stats.todo}
            />

            <MiniStat
              label="In Progress"
              value={stats.inProgress}
            />

            <MiniStat
              label="Review"
              value={stats.review}
            />

            <MiniStat
              label="Done"
              value={stats.done}
            />

            <MiniStat
              label="Overdue"
              value={stats.overdue}
              danger
            />
          </div>

          {/* Filters */}
          <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-1">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Search
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search tasks..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target
                        .value as TaskStatus | "ALL",
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  {statusOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Priority
                </label>

                <select
                  value={priorityFilter}
                  onChange={(event) =>
                    setPriorityFilter(
                      event.target
                        .value as TaskPriority | "ALL",
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  {priorityOptions.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Project
                </label>

                <select
                  value={projectFilter}
                  onChange={(event) =>
                    setProjectFilter(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="ALL">
                    All Projects
                  </option>

                  {projects.map(
                    (project) => (
                      <option
                        key={project.id}
                        value={project.id}
                      >
                        {project.name}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="mt-6 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Task List
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Showing {filteredTasks.length} of{" "}
                  {tasks.length} tasks
                </p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3 p-5 sm:p-6">
                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-24 animate-pulse rounded-xl bg-slate-100"
                    />
                  ),
                )}
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
                  <p className="text-sm font-semibold text-red-800">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={fetchTasks}
                    className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="px-5 py-16 text-center sm:px-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  ✓
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-700">
                  No tasks found
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTasks.map(
                  (task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                    />
                  ),
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </RoleLayout>
  );
};

const MiniStat = ({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) => {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${
          danger && value > 0
            ? "text-red-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
};

const TaskCard = ({
  task,
}: {
  task: Task;
}) => {
  return (
    <div
      className={`p-5 transition sm:px-6 ${
        task.isOverdue
          ? "bg-red-50/30"
          : "hover:bg-slate-50/70"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Task info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              {task.title}
            </h3>

            <StatusBadge status={task.status} />

            <PriorityBadge
              priority={task.priority}
            />
          </div>

          {task.description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span>
              Project:{" "}
              <span className="font-medium text-slate-700">
                {task.project?.name ??
                  "Unknown project"}
              </span>
            </span>

            <span>
              Assigned:{" "}
              <span className="font-medium text-slate-700">
                {task.assignedDeveloper?.name ??
                  "Unassigned"}
              </span>
            </span>

            <span>
              Due:{" "}
              <span className="font-medium text-slate-700">
                {formatDate(task.dueDate)}
              </span>
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex shrink-0 items-center gap-3">
          {task.isOverdue && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
              Overdue
            </span>
          )}
        </div>
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
    IN_PROGRESS:
      "bg-blue-50 text-blue-600",
    IN_REVIEW:
      "bg-amber-50 text-amber-600",
    DONE:
      "bg-emerald-50 text-emerald-600",
  };

  const labels: Record<TaskStatus, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    DONE: "Done",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[status]}`}
    >
      {labels[status]}
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
    MEDIUM:
      "bg-indigo-50 text-indigo-600",
    HIGH:
      "bg-orange-50 text-orange-600",
    CRITICAL:
      "bg-red-50 text-red-600",
  };

  const labels: Record<TaskPriority, string> = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${classes[priority]}`}
    >
      {labels[priority]}
    </span>
  );
};

const formatDate = (
  date: string | null | undefined,
) => {
  if (!date) {
    return "No deadline";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "No deadline";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
};

export default Tasks;