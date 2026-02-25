const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});

  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const { title, author, url, likes } = request.body;

  if (!title) {
    return response.status(400).json({
      error: "MISSING_REQUIRED_FIELDS",
      message: "title is required",
    });
  }

  if (!url) {
    return response.status(400).json({
      error: "MISSING_REQUIRED_FIELDS",
      message: "url is required",
    });
  }

  const blog = new Blog({ title, author, url, likes });
  const savedBlog = await blog.save();

  response.status(201).json(savedBlog);
});

module.exports = blogsRouter;
