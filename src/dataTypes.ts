import * as vscode from "vscode";
import { TreeNode } from "./tree";

/**
 * Represents an element in the code navigation stack
 * Contains information about a specific point in the navigation history
 */
export type StackElement = {
  /** The document symbol at this stack position */
  symbol: vscode.DocumentSymbol;
  /** The word/identifier at the cursor position */
  word: string;
  /** The range of the word in the document */
  wordRange: vscode.Range;
  /** The location in the editor */
  location: vscode.Location;
  /** Whether this is the current position in the stack */
  isCurrent: boolean;
  /** The color assigned to this element's file for visual distinction */
  color: string;
  /** Reference to the corresponding tree node */
  node: TreeNode;
};
