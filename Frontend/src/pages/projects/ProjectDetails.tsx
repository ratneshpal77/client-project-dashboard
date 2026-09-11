import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  getProjectApi,
} from "../../api/project.api";

import {
  getProjectTasksApi,
  type TaskFilters,
} from "../../api/task.api";

import type {
  Project,
  ProjectTask,
} from "../../types/project";

import type {
  RootState,
} from "../../store/auth.store";

import ActivityFeed from "../../components/activity/ActivityFeed";

import CreateTaskModal from "../../components/tasks/CreateTaskModal";

import UpdateTaskModal from "../../components/tasks/UpdateTaskModal";

import DeleteTaskConfirm from "../../components/tasks/DeleteTaskConfirm";

const ProjectDetails = () => {
  const { id } = useParams();

  const [project, setProject] =
    useState<Project | null>(null);

  const [tasks, setTasks] =
    useState<ProjectTask[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isTaskLoading, setIsTaskLoading] =
    useState(false);

  const [isCreateTaskOpen, setIsCreateTaskOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState<ProjectTask | null>(null);

  const [deletingTask, setDeletingTask] =
    useState<ProjectTask | null>(null);

  const [error, setError] =
    useState("");

  const [filters, setFilters] =
    useState<TaskFilters>({});

  const user = useSelector(
    (state: RootState) =>
      state.auth.user,
  );

  const role = user?.role;

  // ==========================================================
  // ROLE-BASED CONTENT
  // ==========================================================

  const roleContent = useMemo(() => {
    switch (role) {
      case "ADMIN":
        return {
          workspaceLabel: "Admin workspace",
          description:
            "Monitor the project, tasks and team activity.",
          taskDescription:
            "Review project work, priorities and progress.",
        };

      case "PROJECT_MANAGER":
        return {
          workspaceLabel: "Manager workspace",
          description:
            "Manage project work, monitor progress and review team activity.",
          taskDescription:
            "Manage your project tasks and monitor team progress.",
        };

      case "DEVELOPER":
        return {
          workspaceLabel: "Developer workspace",
          description:
            "View your assigned work and track task progress.",
          taskDescription:
            "Review tasks assigned to you and track their progress.",
        };

      default:
        return {
          workspaceLabel: "Workspace",
          description:
            "View project details, tasks and activity.",
          taskDescription:
            "Track project work and progress.",
        };
    }
  }, [role]);

  const canManageTasks =
    role === "ADMIN" ||
    role === "PROJECT_MANAGER";

  const canUpdateAssignedTasks =
    role === "ADMIN" ||
    role === "PROJECT_MANAGER" ||
    role === "DEVELOPER";

  // ==========================================================
  // LOAD PROJECT
  // ==========================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    let mounted = true;

    const loadProject =
      async () => {
        try {
          setIsLoading(true);
          setError("");

          const response =
            await getProjectApi(id);

          if (!mounted) {
            return;
          }

          setProject(
            response.data.project,
          );

          setTasks(
            response.data.project.tasks ?? [],
          );
        } catch (error) {
          console.error(
            "Failed to load project:",
            error,
          );

          if (mounted) {
            setError(
              "Unable to load project.",
            );
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

    void loadProject();

    return () => {
      mounted = false;
    };
  }, [id]);

  // ==========================================================
  // FILTER TASKS
  // ==========================================================

  const handleFilterChange = async (
    nextFilters: TaskFilters,
  ) => {
    if (!id) {
      return;
    }

    try {
      setIsTaskLoading(true);
      setFilters(nextFilters);

      const response =
        await getProjectTasksApi(
          id,
          nextFilters,
        );

      setTasks(
        response.data.tasks,
      );
    } catch (error) {
      console.error(
        "Failed to filter tasks:",
        error,
      );
    } finally {
      setIsTaskLoading(false);
    }
  };

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const handleResetFilters = () => {
    void handleFilterChange({});
  };

  // ==========================================================
  // TASK CREATED
  // ==========================================================

  const handleTaskCreated = (
    newTask: ProjectTask,
  ) => {
    setTasks((currentTasks) => {
      const alreadyExists =
        currentTasks.some(
          (task) => task.id === newTask.id,
        );

      if (alreadyExists) {
        return currentTasks;
      }

      return [
        newTask,
        ...currentTasks,
      ];
    });
  };

  // ==========================================================
  // TASK UPDATED
  // ==========================================================

  const handleTaskUpdated = (
    updatedTask: ProjectTask,
  ) => {
    setTasks((currentTasks) =>
      currentTasks.map(
        (task) =>
          task.id === updatedTask.id
            ? updatedTask
            : task,
      ),
    );
  };

  // ==========================================================
  // TASK DELETED
  // ==========================================================

  const handleTaskDeleted = (
    taskId: string,
  ) => {
    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) => task.id !== taskId,
      ),
    );
  };

  // ==========================================================
  // LABELS
  // ==========================================================

  const statusLabel: Record<
    ProjectTask["status"],
    string
  > = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    DONE: "Done",
  };

  const priorityLabel: Record<
    ProjectTask["priority"],
    string
  > = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical",
  };

  const priorityClasses: Record<
    ProjectTask["priority"],
    string
  > = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-indigo-50 text-indigo-600",
    HIGH: "bg-orange-50 text-orange-600",
    CRITICAL: "bg-red-50 text-red-600",
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />

        <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />

        <div className="h-36 animate-pulse rounded-3xl bg-white" />

        <div className="h-80 animate-pulse rounded-2xl bg-white" />
      </div>
    );
  }

  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error || !project) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-600">
          {error || "Project not found."}
        </p>

        <Link
          to="/projects"
          className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          ← Back to projects
        </Link>
      </div>
    );
  }

  // ==========================================================
  // PROJECT DETAILS
  // ==========================================================

  return (
    <>
      <div className="space-y-6">
        {/* ================================================== */}
        {/* BREADCRUMB */}
        {/* ================================================== */}

        <div className="flex items-center justify-between gap-3">
          <Link
            to="/projects"
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
          >
            ← Projects
          </Link>

          {role && (
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 shadow-sm">
              {role === "PROJECT_MANAGER"
                ? "Project Manager"
                : role}
            </span>
          )}
        </div>

        {/* ================================================== */}
        {/* PROJECT HEADER */}
        {/* ================================================== */}

        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-slate-900 p-6 text-white shadow-xl shadow-indigo-500/10 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-indigo-100">
                {roleContent.workspaceLabel}
              </p>

              <h1 className="mt-1 break-words text-2xl font-bold tracking-tight sm:text-3xl">
                {project.name}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100/80">
                {project.description ||
                  roleContent.description}
              </p>
            </div>

            <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur sm:w-auto">
              <p className="text-xs text-indigo-100/70">
                Client company
              </p>

              <p className="mt-1 truncate text-sm font-semibold text-white">
                {project.client.company}
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-indigo-100/60">
                Client
              </p>

              <p className="mt-1 truncate text-sm font-semibold">
                {project.client.name}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-indigo-100/60">
                Manager
              </p>

              <p className="mt-1 truncate text-sm font-semibold">
                {project.manager?.name ||
                  "Not assigned"}
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-xs text-indigo-100/60">
                Visible tasks
              </p>

              <p className="mt-1 text-sm font-semibold">
                {tasks.length}
              </p>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* ROLE INFO / CREATE */}
        {/* ================================================== */}

        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-indigo-900">
              {role === "DEVELOPER"
                ? "You are viewing work assigned to you."
                : canManageTasks
                  ? "You can manage project tasks from this workspace."
                  : "Project workspace access enabled."}
            </p>

            {canManageTasks ? (
              <button
                type="button"
                onClick={() =>
                  setIsCreateTaskOpen(true)
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 sm:w-auto"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 5v14M5 12h14"
                  />
                </svg>

                Create task
              </button>
            ) : (
              <span className="text-xs font-medium text-indigo-600">
                {canUpdateAssignedTasks
                  ? "Task progress enabled"
                  : "Read-only workspace"}
              </span>
            )}
          </div>
        </div>

        {/* ================================================== */}
        {/* TASKS */}
        {/* ================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    Tasks
                  </h2>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                    {tasks.length}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {roleContent.taskDescription}
                </p>
              </div>

              {isTaskLoading && (
                <span className="shrink-0 text-xs font-medium text-indigo-600">
                  Updating...
                </span>
              )}
            </div>

            {/* FILTERS */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select
                value={
                  filters.status ?? ""
                }
                onChange={(event) => {
                  void handleFilterChange({
                    ...filters,
                    status:
                      event.target.value
                        ? (event.target.value as ProjectTask["status"])
                        : undefined,
                  });
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="">
                  All statuses
                </option>
                <option value="TODO">
                  To Do
                </option>
                <option value="IN_PROGRESS">
                  In Progress
                </option>
                <option value="IN_REVIEW">
                  In Review
                </option>
                <option value="DONE">
                  Done
                </option>
              </select>

              <select
                value={
                  filters.priority ?? ""
                }
                onChange={(event) => {
                  void handleFilterChange({
                    ...filters,
                    priority:
                      event.target.value
                        ? (event.target.value as ProjectTask["priority"])
                        : undefined,
                  });
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              >
                <option value="">
                  All priorities
                </option>
                <option value="LOW">
                  Low
                </option>
                <option value="MEDIUM">
                  Medium
                </option>
                <option value="HIGH">
                  High
                </option>
                <option value="CRITICAL">
                  Critical
                </option>
              </select>

              <input
                type="date"
                value={
                  filters.fromDate ?? ""
                }
                onChange={(event) => {
                  void handleFilterChange({
                    ...filters,
                    fromDate:
                      event.target.value ||
                      undefined,
                  });
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />

              <input
                type="date"
                value={
                  filters.toDate ?? ""
                }
                onChange={(event) => {
                  void handleFilterChange({
                    ...filters,
                    toDate:
                      event.target.value ||
                      undefined,
                  });
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {(filters.status ||
              filters.priority ||
              filters.fromDate ||
              filters.toDate) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
              >
                Reset filters
              </button>
            )}
          </div>

          {/* TASK LIST */}
          <div className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <div className="p-10 text-center sm:p-12">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
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
                      d="M9 5h6m-7 4h8m-9 4h10m-11 4h12"
                    />
                  </svg>
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-700">
                  No tasks match your filters.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Try changing the filters to see more project work.
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <article
                  key={task.id}
                  className="p-5 transition hover:bg-slate-50/70 sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words text-sm font-semibold text-slate-900 sm:text-base">
                          {task.title}
                        </h3>

                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {statusLabel[task.status]}
                        </span>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityClasses[task.priority]}`}
                        >
                          {priorityLabel[task.priority]}
                        </span>

                        {task.isOverdue && (
                          <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
                            Overdue
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="mt-2 line-clamp-2 max-w-3xl text-sm leading-6 text-slate-500">
                          {task.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end xl:min-w-[610px] xl:justify-end">
                      <div className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
                        <div className="min-w-0">
                          <span className="block text-slate-400">
                            Developer
                          </span>

                          <span className="mt-1 block truncate font-medium text-slate-700">
                            {task.assignedDeveloper?.name ||
                              "Unassigned"}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <span className="block text-slate-400">
                            Due date
                          </span>

                          <span className="mt-1 block font-medium text-slate-700">
                            {task.dueDate
                              ? new Date(
                                  task.dueDate,
                                ).toLocaleDateString()
                              : "No due date"}
                          </span>
                        </div>

                        <div className="col-span-2 min-w-0 sm:col-span-1">
                          <span className="block text-slate-400">
                            Access
                          </span>

                          <span className="mt-1 block font-medium text-slate-700">
                            {role === "DEVELOPER"
                              ? "Assigned to you"
                              : canManageTasks
                                ? "Managed by you"
                                : "Visible"}
                          </span>
                        </div>
                      </div>

                      {/* ACTIONS */}
                      {canUpdateAssignedTasks && (
                        <div className="flex w-full items-center gap-2 sm:w-auto">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingTask(task)
                            }
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 sm:flex-none"
                          >
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
                                d="M12 20h9"
                              />

                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 3.5a2.12 2.12 0 013 3L8 18l-4 1 1-4 11.5-11.5z"
                              />
                            </svg>

                            Edit
                          </button>

                          {canManageTasks && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingTask(task)
                              }
                              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-500/10 sm:flex-none"
                            >
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
                                  d="M3 6h18"
                                />

                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M8 6V4.5A1.5 1.5 0 019.5 3h5A1.5 1.5 0 0116 4.5V6"
                                />

                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 6l-1 14H6L5 6"
                                />
                              </svg>

                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* LIVE ACTIVITY */}
        <ActivityFeed
          projectId={project.id}
        />
      </div>

      {/* ==================================================== */}
      {/* CREATE TASK MODAL */}
      {/* ==================================================== */}

      {isCreateTaskOpen && (
        <CreateTaskModal
          projectId={project.id}
          onClose={() =>
            setIsCreateTaskOpen(false)
          }
          onCreated={handleTaskCreated}
        />
      )}

      {/* ==================================================== */}
      {/* UPDATE TASK MODAL */}
      {/* ==================================================== */}

      {editingTask && role && (
        <UpdateTaskModal
          task={editingTask}
          role={role}
          onClose={() =>
            setEditingTask(null)
          }
          onUpdated={handleTaskUpdated}
        />
      )}

      {/* ==================================================== */}
      {/* DELETE TASK CONFIRM */}
      {/* ==================================================== */}

      {deletingTask && (
        <DeleteTaskConfirm
          task={deletingTask}
          onClose={() =>
            setDeletingTask(null)
          }
          onDeleted={handleTaskDeleted}
        />
      )}
    </>
  );
};

export default ProjectDetails;