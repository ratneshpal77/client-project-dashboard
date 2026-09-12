import api from "./axios";



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



export const getDevelopersApi =
  async (): Promise<DevelopersResponse> => {
    const response =
      await api.get<DevelopersResponse>(
        "/users/developers",
      );

    return response.data;
  };