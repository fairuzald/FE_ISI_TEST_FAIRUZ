import { z } from "zod";

export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title must be less than 100 characters" }),
  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional()
    .nullable(),
  status: z.enum(["not_started", "on_progress", "done", "reject"], {
    required_error: "Please select a status",
    invalid_type_error: "Status must be one of the allowed values",
  }),
  assignedToId: z.string().optional().nullable(),
  assignedToIds: z.array(z.string()).optional(),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
