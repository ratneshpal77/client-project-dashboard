import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters")
    .max(150, "Task title cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  assignedDeveloperId: z
    .string()
    .uuid("Invalid developer ID")
    .optional(),

  status: z
    .enum([
      "TODO",
      "IN_PROGRESS",
      "IN_REVIEW",
      "DONE",
    ])
    .optional(),

  priority: z
    .enum([
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL",
    ])
    .optional(),

  dueDate: z
    .coerce
    .date()
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Task title must be at least 2 characters")
    .max(150, "Task title cannot exceed 150 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .nullable()
    .optional(),

  assignedDeveloperId: z
    .string()
    .uuid("Invalid developer ID")
    .nullable()
    .optional(),

  status: z
    .enum([
      "TODO",
      "IN_PROGRESS",
      "IN_REVIEW",
      "DONE",
    ])
    .optional(),

  priority: z
    .enum([
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL",
    ])
    .optional(),

  dueDate: z
    .coerce
    .date()
    .nullable()
    .optional(),
});

export type CreateTaskInput = z.infer<
  typeof createTaskSchema
>;

export type UpdateTaskInput = z.infer<
  typeof updateTaskSchema
>;