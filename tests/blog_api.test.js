const { test, after, describe, beforeEach } = require("node:test");
const assert = require("assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const Blog = require("../models/blog");
const helper = require("./test_helper");

const api = supertest(app);

beforeEach(async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(helper.blogs);
});

describe("GET /api/blogs", () => {
  test("blogs URL returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("correct amount of blogs are returned", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, helper.blogs.length);
  });

  test("blog posts have id property instead of _id", async () => {
    const response = await api.get("/api/blogs");
    const blogToCheck = response.body[0];

    assert.ok(Object.hasOwn(blogToCheck, "id"));
    assert.ok(!Object.hasOwn(blogToCheck, "_id"));
  });
});

after(async () => {
  await mongoose.connection.close();
});
