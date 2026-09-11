import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import {
  createClient,
  deleteClient,
  getClientById,
  getClients,
  updateClient,
} from "../services/client.service.js";

import {
  createClientSchema,
  updateClientSchema,
} from "../validators/client.validator.js";

export const create = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const input = createClientSchema.parse(req.body);

  const client = await createClient(input);

  res.status(201).json({
    success: true,
    data: {
      client,
    },
  });
};

export const getAll = async (
  _req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const clients = await getClients();

  res.status(200).json({
    success: true,
    data: {
      clients,
    },
  });
};

export const getOne = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
 const clientId = req.params.id;

if (!clientId || Array.isArray(clientId)) {
  res.status(400).json({
    success: false,
    error: {
      message: "Invalid client ID",
      statusCode: 400,
    },
  });

  return;
}

const client = await getClientById(clientId);

  if (!client) {
    res.status(404).json({
      success: false,
      error: {
        message: "Client not found",
        statusCode: 404,
      },
    });

    return;
  }

  res.status(200).json({
    success: true,
    data: {
      client,
    },
  });
};

export const update = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const input = updateClientSchema.parse(req.body);

 const clientId = req.params.id;

if (!clientId || Array.isArray(clientId)) {
  res.status(400).json({
    success: false,
    error: {
      message: "Invalid client ID",
      statusCode: 400,
    },
  });

  return;
}

const client = await updateClient(clientId, input);

  res.status(200).json({
    success: true,
    data: {
      client,
    },
  });
};

export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const clientId = req.params.id;

if (!clientId || Array.isArray(clientId)) {
  res.status(400).json({
    success: false,
    error: {
      message: "Invalid client ID",
      statusCode: 400,
    },
  });

  return;
}

await deleteClient(clientId);

  res.status(200).json({
    success: true,
    data: {
      message: "Client deleted successfully",
    },
  });
};