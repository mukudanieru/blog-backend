const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({});

  response.json(blogs);
});

blogsRouter.get("/:id", async (request, response, next) => {
  const id = request.params.id;

  try {
    const blog = await Blog.findById(id);

    if (!blog) {
      return response.status(404).json({
        error: "NOT_FOUND",
        message: "blog not found",
        id,
      });
    }

    return response.json(blog);
  } catch (error) {
    next(error);
  }
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
