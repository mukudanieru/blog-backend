const { test, after, describe, beforeEach } = require("node:test");
const assert = require("assert");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");
const helper = require("./test_helper");

const api = supertest(app);

beforeEach(async () => {
  await User.deleteMany({});

  for (let user of helper.users) {
    const passwordHash = await bcrypt.hash(user.password, 10);

    const newUser = new User({
      username: user.username,
      name: user.name,
      passwordHash,
    });

    await newUser.save();
  }
});

describe("GET /api/users", () => {
  test("succeeds with JSON response", async () => {
    await api
      .get("/api/users")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("succeeds by returning the correct number of users", async () => {
    const response = await api.get("/api/users");

    assert.strictEqual(response.body.length, helper.users.length);
  });

  test("succeeds by using id instead of _id for users", async () => {
    const response = await api.get("/api/users");
    const userToCheck = response.body[0];

    assert.ok(Object.hasOwn(userToCheck, "id"));
    assert.ok(!Object.hasOwn(userToCheck, "_id"));
  });
});

describe("POST /api/users", () => {
  test("succeeds when a valid user is created", async () => {
    const newUser = {
      username: "kyle",
      name: "Kyle Simpson",
      password: "sekret987",
    };

    const response = await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-type", /application\/json/);

    assert.strictEqual(response.body.username, newUser.username);
    assert.ok(response.body.id);
    assert.ok(!response.body.passwordHash);

    const usersResult = await helper.queryUsersFromDb();
    assert.strictEqual(usersResult.length, helper.users.length + 1);

    const savedUser = usersResult.find(
      (user) => user.username === newUser.username,
    );

    assert.strictEqual(savedUser.name, newUser.name);
  });

  test("fails with 400 when username is missing", async () => {
    const newUser = {
      name: "Kyle Simpson",
      password: "sekret987",
    };

    await api.post("/api/users").send(newUser).expect(400);
  });

  test("fails with 400 if username is too short", async () => {
    const newUser = {
      username: "ky",
      name: "Kyle Simpson",
      password: "sekret987",
    };

    await api.post("/api/users").send(newUser).expect(400);
  });

  test("fails with 400 when name is missing", async () => {
    const newUser = {
      username: "kyle",
      password: "sekret987",
    };

    await api.post("/api/users").send(newUser).expect(400);
  });

  test("fails with 400 when password is missing", async () => {
    const newUser = {
      username: "kyle",
      name: "Kyle Simpson",
    };

    await api.post("/api/users").send(newUser).expect(400);
  });

  test("fails with 400 if password is too short", async () => {
    const newUser = {
      username: "kyle",
      name: "Kyle Simpson",
      password: "se",
    };

    await api.post("/api/users").send(newUser).expect(400);
  });

  test("fails with 400 if username already exists", async () => {
    const newUser = { username: "alice", name: "Alice", password: "secret123" };
    await api.post("/api/users").send(newUser).expect(400);
  });
});

after(async () => {
  await mongoose.connection.close();
});
