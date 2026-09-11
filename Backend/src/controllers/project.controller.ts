import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import { getAuthenticatedUser } from "../utils/auth.js";

import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from "../services/project.service.js";

import {
  createProjectSchema,
  updateProjectSchema,
} from "../validators/project.validator.js";



export const create = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const input = createProjectSchema.parse(req.body);

  const project = await createProject(
    input,
    user.id,
  );

  res.status(201).json({
    success: true,
    data: {
      project,
    },
  });
};



export const getAll = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const projects = await getProjects(
    user.id,
    user.role,
  );

  res.status(200).json({
    success: true,
    data: {
      projects,
    },
  });
};



export const getOne = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const projectId = req.params.id;

  if (!projectId || Array.isArray(projectId)) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid project ID",
        statusCode: 400,
      },
    });

    return;
  }

  const project = await getProjectById(
    projectId,
    user.id,
    user.role,
  );

  if (!project) {
    res.status(404).json({
      success: false,
      error: {
        message: "Project not found",
        statusCode: 404,
      },
    });

    return;
  }

  res.status(200).json({
    success: true,
    data: {
      project,
    },
  });
};



export const update = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const projectId = req.params.id;

  if (!projectId || Array.isArray(projectId)) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid project ID",
        statusCode: 400,
      },
    });

    return;
  }

  // Developer cannot update projects.
  if (
    user.role !== "ADMIN" &&
    user.role !== "PROJECT_MANAGER"
  ) {
    res.status(403).json({
      success: false,
      error: {
        message: "You do not have permission to update projects",
        statusCode: 403,
      },
    });

    return;
  }

  const input = updateProjectSchema.parse(req.body);

  const project = await updateProject(
    projectId,
    user.id,
    user.role,
    input,
  );

  res.status(200).json({
    success: true,
    data: {
      project,
    },
  });
};


export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const projectId = req.params.id;

  if (!projectId || Array.isArray(projectId)) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid project ID",
        statusCode: 400,
      },
    });

    return;
  }

  // Developer cannot delete projects.
  if (
    user.role !== "ADMIN" &&
    user.role !== "PROJECT_MANAGER"
  ) {
    res.status(403).json({
      success: false,
      error: {
        message: "You do not have permission to delete projects",
        statusCode: 403,
      },
    });

    return;
  }

  await deleteProject(
    projectId,
    user.id,
    user.role,
  );

  res.status(200).json({
    success: true,
    data: {
      message: "Project deleted successfully",
    },
  });
};