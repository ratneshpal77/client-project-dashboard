import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

import { getAuthenticatedUser } from "../utils/auth.js";

import {
  createTask,
  deleteTask,
  getProjectTasks,
  getTaskById,
  updateTask,
} from "../services/task.service.js";

import {
  createTaskSchema,
  updateTaskSchema,
} from "../validators/task.validator.js";

import {
  taskQuerySchema,
} from "../validators/task-query.validator.js";


export const create = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const projectId = req.params.projectId;

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

  const input = createTaskSchema.parse(req.body);

  const task = await createTask(
    projectId,
    input,
    user.id,
    user.role,
  );

  res.status(201).json({
    success: true,
    data: {
      task,
    },
  });
};



export const getAll = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const projectId = req.params.projectId;

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

  // Validate query parameters
  const filters = taskQuerySchema.parse(
    req.query,
  );

  const tasks = await getProjectTasks(
    projectId,
    user.id,
    user.role,
    filters,
  );

  res.status(200).json({
    success: true,
    data: {
      tasks,
    },
  });
};



export const getOne = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const taskId = req.params.id;

  if (!taskId || Array.isArray(taskId)) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid task ID",
        statusCode: 400,
      },
    });

    return;
  }

  const task = await getTaskById(
    taskId,
    user.id,
    user.role,
  );

  if (!task) {
    res.status(404).json({
      success: false,
      error: {
        message: "Task not found",
        statusCode: 404,
      },
    });

    return;
  }

  res.status(200).json({
    success: true,
    data: {
      task,
    },
  });
};



export const update = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const taskId = req.params.id;

  if (!taskId || Array.isArray(taskId)) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid task ID",
        statusCode: 400,
      },
    });

    return;
  }

  const input = updateTaskSchema.parse(req.body);

  const task = await updateTask(
    taskId,
    input,
    user.id,
    user.role,
  );

  res.status(200).json({
    success: true,
    data: {
      task,
    },
  });
};



export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const user = getAuthenticatedUser(req);

  const taskId = req.params.id;

  if (!taskId || Array.isArray(taskId)) {
    res.status(400).json({
      success: false,
      error: {
        message: "Invalid task ID",
        statusCode: 400,
      },
    });

    return;
  }

  await deleteTask(
    taskId,
    user.id,
    user.role,
  );

  res.status(200).json({
    success: true,
    data: {
      message: "Task deleted successfully",
    },
  });
};