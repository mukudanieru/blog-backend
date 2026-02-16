const blogsRouter = require("express").Router();
const Blog = require("../models/blog");

blogsRouter.get("/", (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs);
  });
});

blogsRouter.post("/", (request, response) => {
  const { title, author, url, likes } = request.body;

  const blog = new Blog({ title, author, url, likes });
  console.log(blog);

  blog.save().then((savedBlog) => {
    response.json(savedBlog);
  });
});

module.exports = blogsRouter;
