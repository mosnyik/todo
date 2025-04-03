const express = require("express");
const asyncMiddleWare = require("../middleware/async");
const prisma = require("../prisma-client");
const { addTaskSchema, editTaskSchema }  = require("../schemas");

const router = express.Router();

router.get(
  "/",
  asyncMiddleWare(async (req, res) => {
    const tasks = await prisma.task.findMany();
    res.send(tasks);
  })
);

// get task by id
router.get(
  "/:id",
  asyncMiddleWare(async (req, res) => {
    const id = req.params.id;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });
    if (!task) return res.status(404).send({ message: "Task not found" });
    res.send(task);
  })
);

// add new task
router.post(
  "/",
  asyncMiddleWare(async (req, res) => {
    const { data, error, success } = addTaskSchema.safeParse(req.body);
    if (!success) return res.status(400).send({ message: error.errors });
    const newTask = await prisma.task.create({
      data: data,
    });
    res.status(201).send({ newTask });
  })
);

// edit task
router.patch(
  "/:id",
  asyncMiddleWare(async (req, res) => {
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
  })
);

// delete task
router.delete(
  "/:id",
  asyncMiddleWare(async (req, res) => {
    const id = req.params.id;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });
    if (!task) return res.status(404).send({ message: "Task not found" });
    const deletedTask = await prisma.task.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(deletedTask);
  })
);

module.exports = router;
