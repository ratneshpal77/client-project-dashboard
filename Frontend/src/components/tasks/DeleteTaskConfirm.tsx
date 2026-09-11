import { useState } from "react";

import {
  deleteTaskApi,
} from "../../api/task.api";

import type {
  ProjectTask,
} from "../../types/project";

interface DeleteTaskConfirmProps {
  task: ProjectTask;
  onClose: () => void;
  onDeleted: (taskId: string) => void;
}

const DeleteTaskConfirm = ({
  task,
  onClose,
  onDeleted,
}: DeleteTaskConfirmProps) => {
  const [isDeleting, setIsDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError("");

      await deleteTaskApi(
        task.id,
      );

      onDeleted(task.id);
      onClose();
    } catch (error) {
      console.error(
        "Failed to delete task:",
        error,
      );

      setError(
        "Unable to delete task.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-task-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="px-5 py-5 sm:px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
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

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 10v6M14 10v6"
              />
            </svg>
          </div>

          <h2
            id="delete-task-title"
            className="mt-4 text-xl font-bold text-slate-900"
          >
            Delete task?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-700">
              "{task.title}"
            </span>
            ? This action cannot be undone.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-6">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="w-full rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isDeleting
              ? "Deleting..."
              : "Delete task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteTaskConfirm;