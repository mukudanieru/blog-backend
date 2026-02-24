const { test, describe } = require("node:test");
const assert = require("assert");
const totalLikes = require("../utils/list_helper").totalLikes;
const { listWithOneBlog, blogs } = require("./test_helper");

describe("total likes", () => {
  test("when list has only one blog, returns the likes of that blog", () => {
    const result = totalLikes(listWithOneBlog);
    assert.strictEqual(result, 5);
  });

  test("when list has many blogs, returns the sum of likes", () => {
    const result = totalLikes(blogs);
    assert.strictEqual(result, 36);
  });
});
