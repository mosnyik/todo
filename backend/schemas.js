const z = require("zod");

const addTaskSchema = z.object({
  title: z.string().min(5, "Title is required").max(255),
  description: z.string().min(15, "Description is required").max(65374),
  dueDate: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z.date()
  ),
});

const editTaskSchema = z.object({
  title: z.string().min(5, "Title is required").max(255).optional(),
  description: z
    .string()
    .min(15, "Description is required")
    .max(65374)
    .optional(),
  dueDate: z
    .preprocess(
      (arg) => (typeof arg === "string" ? new Date(arg) : arg),
      z.date()
    )
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  status: z.enum(["PENDING", "COMPLETED"]).optional(),
});

module.exports = { addTaskSchema, editTaskSchema };
