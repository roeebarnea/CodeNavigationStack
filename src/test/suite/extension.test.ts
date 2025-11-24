import * as assert from "assert";
import * as vscode from "vscode";
import * as extension from "../../extension";
import { areSymbolsIdentical, areObjectsIdentical } from "../../helpers";
import {
  findNodeBySymbol,
  findIfSymbolIsChildOfCurrentNode,
  findIfSymbolIsAncestorOfCurrentNode,
} from "../../tree";
import { EMPTY_WORD, ALLOWED_COLORS } from "../../constants";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage(
    "Running Code Navigation Stack tests..."
  );

  suite("Extension Activation", () => {
    test("Extension should be present", () => {
      assert.ok(
        vscode.extensions.getExtension("RoeeBarnea.code-navigation-stack")
      );
    });

    test("Extension should activate", async () => {
      const ext = vscode.extensions.getExtension(
        "RoeeBarnea.code-navigation-stack"
      );
      await ext?.activate();
      assert.ok(ext?.isActive);
    });
  });

  suite("Helper Functions", () => {
    test("areSymbolsIdentical should compare symbols correctly", () => {
      const uri = vscode.Uri.file("/test/file.ts");
      const range = new vscode.Range(0, 0, 0, 10);

      const symbol1: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "testFunction",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );
      symbol1.location = new vscode.Location(uri, range);

      const symbol2: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "testFunction",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );
      symbol2.location = new vscode.Location(uri, range);

      const symbol3: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "differentFunction",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );
      symbol3.location = new vscode.Location(uri, range);

      assert.strictEqual(areSymbolsIdentical(symbol1, symbol2), true);
      assert.strictEqual(areSymbolsIdentical(symbol1, symbol3), false);
    });

    test("areObjectsIdentical should perform deep comparison", () => {
      const obj1 = { a: 1, b: { c: 2 } };
      const obj2 = { a: 1, b: { c: 2 } };
      const obj3 = { a: 1, b: { c: 3 } };

      assert.strictEqual(areObjectsIdentical(obj1, obj2), true);
      assert.strictEqual(areObjectsIdentical(obj1, obj3), false);
    });

    test("areObjectsIdentical should handle primitive types", () => {
      assert.strictEqual(areObjectsIdentical({ a: 1 }, { a: 1 }), true);
      assert.strictEqual(
        areObjectsIdentical({ a: "test" }, { a: "test" }),
        true
      );
      assert.strictEqual(areObjectsIdentical({ a: true }, { a: true }), true);
    });
  });

  suite("Constants", () => {
    test("EMPTY_WORD should be defined", () => {
      assert.strictEqual(EMPTY_WORD, "EMPTY_WORD");
    });

    test("ALLOWED_COLORS should have correct colors", () => {
      assert.ok(Array.isArray(ALLOWED_COLORS));
      assert.strictEqual(ALLOWED_COLORS.length, 7);
      assert.ok(ALLOWED_COLORS.every((color) => color.startsWith("#")));
    });
  });

  suite("Stack Management", () => {
    test("getStack should return an array", () => {
      const stack = extension.getStack();
      assert.ok(Array.isArray(stack));
    });

    test("getNewStack should return an array", () => {
      const newStack = extension.getNewStack();
      assert.ok(Array.isArray(newStack));
    });

    test("getNewStackCopy should return stack without node references", () => {
      const stackCopy = extension.getNewStackCopy();
      assert.ok(Array.isArray(stackCopy));
      stackCopy.forEach((element) => {
        assert.strictEqual(element.node, undefined);
      });
    });

    test("getTreeRoot should return TreeRoot structure", () => {
      const treeRoot = extension.getTreeRoot();
      assert.ok(treeRoot !== null && typeof treeRoot === "object");
      assert.ok("node" in treeRoot);
      assert.ok("currentNode" in treeRoot);
    });

    test("getColorMap should return an object", () => {
      const colorMap = extension.getColorMap();
      assert.ok(typeof colorMap === "object");
    });
  });

  suite("Debug Mode", () => {
    test("isDebugMode should return a boolean", () => {
      const isDebug = extension.isDebugMode();
      assert.strictEqual(typeof isDebug, "boolean");
    });

    test("setShouldIgnoreUpdate should not throw", () => {
      assert.doesNotThrow(() => {
        extension.setShouldIgnoreUpdate(true);
        extension.setShouldIgnoreUpdate(false);
      });
    });
  });

  suite("Tree Operations", () => {
    test("findNodeBySymbol should find matching node", () => {
      const uri = vscode.Uri.file("/test/file.ts");
      const range = new vscode.Range(0, 0, 0, 10);

      const symbol: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "testFunction",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );
      symbol.location = new vscode.Location(uri, range);

      const node = {
        symbol: symbol,
        word: "test",
        wordRange: range,
        location: new vscode.Location(uri, range),
        color: "#c586c0",
        current: false,
        children: [],
        parent: undefined,
      };

      const result = findNodeBySymbol(node, symbol);
      assert.ok(result !== undefined);
      assert.strictEqual(result.word, "test");
    });

    test("findIfSymbolIsChildOfCurrentNode should return undefined for empty tree", () => {
      const uri = vscode.Uri.file("/test/file.ts");
      const range = new vscode.Range(0, 0, 0, 10);

      const symbol: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "testFunction",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );

      const treeRoot = { node: undefined, currentNode: undefined };
      const result = findIfSymbolIsChildOfCurrentNode(treeRoot, symbol);
      assert.strictEqual(result, undefined);
    });

    test("findIfSymbolIsAncestorOfCurrentNode should return undefined for empty tree", () => {
      const uri = vscode.Uri.file("/test/file.ts");
      const range = new vscode.Range(0, 0, 0, 10);

      const symbol: vscode.DocumentSymbol = new vscode.DocumentSymbol(
        "testFunction",
        "",
        vscode.SymbolKind.Function,
        range,
        range
      );

      const treeRoot = { node: undefined, currentNode: undefined };
      const result = findIfSymbolIsAncestorOfCurrentNode(treeRoot, symbol);
      assert.strictEqual(result, undefined);
    });
  });

  suite("Provider Refresh", () => {
    test("refreshProviders should not throw when providers are initialized", () => {
      assert.doesNotThrow(() => {
        extension.refreshProviders();
      });
    });
  });
});
