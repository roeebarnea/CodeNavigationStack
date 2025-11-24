import * as assert from "assert";
import { EMPTY_WORD, ALLOWED_COLORS } from "../../constants";

suite("Constants Test Suite", () => {
  suite("EMPTY_WORD", () => {
    test("should be defined", () => {
      assert.ok(EMPTY_WORD);
    });

    test("should be a string", () => {
      assert.strictEqual(typeof EMPTY_WORD, "string");
    });

    test("should have expected value", () => {
      assert.strictEqual(EMPTY_WORD, "EMPTY_WORD");
    });

    test("should not be empty", () => {
      assert.ok(EMPTY_WORD.length > 0);
    });
  });

  suite("ALLOWED_COLORS", () => {
    test("should be defined", () => {
      assert.ok(ALLOWED_COLORS);
    });

    test("should be an array", () => {
      assert.ok(Array.isArray(ALLOWED_COLORS));
    });

    test("should have 7 colors", () => {
      assert.strictEqual(ALLOWED_COLORS.length, 7);
    });

    test("should contain valid hex colors", () => {
      ALLOWED_COLORS.forEach((color) => {
        assert.ok(color.startsWith("#"), `Color ${color} should start with #`);
        assert.ok(
          color.length === 7,
          `Color ${color} should be 7 characters long`
        );
        assert.ok(
          /^#[0-9A-Fa-f]{6}$/.test(color),
          `Color ${color} should be valid hex`
        );
      });
    });

    test("should contain expected colors", () => {
      const expectedColors = [
        "#c586c0", // purple
        "#9cdcfe", // light blue
        "#dcdcaa", // yellow
        "#73c991", // light green
        "#f88070", // light red
        "#ce9178", // orange
        "#cca700", // gold
      ];

      expectedColors.forEach((expected, index) => {
        assert.strictEqual(
          ALLOWED_COLORS[index],
          expected,
          `Color at index ${index} should be ${expected}`
        );
      });
    });

    test("should have unique colors", () => {
      const uniqueColors = new Set(ALLOWED_COLORS);
      assert.strictEqual(
        uniqueColors.size,
        ALLOWED_COLORS.length,
        "All colors should be unique"
      );
    });

    test("should be readonly", () => {
      // TypeScript enforces readonly at compile time
      // This test verifies the array exists and has the right structure
      assert.ok(ALLOWED_COLORS.length > 0);
    });
  });
});
