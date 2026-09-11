import { z } from "zod";

export const createClientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Client name must be at least 2 characters")
    .max(100, "Client name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),

  company: z
    .string()
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(150, "Company name cannot exceed 150 characters"),

  phone: z
    .string()
    .trim()
    .max(20, "Phone number cannot exceed 20 characters")
    .optional()
    .or(z.literal("")),
});

export const updateClientSchema = createClientSchema.partial();