const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });

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
  const { title, author, url, likes, userId } = request.body;

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

  const user = await User.findById(userId);

  if (!user) {
    return response.status(400).json({
      error: "MISSING_REQUIRED_FIELDS",
      message: "userId missing or not valid",
    });
  }

  const blog = new Blog({ title, author, url, likes, user: user._id });
  const savedBlog = await blog.save();

  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();

  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response, next) => {
  const id = request.params.id;

  try {
    const blogToDelete = await Blog.findByIdAndDelete(id);

    if (!blogToDelete) {
      return response.status(404).json({
        error: "NOT_FOUND",
        message: "blog post not found",
      });
    }

    return response.status(204).json(blogToDelete);
  } catch (error) {
    next(error);
  }
});

blogsRouter.put("/:id", async (request, response, next) => {
  const { title, author, url } = request.body;

  if (!title) {
    return response.status(400).json({
      error: "MISSING_REQUIRED_FIELDS",
      message: "title is required",
    });
  }

  if (!author) {
    return response.status(400).json({
      error: "MISSING_REQUIRED_FIELDS",
      message: "author is required",
    });
  }

  if (!url) {
    return response.status(400).json({
      error: "MISSING_REQUIRED_FIELDS",
      message: "url is required",
    });
  }

  const id = request.params.id;

  try {
    const blogToUpdate = await Blog.findById(id);

    if (!blogToUpdate) {
      return response.status(404).json({
        error: "NOT_FOUND",
        message: "blog post not found",
      });
    }

    blogToUpdate.title = title;
    blogToUpdate.author = author;
    blogToUpdate.url = url;

    try {
      const updatedBlog = await blogToUpdate.save();

      response.json(updatedBlog);
    } catch (error) {
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = blogsRouter;
