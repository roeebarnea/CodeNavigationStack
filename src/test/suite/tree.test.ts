import * as assert from "assert";
import * as vscode from "vscode";
import {
  findNodeBySymbol,
  findIfSymbolIsChildOfCurrentNode,
  findIfSymbolIsAncestorOfCurrentNode,
  getTreeItemIcon,
  TreeNode,
  TreeRoot,
} from "../../tree";

suite("Tree Test Suite", () => {
  function createTestSymbol(
    name: string,
    kind: vscode.SymbolKind = vscode.SymbolKind.Function
  ): vscode.DocumentSymbol {
    const uri = vscode.Uri.file("/test/file.ts");
    const range = new vscode.Range(0, 0, 0, 10);
    const symbol = new vscode.DocumentSymbol(name, "", kind, range, range);
    symbol.location = new vscode.Location(uri, range);
    return symbol;
  }

  function createTestNode(name: string, parent?: TreeNode): TreeNode {
    const uri = vscode.Uri.file("/test/file.ts");
    const range = new vscode.Range(0, 0, 0, 10);
    return {
      symbol: createTestSymbol(name),
      word: name,
      wordRange: range,
      location: new vscode.Location(uri, range),
      color: "#c586c0",
      current: false,
      children: [],
      parent: parent,
    };
  }

  suite("findNodeBySymbol", () => {
    test("should find node with matching symbol at root", () => {
      const symbol = createTestSymbol("rootFunction");
      const node = createTestNode("rootFunction");

      const result = findNodeBySymbol(node, symbol);
      assert.ok(result !== undefined);
      assert.strictEqual(result.word, "rootFunction");
    });

    test("should find node with matching symbol in children", () => {
      const symbol = createTestSymbol("childFunction");
      const rootNode = createTestNode("rootFunction");
      const childNode = createTestNode("childFunction", rootNode);
      rootNode.children.push(childNode);

      const result = findNodeBySymbol(rootNode, symbol);
      assert.ok(result !== undefined);
      assert.strictEqual(result.word, "childFunction");
    });

    test("should return undefined for non-existent symbol", () => {
      const symbol = createTestSymbol("nonExistent");
      const node = createTestNode("rootFunction");

      const result = findNodeBySymbol(node, symbol);
      assert.strictEqual(result, undefined);
    });

    test("should find deeply nested nodes", () => {
      const symbol = createTestSymbol("deepFunction");
      const rootNode = createTestNode("root");
      const level1 = createTestNode("level1", rootNode);
      const level2 = createTestNode("level2", level1);
      const level3 = createTestNode("deepFunction", level2);

      rootNode.children.push(level1);
      level1.children.push(level2);
      level2.children.push(level3);

      const result = findNodeBySymbol(rootNode, symbol);
      assert.ok(result !== undefined);
      assert.strictEqual(result.word, "deepFunction");
    });
  });

  suite("findIfSymbolIsChildOfCurrentNode", () => {
    test("should return undefined when tree is empty", () => {
      const symbol = createTestSymbol("test");
      const treeRoot: TreeRoot = { node: undefined, currentNode: undefined };

      const result = findIfSymbolIsChildOfCurrentNode(treeRoot, symbol);
      assert.strictEqual(result, undefined);
    });

    test("should return undefined when currentNode is undefined", () => {
      const symbol = createTestSymbol("test");
      const node = createTestNode("root");
      const treeRoot: TreeRoot = { node: node, currentNode: undefined };

      const result = findIfSymbolIsChildOfCurrentNode(treeRoot, symbol);
      assert.strictEqual(result, undefined);
    });

    test("should find direct child", () => {
      const symbol = createTestSymbol("childFunction");
      const rootNode = createTestNode("root");
      const childNode = createTestNode("childFunction", rootNode);
      rootNode.children.push(childNode);

      const treeRoot: TreeRoot = { node: rootNode, currentNode: rootNode };

      const result = findIfSymbolIsChildOfCurrentNode(treeRoot, symbol);
      assert.ok(result !== undefined);
      assert.strictEqual(result.word, "childFunction");
    });

    test("should return undefined for grandchildren", () => {
      const symbol = createTestSymbol("grandchild");
      const rootNode = createTestNode("root");
      const childNode = createTestNode("child", rootNode);
      const grandchildNode = createTestNode("grandchild", childNode);

      rootNode.children.push(childNode);
      childNode.children.push(grandchildNode);

      const treeRoot: TreeRoot = { node: rootNode, currentNode: rootNode };

      const result = findIfSymbolIsChildOfCurrentNode(treeRoot, symbol);
      assert.strictEqual(result, undefined);
    });

    test("should not find sibling nodes", () => {
      const symbol = createTestSymbol("sibling2");
      const rootNode = createTestNode("root");
      const sibling1 = createTestNode("sibling1", rootNode);
      const sibling2 = createTestNode("sibling2", rootNode);

      rootNode.children.push(sibling1, sibling2);

      const treeRoot: TreeRoot = { node: rootNode, currentNode: sibling1 };

      const result = findIfSymbolIsChildOfCurrentNode(treeRoot, symbol);
      assert.strictEqual(result, undefined);
    });
  });

  suite("findIfSymbolIsAncestorOfCurrentNode", () => {
    test("should return undefined when tree is empty", () => {
      const symbol = createTestSymbol("test");
      const treeRoot: TreeRoot = { node: undefined, currentNode: undefined };

      const result = findIfSymbolIsAncestorOfCurrentNode(treeRoot, symbol);
      assert.strictEqual(result, undefined);
    });

    test("should return undefined when currentNode is undefined", () => {
      const symbol = createTestSymbol("test");
      const node = createTestNode("root");
      const treeRoot: TreeRoot = { node: node, currentNode: undefined };

      const result = findIfSymbolIsAncestorOfCurrentNode(treeRoot, symbol);
      assert.strictEqual(result, undefined);
    });

    test("should find current node itself", () => {
      const symbol = createTestSymbol("current");
      const node = createTestNode("current");
      const treeRoot: TreeRoot = { node: node, currentNode: node };

      const result = findIfSymbolIsAncestorOfCurrentNode(treeRoot, symbol);
      assert.ok(result !== undefined);
      assert.strictEqual(result.word, "current");
    });

    test("should find parent node", () => {
      const symbol = createTestSymbol("parent");
      const parentNode = createTestNode("parent");
      const childNode = createTestNode("child", parentNode);
      parentNode.children.push(childNode);

      const treeRoot: TreeRoot = { node: parentNode, currentNode: childNode };

      const result = findIfSymbolIsAncestorOfCurrentNode(treeRoot, symbol);
      assert.ok(result !== undefined);
      assert.strictEqual(result.word, "parent");
    });

    test("should find grandparent node", () => {
      const symbol = createTestSymbol("grandparent");
      const grandparentNode = createTestNode("grandparent");
      const parentNode = createTestNode("parent", grandparentNode);
      const childNode = createTestNode("child", parentNode);

      grandparentNode.children.push(parentNode);
      parentNode.children.push(childNode);

      const treeRoot: TreeRoot = {
        node: grandparentNode,
        currentNode: childNode,
      };

      const result = findIfSymbolIsAncestorOfCurrentNode(treeRoot, symbol);
      assert.ok(result !== undefined);
      assert.strictEqual(result.word, "grandparent");
    });

    test("should return undefined for non-ancestor", () => {
      const symbol = createTestSymbol("other");
      const node = createTestNode("current");
      const treeRoot: TreeRoot = { node: node, currentNode: node };

      const result = findIfSymbolIsAncestorOfCurrentNode(treeRoot, symbol);
      assert.strictEqual(result, undefined);
    });
  });

  suite("getTreeItemIcon", () => {
    test("should return arrow-right icon for current node", () => {
      const node = createTestNode("test");
      node.current = true;

      const icon = getTreeItemIcon(node);
      assert.ok(icon instanceof vscode.ThemeIcon);
      assert.strictEqual(icon.id, "arrow-right");
    });

    test("should return wrench icon for property symbols", () => {
      const uri = vscode.Uri.file("/test/file.ts");
      const range = new vscode.Range(0, 0, 0, 10);
      const symbol = createTestSymbol("testProp", vscode.SymbolKind.Property);

      const node = createTestNode("testProp");
      node.symbol = symbol;
      node.current = false;

      const icon = getTreeItemIcon(node);
      assert.ok(icon instanceof vscode.ThemeIcon);
      assert.strictEqual(icon.id, "wrench");
    });

    test("should return symbol-function icon for function symbols", () => {
      const node = createTestNode("testFunc");
      node.current = false;

      const icon = getTreeItemIcon(node);
      assert.ok(icon instanceof vscode.ThemeIcon);
      assert.strictEqual(icon.id, "symbol-function");
    });

    test("should return symbol-function icon for method symbols", () => {
      const symbol = createTestSymbol("testMethod", vscode.SymbolKind.Method);
      const node = createTestNode("testMethod");
      node.symbol = symbol;
      node.current = false;

      const icon = getTreeItemIcon(node);
      assert.ok(icon instanceof vscode.ThemeIcon);
      assert.strictEqual(icon.id, "symbol-function");
    });
  });
});
