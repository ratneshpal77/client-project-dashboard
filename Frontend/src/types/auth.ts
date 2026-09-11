export type UserRole =
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "DEVELOPER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    user?: User;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: User;
  };
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}