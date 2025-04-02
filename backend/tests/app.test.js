import request from "supertest";
import { it, expect, describe, beforeAll, afterAll } from "vitest";
import prisma from "../prisma-client";
import app from "../index";

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
      const response = await request(app).post('/tasks').send({
          title: "Test Task",
          description: "This is a test task",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),}).expect(201)

          expect(response.body.newTask).toBeDefined();
          expect(response.body.newTask.title).toBe("Test Task")
          expect(response.body.newTask.description).toBe("This is a test task")
    });

  it("should return 400 for invalid data", async () => {
    const response = await request(app)
      .post("/tasks")
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
