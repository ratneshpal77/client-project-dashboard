import api from "./axios";

import type {
  ProjectResponse,
  ProjectsResponse,
} from "../types/project";

// ============================================================
// CREATE PROJECT INPUT
// ============================================================

export interface CreateProjectInput {
  name: string;
  description?: string;
  clientId: string;
  managerId?: string;
}

// ============================================================
// GET ALL PROJECTS
// ============================================================

export const getProjectsApi =
  async (): Promise<ProjectsResponse> => {
    const response =
      await api.get<ProjectsResponse>(
        "/projects",
      );

    return response.data;
  };

// ============================================================
// GET SINGLE PROJECT
// ============================================================

export const getProjectApi =
  async (
    projectId: string,
  ): Promise<ProjectResponse> => {
    const response =
      await api.get<ProjectResponse>(
        `/projects/${projectId}`,
      );

    return response.data;
  };

// ============================================================
// CREATE PROJECT
// ADMIN + PROJECT_MANAGER
// ============================================================

export const createProjectApi =
  async (
    input: CreateProjectInput,
  ): Promise<ProjectResponse> => {
    const response =
      await api.post<ProjectResponse>(
        "/projects",
        input,
      );

    return response.data;
  };