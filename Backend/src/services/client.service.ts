import { prisma } from "../config/database.js";
import type { Prisma } from "../generated/prisma/client.js";

export const createClient = async (
  data: Prisma.ClientCreateInput,
) => {
  return prisma.client.create({
    data,
  });
};

export const getClients = async () => {
  return prisma.client.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getClientById = async (id: string) => {
  return prisma.client.findUnique({
    where: {
      id,
    },
    include: {
      projects: {
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      },
    },
  });
};

export const updateClient = async (
  id: string,
  data: Prisma.ClientUpdateInput,
) => {
  return prisma.client.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteClient = async (id: string) => {
  const client = await prisma.client.findUnique({
    where: {
      id,
    },
    include: {
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  if (!client) {
    const error = new Error("Client not found") as Error & {
      statusCode?: number;
    };

    error.statusCode = 404;
    throw error;
  }

  if (client._count.projects > 0) {
    const error = new Error(
      `Client cannot be deleted because it has ${client._count.projects} associated project${
        client._count.projects === 1 ? "" : "s"
      }.`,
    ) as Error & {
      statusCode?: number;
    };

    error.statusCode = 409;
    throw error;
  }

  return prisma.client.delete({
    where: {
      id,
    },
  });
};