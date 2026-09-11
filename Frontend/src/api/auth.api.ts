import api from "./axios";

import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RefreshResponse,
} from "../types/auth";

// ============================================================
// LOGIN
// ============================================================

export const loginApi = async (
  data: LoginRequest,
): Promise<LoginResponse> => {
  const response =
    await api.post<LoginResponse>(
      "/auth/login",
      data,
    );

  return response.data;
};

// ============================================================
// GET CURRENT USER
// ============================================================

export const meApi =
  async (): Promise<MeResponse> => {
    const response =
      await api.get<MeResponse>(
        "/auth/me",
      );

    return response.data;
  };

// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

export const refreshApi =
  async (): Promise<RefreshResponse> => {
    const response =
      await api.post<RefreshResponse>(
        "/auth/refresh",
      );

    return response.data;
  };

// ============================================================
// LOGOUT
// ============================================================

export const logoutApi =
  async (): Promise<void> => {
    await api.post(
      "/auth/logout",
    );
  };