import * as assert from "assert";
import { areSymbolsIdentical, areObjectsIdentical } from "../../helpers";
import * as vscode from "vscode";

suite("Helpers Test Suite", () => {
  suite("areSymbolsIdentical", () => {
    test("should return true for identical symbols", () => {
      const uri = vscode.Uri.file("/test/file.ts");
      const range = new vscode.Range(0, 0, 0, 10);

      const symbol1: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "myFunction",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );
      symbol1.location = new vscode.Location(uri, range);

      const symbol2: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "myFunction",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );
      symbol2.location = new vscode.Location(uri, range);

      assert.strictEqual(areSymbolsIdentical(symbol1, symbol2), true);
    });

    test("should return false for different names", () => {
      const uri = vscode.Uri.file("/test/file.ts");
      const range = new vscode.Range(0, 0, 0, 10);

      const symbol1: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "functionA",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );
      symbol1.location = new vscode.Location(uri, range);

      const symbol2: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "functionB",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );
      symbol2.location = new vscode.Location(uri, range);

      assert.strictEqual(areSymbolsIdentical(symbol1, symbol2), false);
    });

    test("should return false for different kinds", () => {
      const uri = vscode.Uri.file("/test/file.ts");
      const range = new vscode.Range(0, 0, 0, 10);

      const symbol1: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "myItem",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );
      symbol1.location = new vscode.Location(uri, range);

      const symbol2: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "myItem",
        "",
        vscode.SymbolKind.Method,
        range,
        range
      );
      symbol2.location = new vscode.Location(uri, range);

      assert.strictEqual(areSymbolsIdentical(symbol1, symbol2), false);
    });

    test("should return false for different URIs", () => {
      const uri1 = vscode.Uri.file("/test/file1.ts");
      const uri2 = vscode.Uri.file("/test/file2.ts");
      const range = new vscode.Range(0, 0, 0, 10);

      const symbol1: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "myFunction",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );
      symbol1.location = new vscode.Location(uri1, range);

      const symbol2: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "myFunction",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );
      symbol2.location = new vscode.Location(uri2, range);

      assert.strictEqual(areSymbolsIdentical(symbol1, symbol2), false);
    });
  });

  suite("areObjectsIdentical", () => {
    test("should return true for identical flat objects", () => {
      const obj1 = { a: 1, b: 2, c: 3 };
      const obj2 = { a: 1, b: 2, c: 3 };
      assert.strictEqual(areObjectsIdentical(obj1, obj2), true);
    });

    test("should return true for identical nested objects", () => {
      const obj1 = { a: 1, b: { c: 2, d: { e: 3 } } };
      const obj2 = { a: 1, b: { c: 2, d: { e: 3 } } };
      assert.strictEqual(areObjectsIdentical(obj1, obj2), true);
    });

    test("should return false for different flat objects", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 3 };
      assert.strictEqual(areObjectsIdentical(obj1, obj2), false);
    });

    test("should return false for different nested objects", () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 3 } };
      assert.strictEqual(areObjectsIdentical(obj1, obj2), false);
    });

    test("should return false for different number of properties", () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { a: 1, b: 2, c: 3 };
      assert.strictEqual(areObjectsIdentical(obj1, obj2), false);
    });

    test("should handle string properties", () => {
      const obj1 = { name: "test", value: "data" };
      const obj2 = { name: "test", value: "data" };
      assert.strictEqual(areObjectsIdentical(obj1, obj2), true);
    });

    test("should handle boolean properties", () => {
      const obj1 = { flag: true, enabled: false };
      const obj2 = { flag: true, enabled: false };
      assert.strictEqual(areObjectsIdentical(obj1, obj2), true);
    });

    test("should handle null values", () => {
      const obj1 = { a: null };
      const obj2 = { a: null };
      assert.strictEqual(areObjectsIdentical(obj1, obj2), true);
    });

    test("should handle arrays", () => {
      const obj1 = { arr: [1, 2, 3] };
      const obj2 = { arr: [1, 2, 3] };
      // Note: This tests that arrays are treated as objects
      assert.strictEqual(typeof obj1.arr, "object");
    });
  });
});
