import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";
import {
  createTaskApi,
} from "../../api/task.api";

import {
  getDevelopersApi,
  type Developer,
} from "../../api/user.api";

import type {
  ProjectTask,
} from "../../types/project";

interface CreateTaskModalProps {
  projectId: string;
  onClose: () => void;
  onCreated: (task: ProjectTask) => void;
}

const CreateTaskModal = ({
  projectId,
  onClose,
  onCreated,
}: CreateTaskModalProps) => {
  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState<ProjectTask["priority"]>("MEDIUM");

  const [status, setStatus] =
    useState<ProjectTask["status"]>("TODO");

  const [dueDate, setDueDate] =
    useState("");

  const [assignedDeveloperId, setAssignedDeveloperId] =
    useState("");

  const [developers, setDevelopers] =
    useState<Developer[]>([]);

  const [isLoadingDevelopers, setIsLoadingDevelopers] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

 

  useEffect(() => {
    let mounted = true;

    const loadDevelopers =
      async () => {
        try {
          setIsLoadingDevelopers(true);

          const response =
            await getDevelopersApi();

          if (!mounted) {
            return;
          }

          setDevelopers(
            response.data.developers,
          );
        } catch (error) {
          console.error(
            "Failed to load developers:",
            error,
          );

          if (mounted) {
            setError(
              "Unable to load developers.",
            );
          }
        } finally {
          if (mounted) {
            setIsLoadingDevelopers(false);
          }
        }
      };

    void loadDevelopers();

    return () => {
      mounted = false;
    };
  }, []);

 

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response =
        await createTaskApi(
          projectId,
          {
            title: title.trim(),
            description:
              description.trim() || undefined,
            assignedDeveloperId:
              assignedDeveloperId || undefined,
            status,
            priority,
            dueDate:
              dueDate || undefined,
          },
        );

      onCreated(
        response.data.task,
      );

      onClose();
    } catch (error) {
      console.error(
        "Failed to create task:",
        error,
      );

      setError(
        "Unable to create task.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
       

        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              Project work
            </p>

            <h2
              id="create-task-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              Create task
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a new task and optionally assign it to a developer.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>


        <form
          onSubmit={handleSubmit}
          className="max-h-[80vh] overflow-y-auto"
        >
          <div className="space-y-5 px-5 py-6 sm:px-6">
            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <label
                htmlFor="task-title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Task title
              </label>

              <input
                id="task-title"
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Build authentication page"
                maxLength={200}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="task-description"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <textarea
                id="task-description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe what needs to be done..."
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {/* Priority / Status */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="task-priority"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Priority
                </label>

                <select
                  id="task-priority"
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value as ProjectTask["priority"],
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                >
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
              </div>

              <div>
                <label
                  htmlFor="task-status"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Status
                </label>

                <select
                  id="task-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as ProjectTask["status"],
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                >
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
              </div>
            </div>

            {/* Developer / Due date */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="task-developer"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Assign developer
                </label>

                <select
                  id="task-developer"
                  value={assignedDeveloperId}
                  onChange={(event) =>
                    setAssignedDeveloperId(
                      event.target.value,
                    )
                  }
                  disabled={isLoadingDevelopers}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {isLoadingDevelopers
                      ? "Loading developers..."
                      : "Unassigned"}
                  </option>

                  {developers.map(
                    (developer) => (
                      <option
                        key={developer.id}
                        value={developer.id}
                      >
                        {developer.name} —{" "}
                        {developer.email}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div>
                <label
                  htmlFor="task-due-date"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Due date
                </label>

                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(event) =>
                    setDueDate(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>
          </div>

         

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting
                ? "Creating..."
                : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;