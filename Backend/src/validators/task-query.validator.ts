import { z } from "zod";

export const taskQuerySchema = z
  .object({
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

    fromDate: z
      .coerce
      .date()
      .optional(),

    toDate: z
      .coerce
      .date()
      .optional(),
  })
  .refine(
    (data) =>
      !data.fromDate ||
      !data.toDate ||
      data.fromDate <= data.toDate,
    {
      message:
        "fromDate must be before or equal to toDate",
      path: ["fromDate"],
    },
  );

export type TaskQueryInput =
  z.infer<typeof taskQuerySchema>;