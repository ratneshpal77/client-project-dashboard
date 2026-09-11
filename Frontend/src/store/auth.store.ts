import {
  configureStore,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type { User } from "../types/auth";

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice =
  createSlice({
    name: "auth",

    initialState,

    reducers: {
      setCredentials: (
        state,
        action: PayloadAction<{
          accessToken: string;
          user: User;
        }>,
      ) => {
        state.accessToken =
          action.payload.accessToken;

        state.user =
          action.payload.user;

        state.isAuthenticated =
          true;

        state.isLoading = false;
      },

      setAccessToken: (
        state,
        action: PayloadAction<string>,
      ) => {
        state.accessToken =
          action.payload;
      },

      setUser: (
        state,
        action: PayloadAction<User>,
      ) => {
        state.user =
          action.payload;

        state.isAuthenticated =
          true;

        state.isLoading = false;
      },

      setLoading: (
        state,
        action: PayloadAction<boolean>,
      ) => {
        state.isLoading =
          action.payload;
      },

      clearAuth: (state) => {
        state.accessToken = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      },
    },
  });

export const {
  setCredentials,
  setAccessToken,
  setUser,
  setLoading,
  clearAuth,
} = authSlice.actions;

export const store =
  configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
  });

export type RootState =
  ReturnType<typeof store.getState>;

export type AppDispatch =
  typeof store.dispatch;