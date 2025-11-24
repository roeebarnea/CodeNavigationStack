import * as vscode from "vscode";
import { StackElement } from "../dataTypes";
import { getStack } from "../extension";

/**
 * Provides tree data for displaying the navigation stack as a tree view
 * (Note: Currently not used in the extension but kept for potential future use)
 */
export class StackTreeDataProvider
  implements vscode.TreeDataProvider<StackElementItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    StackElementItem | undefined | void
  > = new vscode.EventEmitter<StackElementItem | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<
    StackElementItem | undefined | void
  > = this._onDidChangeTreeData.event;

  constructor(private stack: Array<StackElement>) {}

  /**
   * Refreshes the tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Gets the tree item representation of an element
   * @param element - The stack element item
   * @returns The tree item
   */
  getTreeItem(element: StackElementItem): vscode.TreeItem {
    return element;
  }

  /**
   * Gets the children elements
   * @param element - The parent element
   * @returns Promise resolving to child elements
   */
  getChildren(element?: StackElementItem): Thenable<StackElementItem[]> {
    this.stack = getStack();

    if (element) {
      // If there is an element, it means we are looking for children of a hierarchical structure (not used in this example)
      return Promise.resolve([]);
    } else {
      // Convert stack elements to StackElementItem for visualization
      return Promise.resolve(
        getStack().map(
          (stackElement, index) => new StackElementItem(stackElement, index)
        )
      );
    }
  }
}

/**
 * Represents a single stack element as a tree item
 */
class StackElementItem extends vscode.TreeItem {
  constructor(public readonly stackElement: StackElement, index: number) {
    super(`${stackElement.symbol.name}`, vscode.TreeItemCollapsibleState.None);

    const filePath = stackElement.location.uri.fsPath;
    const isBackSlashContained = filePath.includes("\\");

    const fileName = isBackSlashContained
      ? filePath.split("\\").pop()
      : filePath.split("/").pop();

    this.tooltip = `${filePath} ${stackElement.wordRange.start.line + 1}:${
      stackElement.wordRange.start.character + 1
    }`;

    if (stackElement.isCurrent) {
      this.iconPath = new vscode.ThemeIcon("arrow-right");
    } else {
      if (stackElement.symbol.kind === vscode.SymbolKind.Property) {
        this.iconPath = new vscode.ThemeIcon("wrench");
      } else {
        this.iconPath = new vscode.ThemeIcon("symbol-function");
      }
    }
    this.command = {
      command: "extension.myCommand",
      title: "My Command",
      arguments: [index.toString()],
    };

    this.description = `${fileName} ${stackElement.wordRange.start.line + 1}:${
      stackElement.wordRange.start.character + 1
    }`;
  }
}
