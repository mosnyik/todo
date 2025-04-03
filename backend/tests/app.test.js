import request from "supertest";
import { it, expect, describe, beforeAll, afterAll } from "vitest";
import prisma from "../prisma-client";
import app from "../index";

// describe("POST /tasks", () => {
//   beforeAll(async () => {
//     // connect to db before test
//     await prisma.$connect();
//   });

//   afterAll(async () => {
//     // disconnec after test
//     await prisma.$disconnect();
//   });
//   it("should add a task", async () => {
//     const response = await request(app)
//       .post("/tasks")
//       .send({
//         title: "Test Task",
//         description: "This is a test task",
//         dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
//       })
//       .expect(201);

//     expect(response.body.newTask).toBeDefined();
//     expect(response.body.newTask.title).toBe("Test Task");
//     expect(response.body.newTask.description).toBe("This is a test task");
//   });

//   it("should return 400 for invalid data", async () => {
//     const response = await request(app)
//       .post("/tasks")
//       .send({
//         title: "",
//         description: "This is another test task",
//       })
//       .expect(400);

//     // Ensure error message exists
//     expect(response.body.message).toBeDefined();
//     expect(response.body.message[0].path).toContain("title");
//   });
// });

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
    const response = await request(app).get("/tasks");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should return a task if given a valid id", async () => {
    const response = await request(app).get(`/tasks/${testTask.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
    expect(response.body).toHaveProperty("title");
  });

  it("should return 404 if task does not exist", async () => {
    const response = await request(app).get(`/tasks/999999`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Task not found");
  });
});
