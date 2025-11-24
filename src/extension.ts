import * as vscode from "vscode";
import { StackProvider } from "./webViews/stackPanel";
import { StackElement } from "./dataTypes";
import { StackVisualizerProvider } from "./webViews/stackVisualizer";
import { StackTreeDataProvider } from "./webViews/StackTreeDataProvider";
import {
  TreeNode,
  TreeRoot,
  findIfSymbolIsAncestorOfCurrentNode,
  findIfSymbolIsChildOfCurrentNode,
  findNodeBySymbol,
} from "./tree";
import { areObjectsIdentical, areSymbolsIdentical } from "./helpers";
import { NavigationTreeDataProvider } from "./webViews/TreeDataProvider";
import { EMPTY_WORD, ALLOWED_COLORS } from "./constants";

// State management
let colorMap: { [key: string]: string } = {};
let lastSymbol: vscode.DocumentSymbol | undefined;
let lastWord: string | undefined;
let stack = new Array<StackElement>();
let newStack: Array<StackElement> = [];
let treeRoot: TreeRoot = {
  node: undefined,
  currentNode: undefined,
};
let shouldIgnoreUpdate = false;
let pathsArray: string[] = [];
let lastLocation: vscode.Location | undefined;

// Providers
let stackVisualizerProvider: StackVisualizerProvider;
let stackPanelProvider: StackProvider;
let stackTreeDataProvider: StackTreeDataProvider;
let navigationTreeProvider: NavigationTreeDataProvider;

// Symbol tracking
let symbolBreadcrumbs: vscode.DocumentSymbol[] = [];

let isDebug: boolean = false;

/**
 * Activates the Code Navigation Stack extension
 * @param context - The extension context provided by VS Code
 */
export async function activate(context: vscode.ExtensionContext) {
  isDebug = context.extensionMode === vscode.ExtensionMode.Development;

  if (isDebug) {
    console.log("Code Navigation Stack extension is now active!");
  }

  try {
    initializeStackPanelProvider(context);
    initializeTreeProvider(context);

    context.subscriptions.push(
      vscode.window.onDidChangeTextEditorSelection(
        onDidChangeTextEditorSelectionListener
      )
    );
  } catch (error) {
    console.error("Failed to activate Code Navigation Stack extension:", error);
    vscode.window.showErrorMessage(
      "Failed to activate Code Navigation Stack extension. Please check the output console for details."
    );
  }
}

/**
 * Controls whether the next navigation update should be ignored
 * Used to prevent circular updates when programmatically changing editor selection
 */
export function setShouldIgnoreUpdate(value: boolean): void {
  shouldIgnoreUpdate = value;
}

/**
 * Returns whether the extension is running in debug mode
 */
export function isDebugMode(): boolean {
  return isDebug;
}

/**
 * Refreshes all provider views to reflect current state
 */
export function refreshProviders(): void {
  if (stackPanelProvider) {
    stackPanelProvider.refresh();
  }
  if (navigationTreeProvider) {
    navigationTreeProvider.refresh();
  }
}

/**
 * Returns the current navigation stack
 */
export function getStack(): Array<StackElement> {
  return stack;
}

/**
 * Returns the new navigation stack
 */
export function getNewStack(): Array<StackElement> {
  return newStack;
}

/**
 * Returns a copy of the new stack with node references removed
 * Used for serialization and display purposes
 */
export function getNewStackCopy(): Array<
  Omit<StackElement, "node"> & { node: undefined }
> {
  return newStack.map((element) => ({
    symbol: element.symbol,
    word: element.word,
    wordRange: element.wordRange,
    location: element.location,
    isCurrent: element.isCurrent,
    color: element.color,
    node: undefined,
  }));
}

/**
 * Returns the root of the navigation tree
 */
export function getTreeRoot(): TreeRoot {
  return treeRoot;
}

/**
 * Returns the color mapping for file paths
 */
export function getColorMap(): { [key: string]: string } {
  return colorMap;
}

/**
 * Initializes the stack panel webview provider
 * @param context - The extension context
 */
function initializeStackPanelProvider(context: vscode.ExtensionContext): void {
  stackPanelProvider = new StackProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      StackProvider.viewType,
      stackPanelProvider
    )
  );

  stackPanelProvider.refresh();

  if (isDebug) {
    console.log("StackProvider is activated");
  }
}

