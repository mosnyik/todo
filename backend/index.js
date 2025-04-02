const express = require("express");
const z = require("zod");
const prisma = require("./prisma-client");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Mosnyik ToDos<h1>");
});

const schema = z.object({
  title: z.string().min(5, "Title is required").max(255),
  description: z.string().min(15, "Description is required").max(65374),
  dueDate: z.preprocess(
    (arg) => (typeof arg === "string" ? new Date(arg) : arg),
    z.date()
  ),
});

// get all tasks
app.get("/tasks", async (req, res) => {
  const tasks = await prisma.task.findMany();
  res.send(tasks);
});

// get task by id
app.get("/tasks/:id", async (req, res) => {
  const id =  req.params.id;
  const task = await prisma.task.findUnique({
    where: { id: parseInt(id) },
  });
  if (!task) return res.status(404).send({ message: "Task not found" });
  res.send(task);
});

// add new task
app.post("/tasks", async (req, res) => {
  const { data, error, success } = schema.safeParse(req.body);
  if (!success) return res.status(400).send({ message: error.errors });
  const newTask = await prisma.task.create({
    data: data,
  });
  res.status(201).send({ newTask });
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`ToDo app up and running on port ${port}...`)
);

module.exports = app;
