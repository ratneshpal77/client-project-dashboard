import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  clientId: z
    .string()
    .uuid("Invalid client ID"),

  managerId: z
    .string()
    .uuid("Invalid manager ID")
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters")
    .max(100, "Project name cannot exceed 100 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .nullable()
    .optional(),

  clientId: z
    .string()
    .uuid("Invalid client ID")
    .optional(),

  managerId: z
    .string()
    .uuid("Invalid manager ID")
    .nullable()
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;