function initializeStackTreeDataProvider(context: vscode.ExtensionContext) {
  // Tree Provider
  stackTreeDataProvider = new StackTreeDataProvider(stack);
  vscode.window.registerTreeDataProvider(
    "stackVisualizerTreeView",
    stackTreeDataProvider
  );

  // You can also expose a method to refresh the tree view if the stack changes
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.refreshStack", () =>
      stackTreeDataProvider.refresh()
    )
  );

  const command = vscode.commands.registerCommand(
    "extension.myCommand",
    (args) => {
      const stack = getStack();

      const stackElement = stack[Number(args)];

      if (stackElement) {
        vscode.window.showTextDocument(stackElement.location.uri, {
          selection: new vscode.Range(
            stackElement.wordRange.start,
            stackElement.wordRange.end
          ),
        });
      }
      return;
    }
  );

  // Don't forget to register the command
  context.subscriptions.push(command);
}

/**
 * Initializes the navigation tree provider
 * @param context - The extension context
 */
function initializeTreeProvider(context: vscode.ExtensionContext): void {
  // Tree Provider
  navigationTreeProvider = new NavigationTreeDataProvider(treeRoot);
  vscode.window.registerTreeDataProvider(
    "navigationTree",
    navigationTreeProvider
  );

  const command2 = vscode.commands.registerCommand(
    "extension.openNode",
    (args) => {
      console.log("openNode", args);

      if (args.node) {
        const node = args.node as TreeNode;
        treeRoot.currentNode!.current = false;
        treeRoot.currentNode = node;
        treeRoot.currentNode.current = true;

        // check if the current selection is the same we want to navigate to
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const selection = editor.selection;
          const wordRange = editor.document.getWordRangeAtPosition(
            selection.active
          );
          const currentWord = wordRange;
          if (
            areObjectsIdentical(wordRange, node.wordRange) &&
            editor.document.uri.fsPath === node.location.uri.fsPath
          ) {
            updateNewStack();
            navigationTreeProvider.refresh();
            stackPanelProvider.refresh();

            return;
          }
        }

        shouldIgnoreUpdate = true;

        vscode.window.showTextDocument(node.location.uri, {
          selection: new vscode.Range(node.wordRange.start, node.wordRange.end),
        });
      }
    }
  );

  context.subscriptions.push(command2);
}

function initializeStackVisualizerProvider(context: vscode.ExtensionContext) {
  stackVisualizerProvider = new StackVisualizerProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "stackVisualizer",
      stackVisualizerProvider
    )
  );

  stackVisualizerProvider.refresh();
}

/**
 * Handles text editor selection change events
 * Updates the navigation tree and stack based on cursor position
 * @param e - The selection change event
 */
async function onDidChangeTextEditorSelectionListener(
  e: vscode.TextEditorSelectionChangeEvent
): Promise<void> {
  if (isDebug) {
    console.log("selection changed");
  }
  const editor = vscode.window.activeTextEditor;

  if (editor) {
    const outlineItems: vscode.DocumentSymbol[] =
      await vscode.commands.executeCommand(
        "vscode.executeDocumentSymbolProvider",
        editor.document.uri
      );

    const position = editor.selection.active;
    symbolBreadcrumbs = [];
    findSymbol(outlineItems, position);

    const location = new vscode.Location(
      editor.document.uri,
      editor.selection.active
    );

    const symbol: vscode.DocumentSymbol | undefined = getRelevantSymbol();

    // get the current name in the editor. We want to bring the string we are on it now between space or dot to space or (
    let wordRange = editor.document.getWordRangeAtPosition(
      editor.selection.active
    );

    wordRange = wordRange ?? location.range;

    // get the current word in the editor
    let currentWord = wordRange
      ? editor.document.getText(wordRange)
      : EMPTY_WORD;

    currentWord = currentWord === "" ? EMPTY_WORD : currentWord;

    console.log(
      `symbol: ${symbol?.name}, start: ${symbol?.selectionRange.start} end: ${symbol?.selectionRange.end} kind: ${symbol?.kind} url: ${symbol?.location?.uri} word: ${currentWord}`
    );

    updateTree(symbol, currentWord, location, wordRange);
    updateNewStack();
    navigationTreeProvider.refresh();
    stackPanelProvider.refresh();

    lastSymbol = symbol;
    lastWord = currentWord;
    lastLocation = location;
  }
}

