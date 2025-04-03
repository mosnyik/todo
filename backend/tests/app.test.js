import request from "supertest";
import { it, expect, describe, beforeAll, afterAll } from "vitest";
import prisma from "../prisma-client";
import app from "../app";
describe("POST /tasks", () => {
  beforeAll(async () => {
    // connect to db before test
    await prisma.$connect();
  });

  afterAll(async () => {
    // disconnec after test
    await prisma.$disconnect();
  });
  it("should add a task", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Test Task",
        description: "This is a test task",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .expect(201);

    expect(response.body.newTask).toBeDefined();
    expect(response.body.newTask.title).toBe("Test Task");
    expect(response.body.newTask.description).toBe("This is a test task");
  });

  it("should return 400 for invalid data", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "",
        description: "This is another test task",
      })
      .expect(400);

    // Ensure error message exists
    expect(response.body.message).toBeDefined();
    expect(response.body.message[0].path).toContain("title");
  });
});

describe("GET /tasks", () => {
  let testTask;
  beforeAll(async () => {
    testTask = await prisma.task.create({
      data: {
        title: "Test Task",
        description: "This is a test task",
        dueDate: new Date(),
      },
    });
  });
  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.$disconnect();
  });
  it("should return all tasks", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should return a task if given a valid id", async () => {
    const response = await request(app).get(`/api/tasks/${testTask.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty("title");
  });

  it("should return 404 if task does not exist", async () => {
    const response = await request(app).get(`/api/tasks/999999`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Task not found");
  });
});

describe("PATCH /task/:id", () => {
  let testTask;
  beforeAll(async () => {
    testTask = await prisma.task.create({
      data: {
        title: "Test Task",
        description: "This is a test task",
        dueDate: new Date(),
      },
    });
  });
  afterAll(async () => {
    await prisma.task.deleteMany();
    await prisma.$disconnect();
  });

  it("should update all properties of an existing task", async () => {
    const updatedData = {
      title: "Updated Task",
      description: "Updated task description",
      dueDate: new Date().toISOString(),
      priority: "HIGH",
      status: "COMPLETED",
    };

    const response = await request(app)
      .patch(`/api/tasks/${testTask.id}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body.title).toBe(updatedData.title);
    expect(response.body.description).toBe(updatedData.description);
    expect(response.body.priority).toBe(updatedData.priority);
    expect(response.body.status).toBe(updatedData.status);
  });

  it("should update only the status of an existing task", async () => {
    const updatedStatus = {
      status: "PENDING",
    };

    const response = await request(app)
      .patch(`/api/tasks/${testTask.id}`)
      .send(updatedStatus);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(updatedStatus.status);

    // Ensure other fields remain unchanged
    const updatedTask = await prisma.task.findUnique({
      where: { id: testTask.id },
    });

    expect(updatedTask.title).toBe("Updated Task"); // From previous test
    expect(updatedTask.description).toBe("Updated task description");
    expect(updatedTask.priority).toBe("HIGH");
  });

  it("should return 400 if data is invalid", async () => {
    const invalidData = {
      title: "",
      description: "Short",
      priority: "INVALID_PRIORITY",
    };

    const response = await request(app)
      .patch(`/api/tasks/${testTask.id}`)
      .send(invalidData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("should return 404 if task is not found", async () => {
    const response = await request(app).patch("/api/tasks/99999").send({
      title: "Non-existent Task",
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/i);
    //  .toBe("Task not found");
  });
});

describe("DELETE /tasks/:id", () => {
  let testTask;

  // Create a test task before running the tests
  beforeAll(async () => {
    testTask = await prisma.task.create({
      data: {
        title: "Test Task",
        description: "This is a test task",
        dueDate: new Date(),
      },
    });
  });

  // Cleanup after tests
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should delete a task and return 204 No Content", async () => {
    const response = await request(app).delete(`/api/tasks/${testTask.id}`);

    expect(response.status).toBe(204);

    // Ensure task is deleted from database
    const deletedTask = await prisma.task.findUnique({
      where: { id: testTask.id },
    });
    expect(deletedTask).toBeNull();
  });

  it("should return 404 if task does not exist", async () => {
    const nonExistentTaskId = 9999; // A random ID that doesn't exist

    const response = await request(app).delete(`/api/tasks/${nonExistentTaskId}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Task not found" });
  });
});
