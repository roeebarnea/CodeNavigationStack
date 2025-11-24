import * as vscode from "vscode";
import { TreeNode, TreeRoot, getTreeItemIcon } from "../tree";
import { getTreeRoot } from "../extension";

/**
 * Provides tree data for the navigation tree view in the explorer
 * Displays the hierarchical structure of code navigation
 */
export class NavigationTreeDataProvider
  implements vscode.TreeDataProvider<TreeNode>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeNode | undefined | void
  > = new vscode.EventEmitter<TreeNode | undefined | void>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined | void> =
    this._onDidChangeTreeData.event;

  data: TreeNode[] = [];

  constructor(private rootNode: TreeRoot) {
    this.data = rootNode.node ? [rootNode.node] : [];
  }

  /**
   * Converts a TreeNode to a VS Code TreeItem for display
   * @param element - The tree node to convert
   * @returns The VS Code tree item
   */
  getTreeItem(element: TreeNode): vscode.TreeItem {
    const filePath = element.location.uri.fsPath;
    const isBackSlashContained = filePath.includes("\\");

    const fileName = isBackSlashContained
      ? filePath.split("\\").pop()
      : filePath.split("/").pop();

    const tooltip = `${filePath} ${element.wordRange.start.line + 1}:${
      element.wordRange.start.character + 1
    }`;

    const description = `${fileName} ${element.wordRange.start.line + 1}:${
      element.wordRange.start.character + 1
    }`;

    return {
      label: element.symbol.name,
      collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
      tooltip: tooltip,
      description: description,
      iconPath: getTreeItemIcon(element), // Customize as needed
      contextValue: "treeNode",
      command: {
        command: "extension.openNode",
        title: "Open Node",
        arguments: [{ node: element }],
      }, // Ensure you implement this command in your extension
    };
  }

  /**
   * Gets the children of a tree element
   * @param element - The parent element, or undefined for root
   * @returns Promise resolving to array of child nodes
   */
  getChildren(element?: TreeNode): Thenable<TreeNode[]> {
    if (element === undefined) {
      // Root node
      const treeRoot = getTreeRoot();
      return Promise.resolve(treeRoot.node ? [treeRoot.node] : []);
    } else {
      return Promise.resolve(element.children);
    }
  }

  /**
   * Refreshes the tree view to reflect current navigation state
   */
  refresh(): void {
    const treeRoot = getTreeRoot();
    this.data = treeRoot.node ? [treeRoot.node] : [];
    this._onDidChangeTreeData.fire();
  }
}
