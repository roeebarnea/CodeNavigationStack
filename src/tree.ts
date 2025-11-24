import * as vscode from "vscode";
import { areSymbolsIdentical } from "./helpers";

/**
 * Represents the root of the navigation tree
 */
export type TreeRoot = {
  node: TreeNode | undefined;
  currentNode: TreeNode | undefined;
};

/**
 * Represents a node in the navigation tree
 */
export type TreeNode = {
  symbol: vscode.DocumentSymbol;
  word: string;
  wordRange: vscode.Range;
  location: vscode.Location;
  color: string;
  current: boolean;
  children: TreeNode[];
  parent: TreeNode | undefined;
};

/**
 * Recursively finds a node in the tree by matching symbol
 * @param node - The node to start searching from
 * @param symbol - The symbol to search for
 * @returns The matching node or undefined if not found
 */
export function findNodeBySymbol(
  node: TreeNode,
  symbol: vscode.DocumentSymbol
): TreeNode | undefined {
  if (areSymbolsIdentical(node.symbol, symbol)) {
    return node;
  }

  for (const child of node.children) {
    const found = findNodeBySymbol(child, symbol);
    if (found) {
      return found;
    }
  }
  return undefined;
}

/**
 * Checks if the given symbol matches any direct child of the current node
 * @param root - The tree root
 * @param symbol - The symbol to search for
 * @returns The matching child node or undefined if not found
 */
export function findIfSymbolIsChildOfCurrentNode(
  root: TreeRoot,
  symbol: vscode.DocumentSymbol
): TreeNode | undefined {
  if (!root.node) {
    return undefined;
  }

  const currentNode = root.currentNode;
  if (!currentNode) {
    return undefined;
  }

  const children = currentNode.children;
  for (const child of children) {
    if (areSymbolsIdentical(child.symbol, symbol)) {
      return child;
    }
  }

  return undefined;
}

/**
 * Checks if the given symbol matches any ancestor of the current node (including the current node)
 * @param root - The tree root
 * @param symbol - The symbol to search for
 * @returns The matching ancestor node or undefined if not found
 */
export function findIfSymbolIsAncestorOfCurrentNode(
  root: TreeRoot,
  symbol: vscode.DocumentSymbol
): TreeNode | undefined {
  if (!root.node) {
    return undefined;
  }

  let currentNode = root.currentNode;
  if (!currentNode) {
    return undefined;
  }

  do {
    if (areSymbolsIdentical(currentNode.symbol, symbol)) {
      return currentNode;
    }
    currentNode = currentNode.parent;
  } while (currentNode !== undefined);

  return undefined;
}

/**
 * Returns the appropriate icon for a tree node based on its state and symbol kind
 * @param node - The tree node
 * @returns The VS Code theme icon to display
 */
export function getTreeItemIcon(node: TreeNode): vscode.ThemeIcon {
  if (node.current) {
    return new vscode.ThemeIcon("arrow-right");
  }

  if (node.symbol.kind === vscode.SymbolKind.Property) {
    return new vscode.ThemeIcon("wrench");
  } else {
    return new vscode.ThemeIcon("symbol-function");
  }
}