/**
 * Updates the navigation tree based on symbol navigation
 * @param symbol - The current document symbol
 * @param word - The current word at cursor position
 * @param location - The current location in the editor
 * @param wordRange - The range of the current word
 */
function updateTree(
  symbol: vscode.DocumentSymbol | undefined,
  word: string,
  location: vscode.Location,
  wordRange: vscode.Range
): void {
  if (shouldIgnoreUpdate) {
    shouldIgnoreUpdate = false;
    return;
  }

  // if the symbol is undefined, we want to reset the tree
  if (symbol === undefined) {
    treeRoot.node = undefined;
    treeRoot.currentNode = undefined;
    return;
  }

  // if the tree is undefined, we want to create the tree with symbol as new root
  if (treeRoot.node === undefined) {
    pathsArray = [];
    treeRoot.node = {
      symbol: symbol,
      word: word,
      wordRange: wordRange,
      location: location,
      color: getFileColor(location),
      current: true,
      children: [],
      parent: undefined,
    };
    treeRoot.currentNode = treeRoot.node;
    pathsArray = [];
    return;
  }

  // if one of the children current node is the symbol, we want to update the found child as the new current node
  let foundChild: TreeNode | undefined = findIfSymbolIsChildOfCurrentNode(
    treeRoot,
    symbol
  );
  if (foundChild) {
    treeRoot.currentNode!.current = false;
    treeRoot.currentNode = foundChild;
    treeRoot.currentNode.word = word;
    treeRoot.currentNode.wordRange = wordRange;
    treeRoot.currentNode.location = location;
    treeRoot.currentNode.current = true;
    return;
  }

  // if one of the ancestors of the current node is the symbol, we want to update the found ancestor as the new current node
  let foundAncestor: TreeNode | undefined = findIfSymbolIsAncestorOfCurrentNode(
    treeRoot,
    symbol
  );
  if (foundAncestor) {
    treeRoot.currentNode!.current = false;
    treeRoot.currentNode = foundAncestor;
    treeRoot.currentNode.word = word;
    treeRoot.currentNode.wordRange = wordRange;
    treeRoot.currentNode.location = location;
    treeRoot.currentNode.current = true;
    return;
  }

  // Check if the symbol is a child of the current node
  if (symbol.name === treeRoot.currentNode!.word) {
    treeRoot.currentNode!.current = false;

    const newNode: TreeNode = {
      symbol: symbol,
      word: word,
      wordRange: wordRange,
      location: location,
      color: getFileColor(location),
      current: true,
      children: [],
      parent: treeRoot.currentNode,
    };

    treeRoot.currentNode?.children.push(newNode);
    treeRoot.currentNode = newNode;
    return;
  }

  // if there is a symbol and no current node, we want to create a new tree

  pathsArray = [];
  treeRoot.node = {
    symbol: symbol,
    word: word,
    wordRange: wordRange,
    location: location,
    color: getFileColor(location),
    current: true,
    children: [],
    parent: undefined,
  };
  treeRoot.currentNode = treeRoot.node;
  return;
}

/**
 * Updates the new stack from the current tree state
 */
function updateNewStack(): void {
  if (treeRoot.node === undefined) {
    newStack = [];
    return;
  }

  if (treeRoot.currentNode === undefined) {
    newStack = [];
    return;
  }

  const partialStack = getPartialStackFromTree(treeRoot);

  if (checkAndUpdateNewStackContainsPartialStack(partialStack)) {
    return;
  }

  newStack = partialStack;
  colorNewStack();
}

function checkAndUpdateNewStackContainsPartialStack(
  partialStack: Array<StackElement>
) {
  if (newStack.length === 0) {
    return false;
  }

  if (partialStack.length > newStack.length) {
    return false;
  }

  let index: number = 0;
  for (let i = 0; i < partialStack.length; i++) {
    index = i;
    if (!areSymbolsIdentical(newStack[i].symbol, partialStack[i].symbol)) {
      return false;
    }
  }

  for (let i = 0; i < newStack.length; i++) {
    if (i === index) {
      newStack[i].isCurrent = true;
      newStack[i].wordRange = partialStack[i].wordRange;
      newStack[i].word = partialStack[i].word;
      newStack[i].location = partialStack[i].location;
    } else {
      newStack[i].isCurrent = false;
    }
  }

  return true;
}

