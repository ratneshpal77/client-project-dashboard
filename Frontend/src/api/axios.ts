import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { store } from "../store/auth.store";
import {
  clearAuth,
  setAccessToken,
} from "../store/auth.store";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    const accessToken =
      store.getState().auth.accessToken;

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

let isRefreshing = false;

let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processPendingRequests = (
  error: unknown,
  token: string | null,
) => {
  pendingRequests.forEach(
    ({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else if (token) {
        resolve(token);
      }
    },
  );

  pendingRequests = [];
};

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | (InternalAxiosRequestConfig & {
            _retry?: boolean;
          })
        | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    // Do not refresh if the failed request itself
    // is the refresh endpoint.
    if (
      originalRequest.url?.includes(
        "/auth/refresh",
      )
    ) {
      store.dispatch(clearAuth());

      return Promise.reject(error);
    }

    // ----------------------------------------------------------
    // Another request is already refreshing
    // ----------------------------------------------------------

    if (isRefreshing) {
      return new Promise(
        (resolve, reject) => {
          pendingRequests.push({
            resolve,
            reject,
          });
        },
      ).then((newToken) => {
        originalRequest._retry = true;

        originalRequest.headers.Authorization =
          `Bearer ${newToken}`;

        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // --------------------------------------------------------
      // Refresh token is automatically sent as HttpOnly cookie
      // --------------------------------------------------------

      const response =
        await axios.post<{
          success: boolean;
          data: {
            accessToken: string;
          };
        }>(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

      const newAccessToken =
        response.data.data.accessToken;

      store.dispatch(
        setAccessToken(newAccessToken),
      );

      processPendingRequests(
        null,
        newAccessToken,
      );

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      processPendingRequests(
        refreshError,
        null,
      );

      store.dispatch(clearAuth());

      return Promise.reject(
        refreshError,
      );
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;