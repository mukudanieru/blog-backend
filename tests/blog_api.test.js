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
  test("succeeds with JSON response", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("succeeds by returning the correct number of blogs", async () => {
    const response = await api.get("/api/blogs");

    assert.strictEqual(response.body.length, helper.blogs.length);
  });

  test("succeeds by using id instead of _id for blog entries", async () => {
    const response = await api.get("/api/blogs");
    const blogToCheck = response.body[0];

    assert.ok(Object.hasOwn(blogToCheck, "id"));
    assert.ok(!Object.hasOwn(blogToCheck, "_id"));
  });
});

describe("POST /api/blogs", () => {
  test("succeeds when a valid blog post is added", async () => {
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

  test("succeeds by defaulting likes to 0 when missing", async () => {
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

  test("fails with 400 when title is missing", async () => {
    const newBlog = {
      author: "Kyle Simpson",
      url: "https://github.com/getify/You-Dont-Know-JS",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });

  test("fails with 400 when url is missing", async () => {
    const newBlog = {
      title: "Understanding Asynchronous JavaScript",
      author: "Kyle Simpson",
    };

    await api.post("/api/blogs").send(newBlog).expect(400);
  });
});

describe("DELETE /api/blogs/:id", () => {
  test("succeeds by deleting a blog post", async () => {
    const blogsAtStart = await helper.queryBlogsFromDb();
    const blogToBeDeleted = blogsAtStart[0];

    console.log(blogsAtStart);

    await api.delete(`/api/blogs/${blogToBeDeleted.id}`).expect(204);

    const blogsResult = await helper.queryBlogsFromDb();

    const ids = blogsResult.map((blog) => blog.id);
    assert.ok(!ids.includes(blogToBeDeleted.id));

    assert.strictEqual(blogsResult.length, helper.blogs.length - 1);
  });

  test("fails with 404 if blog does not exist", async () => {
    const nonExistingId = new mongoose.Types.ObjectId();

    await api
      .delete(`/api/notes/${nonExistingId}`)
      .expect(404)
      .expect("Content-Type", /application\/json/);
  });
});

after(async () => {
  await mongoose.connection.close();
});
