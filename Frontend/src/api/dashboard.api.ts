import api from "./axios";

import type {
  AdminDashboardResponse,
} from "../types/dashboard";

export const getAdminDashboardApi =
  async (): Promise<AdminDashboardResponse> => {
    const response =
      await api.get<AdminDashboardResponse>(
        "/dashboard/admin",
      );

    return response.data;
  };