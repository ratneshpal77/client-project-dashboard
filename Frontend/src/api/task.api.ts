import api from "./axios";

import type {
  ProjectTask,
} from "../types/project";

// ============================================================
// TASK FILTERS
// ============================================================

export interface TaskFilters {
  status?: ProjectTask["status"];
  priority?: ProjectTask["priority"];
  fromDate?: string;
  toDate?: string;
}

// ============================================================
// CREATE TASK
// ============================================================

export interface CreateTaskInput {
  title: string;
  description?: string;
  assignedDeveloperId?: string;
  status?: ProjectTask["status"];
  priority?: ProjectTask["priority"];
  dueDate?: string;
}

interface TaskResponse {
  success: boolean;
  data: {
    task: ProjectTask;
  };
}

// ============================================================
// UPDATE TASK
// ============================================================

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  assignedDeveloperId?: string | null;
  status?: ProjectTask["status"];
  priority?: ProjectTask["priority"];
  dueDate?: string | null;
}

// ============================================================
// GET PROJECT TASKS
// ============================================================

interface TasksResponse {
  success: boolean;
  data: {
    tasks: ProjectTask[];
  };
}

export const getProjectTasksApi =
  async (
    projectId: string,
    filters: TaskFilters = {},
  ): Promise<TasksResponse> => {
    const params = new URLSearchParams();

    if (filters.status) {
      params.set(
        "status",
        filters.status,
      );
    }

    if (filters.priority) {
      params.set(
        "priority",
        filters.priority,
      );
    }

    if (filters.fromDate) {
      params.set(
        "fromDate",
        filters.fromDate,
      );
    }

    if (filters.toDate) {
      params.set(
        "toDate",
        filters.toDate,
      );
    }

    const query =
      params.toString();

    const response =
      await api.get<TasksResponse>(
        `/projects/${projectId}/tasks${
          query ? `?${query}` : ""
        }`,
      );

    return response.data;
  };

// ============================================================
// GET SINGLE TASK
// ============================================================

export const getTaskApi =
  async (
    taskId: string,
  ): Promise<TaskResponse> => {
    const response =
      await api.get<TaskResponse>(
        `/tasks/${taskId}`,
      );

    return response.data;
  };

// ============================================================
// CREATE TASK
// ============================================================

export const createTaskApi =
  async (
    projectId: string,
    input: CreateTaskInput,
  ): Promise<TaskResponse> => {
    const response =
      await api.post<TaskResponse>(
        `/projects/${projectId}/tasks`,
        input,
      );

    return response.data;
  };

// ============================================================
// UPDATE TASK
// ============================================================

export const updateTaskApi =
  async (
    taskId: string,
    input: UpdateTaskInput,
  ): Promise<TaskResponse> => {
    const response =
      await api.patch<TaskResponse>(
        `/tasks/${taskId}`,
        input,
      );

    return response.data;
  };

// ============================================================
// DELETE TASK
// ============================================================

interface DeleteTaskResponse {
  success: boolean;
  data?: {
    message?: string;
  };
}

export const deleteTaskApi =
  async (
    taskId: string,
  ): Promise<DeleteTaskResponse> => {
    const response =
      await api.delete<DeleteTaskResponse>(
        `/tasks/${taskId}`,
      );

    return response.data;
  };