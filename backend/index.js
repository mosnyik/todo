const express = require("express");
const z = require("zod");
const prisma = require("./prisma-client");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Mosnyik ToDos<h1>");
});

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

// get all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await prisma.task.findMany();
  res.send(tasks);
});

// get task by id
app.get("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const task = await prisma.task.findUnique({
    where: { id: parseInt(id) },
  });
  if (!task) return res.status(404).send({ message: "Task not found" });
  res.send(task);
});

// add new task
app.post("/tasks", async (req, res) => {
  const { data, error, success } = addTaskSchema.safeParse(req.body);
  if (!success) return res.status(400).send({ message: error.errors });
  const newTask = await prisma.task.create({
    data: data,
  });
  res.status(201).send({ newTask });
});

// edit task
app.patch("/tasks/:id", async (req, res) => {
  // get the task id
  const id = req.params.id;
  // validate the user inputs
  const { data, error, success } = editTaskSchema.safeParse(req.body);
  if (!success) return res.status(400).send({ message: error.errors });
  // fetch existing task
  const task = await prisma.task.findUnique({
    where: { id: parseInt(id) },
  });
  if (!task) return res.status(404).send({ message: "Task not found" });

  const updatedTask = await prisma.task.update({
    where: { id: parseInt(id) },
    data,
  });
  res.send(updatedTask);
});

// delete task
app.delete("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  const task = await prisma.task.findUnique({
    where: { id: parseInt(id) },
  });
  if (!task) return res.status(404).send({ message: "Task not found" });
  const deletedTask = await prisma.task.delete({
    where: { id: parseInt(id) },
  });
  res.status(204).send(deletedTask);
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`ToDo app up and running on port ${port}...`)
);

module.exports = app;