function getPartialStackFromTree(root: TreeRoot): Array<StackElement> {
  let currentNode: TreeNode | undefined = root.currentNode;
  if (currentNode === undefined) {
    return [];
  }

  let stack: Array<StackElement> = [];

  do {
    stack.push({
      symbol: currentNode!.symbol,
      word: currentNode!.word,
      wordRange: currentNode!.wordRange,
      location: currentNode!.location,
      isCurrent: currentNode!.current,
      color: currentNode!.color,
      node: currentNode!,
    });

    currentNode = currentNode!.parent;
  } while (currentNode !== undefined);

  return stack.reverse();
}

/**
 * Assigns colors to stack elements based on their file paths
 */
function colorNewStack(): void {
  let colorIndex = 0;
  const fileColorMap: { [key: string]: string } = {};
  for (let i = 0; i < newStack.length; i++) {
    const location = newStack[i].location;
    const text = location.uri.fsPath;
    if (!fileColorMap[text]) {
      fileColorMap[text] = ALLOWED_COLORS[colorIndex % ALLOWED_COLORS.length];
      colorIndex++;
    }
    newStack[i].color = fileColorMap[text];
  }
}

function findSymbol(
  symbols: vscode.DocumentSymbol[],
  position: vscode.Position
): void {
  for (const symbol of symbols) {
    if (symbol.range.contains(position)) {
      symbolBreadcrumbs.push(symbol);

      if (symbol.children.length > 0) {
        findSymbol(symbol.children, position);
      }

      break;
    }
  }
}

function printBreadcrumbSymbols(breadcrumbSymbols: vscode.DocumentSymbol[]) {
  const breadcrumbNames = breadcrumbSymbols.map((symbol) => symbol.name);
  console.log("-----" + breadcrumbNames.join("->"));
}

function getRelevantSymbol(): vscode.DocumentSymbol | undefined {
  // iterate over symbols from symbolBreadcrumbs from the end to the start
  for (let i = symbolBreadcrumbs.length - 1; i >= 0; i--) {
    const symbol = symbolBreadcrumbs[i];
    if (isSymbolFunctional(symbol)) {
      // corner case of callback
      if (symbol.name.endsWith(" callback")) {
        if (i - 1 >= 0 && isSymbolFunctional(symbolBreadcrumbs[i - 1])) {
          return symbolBreadcrumbs[i - 1];
        }
      }

      return symbol;
    }
  }

  if (symbolBreadcrumbs.length > 0) {
    return symbolBreadcrumbs[symbolBreadcrumbs.length - 1];
  }

  return undefined;
}

function isSymbolFunctional(symbol: vscode.DocumentSymbol | undefined) {
  return (
    symbol &&
    (symbol.kind === vscode.SymbolKind.Function ||
      symbol.kind === vscode.SymbolKind.Method ||
      symbol.kind === vscode.SymbolKind.Property ||
      symbol.kind === vscode.SymbolKind.Constructor)
  );
}

function getRandomLightColor(): string {
  if (Object.keys(colorMap).length === 0) {
    return ALLOWED_COLORS[0];
  }

  ALLOWED_COLORS.forEach((color: string) => {
    // check if the color is already in the colorMap as value
    if (Object.values(colorMap).indexOf(color) === -1) {
      return color;
    }
  });

  // chose a random color from ALLOWED_COLORS
  const randomIndex = Math.floor(Math.random() * ALLOWED_COLORS.length);
  return ALLOWED_COLORS[randomIndex];
}

function pushFilePath(location: vscode.Location): number {
  const filePath = location.uri.fsPath;

  // check if the file path is already in the pathsArray
  pathsArray.forEach((path, index) => {
    if (path === filePath) {
      return index;
    }
  });

  pathsArray.push(filePath);
  return pathsArray.length - 1;
}

function getFileColor(location: vscode.Location): string {
  const index = pushFilePath(location);

  return ALLOWED_COLORS[index % ALLOWED_COLORS.length];
}
