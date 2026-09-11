import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";

import {
  createProjectApi,
  getProjectsApi,
} from "../../api/project.api";

import {
  getClientsApi,
  type Client,
} from "../../api/client.api";

import type {
  Project,
} from "../../types/project";

import type {
  RootState,
} from "../../store/auth.store";

const Projects = () => {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [clients, setClients] =
    useState<Client[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [isCreateLoading, setIsCreateLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [createError, setCreateError] =
    useState("");

  const [projectName, setProjectName] =
    useState("");

  const [projectDescription, setProjectDescription] =
    useState("");

  const [selectedClientId, setSelectedClientId] =
    useState("");

  const user = useSelector(
    (state: RootState) =>
      state.auth.user,
  );

  const role = user?.role;

  const canCreateProject =
    role === "ADMIN" ||
    role === "PROJECT_MANAGER";

  const pageContent = useMemo(() => {
    switch (role) {
      case "ADMIN":
        return {
          label: "Workspace",
          title: "Projects",
          description:
            "View and manage all client projects across the workspace.",
        };

      case "PROJECT_MANAGER":
        return {
          label: "My workspace",
          title: "Projects",
          description:
            "Manage your projects, tasks and team activity.",
        };

      case "DEVELOPER":
        return {
          label: "My workspace",
          title: "Assigned projects",
          description:
            "View projects and tasks assigned to you.",
        };

      default:
        return {
          label: "Workspace",
          title: "Projects",
          description:
            "View and manage client projects.",
        };
    }
  }, [role]);

  // ============================================================
  // LOAD PROJECTS
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadProjects =
      async () => {
        try {
          setIsLoading(true);
          setError("");

          const response =
            await getProjectsApi();

          if (!mounted) {
            return;
          }

          setProjects(
            response.data.projects,
          );
        } catch (error) {
          console.error(
            "Failed to load projects:",
            error,
          );

          if (mounted) {
            setError(
              "Unable to load projects.",
            );
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      };

    void loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // LOAD CLIENTS FOR CREATE PROJECT
  // ============================================================

  useEffect(() => {
    if (!canCreateProject) {
      return;
    }

    let mounted = true;

    const loadClients =
      async () => {
        try {
          const response =
            await getClientsApi();

          if (!mounted) {
            return;
          }

          setClients(
            response.data.clients,
          );
        } catch (error) {
          console.error(
            "Failed to load clients:",
            error,
          );

          if (mounted) {
            setClients([]);
          }
        }
      };

    void loadClients();

    return () => {
      mounted = false;
    };
  }, [canCreateProject]);

  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================

  const openCreateModal =
    () => {
      setProjectName("");
      setProjectDescription("");
      setSelectedClientId("");
      setCreateError("");
      setIsCreateModalOpen(true);
    };

  // ============================================================
  // CLOSE CREATE MODAL
  // ============================================================

  const closeCreateModal =
    () => {
      if (isCreateLoading) {
        return;
      }

      setIsCreateModalOpen(false);
      setCreateError("");
    };

  // ============================================================
  // CREATE PROJECT
  // ============================================================

  const handleCreateProject = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setCreateError("");

    const name =
      projectName.trim();

    const description =
      projectDescription.trim();

    if (name.length < 2) {
      setCreateError(
        "Project name must be at least 2 characters.",
      );

      return;
    }

    if (name.length > 100) {
      setCreateError(
        "Project name cannot exceed 100 characters.",
      );

      return;
    }

    if (description.length > 1000) {
      setCreateError(
        "Description cannot exceed 1000 characters.",
      );

      return;
    }

    if (!selectedClientId) {
      setCreateError(
        "Please select a client.",
      );

      return;
    }

    try {
      setIsCreateLoading(true);

      const input: {
        name: string;
        description?: string;
        clientId: string;
        managerId?: string;
      } = {
        name,
        clientId:
          selectedClientId,
      };

      if (description) {
        input.description =
          description;
      }

      // PM-created project is associated
      // with the currently authenticated PM.
      if (
        role === "PROJECT_MANAGER" &&
        user?.id
      ) {
        input.managerId =
          user.id;
      }

      const response =
        await createProjectApi(
          input,
        );

      setProjects(
        (currentProjects) => [
          response.data.project,
          ...currentProjects,
        ],
      );

      setIsCreateModalOpen(false);
      setProjectName("");
      setProjectDescription("");
      setSelectedClientId("");
      setCreateError("");
    } catch (error) {
      console.error(
        "Failed to create project:",
        error,
      );

      setCreateError(
        "Unable to create project. Please try again.",
      );
    } finally {
      setIsCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-indigo-600">
            {pageContent.label}
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {pageContent.title}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {pageContent.description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            {projects.length} project
            {projects.length === 1
              ? ""
              : "s"}
          </div>

          {canCreateProject && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
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

              Create project
            </button>
          )}
        </div>
      </div>

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ====================================================== */}
      {/* LOADING */}
      {/* ====================================================== */}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="h-5 w-40 rounded bg-slate-200" />

                <div className="mt-3 h-4 w-28 rounded bg-slate-100" />

                <div className="mt-6 h-16 rounded-xl bg-slate-100" />

                <div className="mt-6 h-8 w-full rounded-lg bg-slate-100" />
              </div>
            ),
          )}
        </div>
      )}

      {/* ====================================================== */}
      {/* EMPTY STATE */}
      {/* ====================================================== */}

      {!isLoading &&
        !error &&
        projects.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
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
                  d="M3 7.5A2.5 2.5 0 015.5 5h4l2 2h7A2.5 2.5 0 0121 9.5v8A2.5 2.5 0 0118.5 20h-13A2.5 2.5 0 013 17.5v-10z"
                />
              </svg>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No projects yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {role === "DEVELOPER"
                ? "You do not have any assigned projects yet."
                : "Projects will appear here when they are created."}
            </p>

            {canCreateProject && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Create your first project
              </button>
            )}
          </div>
        )}

      {/* ====================================================== */}
      {/* PROJECT GRID */}
      {/* ====================================================== */}

      {!isLoading &&
        projects.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map(
              (project) => {
                const taskCount =
                  project.tasks?.length;

                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="group min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {/* Project heading */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-slate-900">
                          {project.name}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {project.client.company}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-xl bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                        Project
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {project.description ||
                        "No project description available."}
                    </p>

                    {/* Meta */}
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <span className="max-w-full truncate rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                        {project.client.name}
                      </span>

                      {project.manager && (
                        <span className="max-w-full truncate rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
                          {project.manager.name}
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                      <span className="text-xs text-slate-400">
                        {taskCount !== undefined
                          ? `${taskCount} task${taskCount === 1 ? "" : "s"}`
                          : "View tasks"}
                      </span>

                      <span className="shrink-0 text-sm font-semibold text-indigo-600 transition group-hover:translate-x-0.5">
                        Open →
                      </span>
                    </div>
                  </Link>
                );
              },
            )}
          </div>
        )}

      {/* ====================================================== */}
      {/* CREATE PROJECT MODAL */}
      {/* ====================================================== */}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  New project
                </p>

                <h2
                  id="create-project-title"
                  className="mt-1 text-xl font-bold text-slate-900"
                >
                  Create project
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Create a project and assign it
                  to a client.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateModal}
                disabled={isCreateLoading}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={
                handleCreateProject
              }
            >
              <div className="space-y-5 px-5 py-6 sm:px-6">
                {createError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {createError}
                  </div>
                )}

                {/* Project name */}
                <div>
                  <label
                    htmlFor="project-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Project name
                  </label>

                  <input
                    id="project-name"
                    type="text"
                    value={projectName}
                    onChange={(event) =>
                      setProjectName(
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Acme Website Redesign"
                    maxLength={100}
                    disabled={isCreateLoading}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="project-description"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Description
                    <span className="ml-1 font-normal text-slate-400">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="project-description"
                    value={
                      projectDescription
                    }
                    onChange={(event) =>
                      setProjectDescription(
                        event.target.value,
                      )
                    }
                    placeholder="Briefly describe the project..."
                    maxLength={1000}
                    rows={4}
                    disabled={isCreateLoading}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  />

                  <p className="mt-1 text-right text-[11px] text-slate-400">
                    {projectDescription.length}
                    /1000
                  </p>
                </div>

                {/* Client */}
                <div>
                  <label
                    htmlFor="project-client"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Client
                  </label>

                  <select
                    id="project-client"
                    value={
                      selectedClientId
                    }
                    onChange={(event) =>
                      setSelectedClientId(
                        event.target.value,
                      )
                    }
                    disabled={isCreateLoading}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50"
                  >
                    <option value="">
                      Select a client
                    </option>

                    {clients.map(
                      (client) => (
                        <option
                          key={client.id}
                          value={client.id}
                        >
                          {client.name} —{" "}
                          {client.company}
                        </option>
                      ),
                    )}
                  </select>

                  {clients.length === 0 && (
                    <p className="mt-2 text-xs text-amber-600">
                      No clients available.
                      Create a client first.
                    </p>
                  )}
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={isCreateLoading}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    isCreateLoading ||
                    clients.length === 0
                  }
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreateLoading
                    ? "Creating..."
                    : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;