const logger = require("./logger");

const requestLogger = (request, response, next) => {
  logger.info("Method:", request.method);
  logger.info("Path:  ", request.path);
  logger.info("Body:  ", request.body);
  logger.info("---");
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

const errorHandler = (error, request, response, next) => {
  const message = error.message;
  console.error(message);

  if (error.name === "CastError") {
    return response.status(400).json({
      error: "INVALID_ID",
      message: "malformatted id",
    });
  }

  if (error.name === "ValidationError") {
    return response.status(400).json({
      error: "VALIDATION_ERROR",
      message,
    });
  }

  next(error);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
