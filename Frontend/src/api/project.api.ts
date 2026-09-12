import api from "./axios";

import type {
  ProjectResponse,
  ProjectsResponse,
} from "../types/project";



export interface CreateProjectInput {
  name: string;
  description?: string;
  clientId: string;
  managerId?: string;
}



export const getProjectsApi =
  async (): Promise<ProjectsResponse> => {
    const response =
      await api.get<ProjectsResponse>(
        "/projects",
      );

    return response.data;
  };



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