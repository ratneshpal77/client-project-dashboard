import { prisma } from "../lib/prisma.js";
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from "../validators/project.validator.js";

export const createProject = async (
  input: CreateProjectInput,
  createdBy: string,
) => {
  const client = await prisma.client.findUnique({
    where: {
      id: input.clientId,
    },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  if (input.managerId) {
    const manager = await prisma.user.findUnique({
      where: {
        id: input.managerId,
      },
    });

    if (!manager || manager.role !== "PROJECT_MANAGER") {
      throw new Error("Invalid project manager");
    }
  }

  return prisma.project.create({
    data: {
      name: input.name,
      description: input.description,
      clientId: input.clientId,
      createdBy,
      managerId: input.managerId,
    },
    include: {
      client: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

export const getProjects = async (
  userId: string,
  role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER",
) => {
  if (role === "ADMIN") {
    return prisma.project.findMany({
      include: {
        client: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (role === "PROJECT_MANAGER") {
    return prisma.project.findMany({
      where: {
        createdBy: userId,
      },
      include: {
        client: true,
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  return prisma.project.findMany({
    where: {
      tasks: {
        some: {
          assignedDeveloperId: userId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      client: {
        select: {
          id: true,
          name: true,
          company: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getProjectById = async (
  projectId: string,
  userId: string,
  role: "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER",
) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    include: {
      client: true,
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
      tasks: {
        where:
          role === "DEVELOPER"
            ? {
                assignedDeveloperId: userId,
              }
            : undefined,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!project) {
    return null;
  }

  if (role === "PROJECT_MANAGER" && project.createdBy !== userId) {
    return null;
  }

  if (
    role === "DEVELOPER" &&
    !project.tasks.some(
      (task) => task.assignedDeveloperId === userId,
    )
  ) {
    return null;
  }

  return project;
};

export const updateProject = async (
  projectId: string,
  userId: string,
  role: "ADMIN" | "PROJECT_MANAGER",
  input: UpdateProjectInput,
) => {
  const existingProject = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!existingProject) {
    throw new Error("Project not found");
  }

  if (
    role === "PROJECT_MANAGER" &&
    existingProject.createdBy !== userId
  ) {
    throw new Error("You can only manage your own projects");
  }

  if (input.clientId) {
    const client = await prisma.client.findUnique({
      where: {
        id: input.clientId,
      },
    });

    if (!client) {
      throw new Error("Client not found");
    }
  }

  if (input.managerId) {
    const manager = await prisma.user.findUnique({
      where: {
        id: input.managerId,
      },
    });

    if (!manager || manager.role !== "PROJECT_MANAGER") {
      throw new Error("Invalid project manager");
    }
  }

  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: input,
    include: {
      client: true,
      manager: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
};

export const deleteProject = async (
  projectId: string,
  userId: string,
  role: "ADMIN" | "PROJECT_MANAGER",
) => {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (
    role === "PROJECT_MANAGER" &&
    project.createdBy !== userId
  ) {
    throw new Error("You can only delete your own projects");
  }

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });
};