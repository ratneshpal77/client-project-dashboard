import api from "./axios";

export interface ClientProject {
  id: string;
  name: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  projects?: ClientProject[];
}

export interface CreateClientInput {
  name: string;
  email: string;
  company: string;
  phone: string;
}

export interface UpdateClientInput {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
}

interface ClientsResponse {
  success: boolean;
  data: {
    clients: Client[];
  };
}

interface ClientResponse {
  success: boolean;
  data: {
    client: Client;
  };
}

interface DeleteClientResponse {
  success: boolean;
  data: {
    message: string;
  };
}

export const getClientsApi = async () => {
  const response =
    await api.get<ClientsResponse>("/clients");

  return response.data;
};

export const getClientApi = async (
  clientId: string,
) => {
  const response =
    await api.get<ClientResponse>(
      `/clients/${clientId}`,
    );

  return response.data;
};

export const createClientApi = async (
  input: CreateClientInput,
) => {
  const response =
    await api.post<ClientResponse>(
      "/clients",
      input,
    );

  return response.data;
};

export const updateClientApi = async (
  clientId: string,
  input: UpdateClientInput,
) => {
  const response =
    await api.patch<ClientResponse>(
      `/clients/${clientId}`,
      input,
    );

  return response.data;
};

export const deleteClientApi = async (
  clientId: string,
) => {
  const response =
    await api.delete<DeleteClientResponse>(
      `/clients/${clientId}`,
    );

  return response.data;
};