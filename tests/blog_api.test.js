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

describe("POST /api/blogs", () => {
  test("a valid blog post can be added", async () => {
    const newBlog = {
      title: "Understanding Asynchronous JavaScript",
      author: "Kyle Simpson",
      url: "https://github.com/getify/You-Dont-Know-JS",
      likes: 12,
    };

    const response = await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-type", /application\/json/);

    assert.strictEqual(response.body.title, newBlog.title);

    const blogsResult = await helper.queryBlogsFromDb();
    assert.strictEqual(blogsResult.length, helper.blogs.length + 1);

    const savedBlog = blogsResult.find((blog) => blog.title === newBlog.title);
    assert.strictEqual(savedBlog.author, newBlog.author);
    assert.strictEqual(savedBlog.url, newBlog.url);
    assert.strictEqual(savedBlog.likes, newBlog.likes);
  });

  test("defaults likes to 0 when missing from request", async () => {
    const newBlog = {
      title: "Understanding Asynchronous JavaScript",
      author: "Kyle Simpson",
      url: "https://github.com/getify/You-Dont-Know-JS",
    };

    const defaultLikeValue = 0;

    const response = await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .expect("Content-type", /application\/json/);

    assert.ok(Object.hasOwn(response.body, "likes"));
    assert.strictEqual(response.body.likes, defaultLikeValue);
  });

  test("returns 400 if title is missing", async () => {
    const newBlog = {
      author: "Kyle Simpson",
      url: "https://github.com/getify/You-Dont-Know-JS",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });

  test("returns 400 if url is missing", async () => {
    const newBlog = {
      title: "Understanding Asynchronous JavaScript",
      author: "Kyle Simpson",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });
});

after(async () => {
  await mongoose.connection.close();
});
