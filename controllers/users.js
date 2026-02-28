const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.post("/", async (request, response, next) => {
  const { username, name, password } = request.body;

  if (!username) {
    return response.status(400).json({
      error: "MISSING_REQUIRED_FIELDS",
      message: "username is required",
    });
  }

  if (username.length < 3) {
    return response.status(400).json({
      error: "INVALID_FIELD_LENGTH",
      message: "username must be at least 3 characters long",
    });
  }

  if (!name) {
    return response.status(400).json({
      error: "MISSING_REQUIRED_FIELDS",
      message: "name is required",
    });
  }

  if (!password) {
    return response.status(400).json({
      error: "MISSING_REQUIRED_FIELDS",
      message: "password is required",
    });
  }

  if (password.length < 3) {
    return response.status(400).json({
      error: "INVALID_FIELD_LENGTH",
      message: "password must be at least 3 characters long",
    });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  try {
    const newUser = await user.save();

    response.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/", async (request, response) => {
  const users = await User.find({});

  response.json(users);
});

module.exports = usersRouter;
