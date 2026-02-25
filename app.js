const express = require("express");
const mongoose = require("mongoose");
const config = require("./utils/config");
const logger = require("./utils/logger");
const middleware = require("./utils/middleware");
const blogsRouter = require("./controllers/blogs");

const app = express();
logger.info("connecting to", config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, { family: 4 })
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error(`error connecting to MongoDB: ${error}`);
  });

// Global middlewares (run on every request before routing)
app.use(express.json());
app.use(middleware.requestLogger);

// Route handlers
app.use("/api/blogs", blogsRouter);

// Fallback / error-handling middlewares (run if no route matches)
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
