import api from "./axios";

import type {
  ActivityResponse,
} from "../types/activity";

// ============================================================
// GET RECENT 20 ACTIVITIES
// ============================================================

export const getRecentActivitiesApi =
  async (): Promise<ActivityResponse> => {
    const response =
      await api.get<ActivityResponse>(
        "/activities/recent",
      );

    return response.data;
  };

// ============================================================
// GET PROJECT ACTIVITIES
// ============================================================

export const getProjectActivitiesApi =
  async (
    projectId: string,
  ): Promise<ActivityResponse> => {
    const response =
      await api.get<ActivityResponse>(
        `/projects/${projectId}/activities`,
      );

    return response.data;
  };

// ============================================================
// GET TASK ACTIVITIES
// ============================================================

export const getTaskActivitiesApi =
  async (
    taskId: string,
  ): Promise<ActivityResponse> => {
    const response =
      await api.get<ActivityResponse>(
        `/tasks/${taskId}/activities`,
      );

    return response.data;
  };