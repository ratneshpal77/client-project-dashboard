import api from "./axios";

// ============================================================
// DEVELOPER
// ============================================================

export interface Developer {
  id: string;
  name: string;
  email: string;
  role: "DEVELOPER";
}

interface DevelopersResponse {
  success: boolean;
  data: {
    developers: Developer[];
  };
}

// ============================================================
// GET DEVELOPERS
// ============================================================

export const getDevelopersApi =
  async (): Promise<DevelopersResponse> => {
    const response =
      await api.get<DevelopersResponse>(
        "/users/developers",
      );

    return response.data;
  };