import * as vscode from "vscode";
import { JSDOM } from "jsdom";
import { getColorMap, getNewStack, getNewStackCopy } from "../extension";
import { StackElement } from "../dataTypes";

/**
 * Provides the webview for the code navigation stack panel
 * Displays the current navigation path in a stack format
 */
export class StackProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "navigationPanel";

  private _view?: vscode.WebviewView;
  private _editor: vscode.TextEditor | undefined;

  private _dom: JSDOM = new JSDOM(`
      <!DOCTYPE html>
      </html>
    `);

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._editor = vscode.window.activeTextEditor;
  }

  /**
   * Resolves the webview view when it becomes visible
   * @param webviewView - The webview view to resolve
   * @param context - The resolution context
   * @param _token - Cancellation token
   */
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      switch (message.command) {
        case "openFile":
          const stack = getNewStack();
          const nodeElement = stack[message.index].node;

          if (nodeElement) {
            vscode.commands.executeCommand("extension.openNode", {
              node: nodeElement,
              isFromStack: true,
            });
          }
          return;
      }
    }, undefined);
  }

  /**
   * Initializes the DOM structure for the webview
   * @param webview - The webview to initialize
   */
  private initizalizeDOM(webview: vscode.Webview): void {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "resources", "stack.js")
    );

    const nonce = getNonce();

    this._dom = new JSDOM(`
        <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Navigation CallStack</title>
        <style>
          .stack-container {
            max-width: 100%;
            overflow: auto; /* This allows for horizontal scrolling if necessary, but we'll try to avoid the need for it */
            width: 100%; /* Let it naturally fill the available space */
        }
        
        .callstack-entry {
            padding: 8px;
            border-bottom: 1px solid #CCCCCC;
            cursor: pointer;
            display: flex;
            justify-content: space-between; /* Maintain space between items */
            align-items: center;
            box-sizing: border-box; /* Include padding and border in the element's total width */
        }
        
        .function-name, .class-name, .line-number {
            overflow: hidden; /* Hide overflow */
            text-overflow: ellipsis; /* Use ellipsis for overflowed text */
            white-space: nowrap; /* Prevent wrapping, which helps with overflow management */
        }
        
        /* Adjust flex items to allow them to shrink if necessary */
        .function-name, .class-name {
            flex-shrink: 1; /* Allows these elements to shrink as needed */
        }
        
        .line-number {
            flex-shrink: 0; /* Prevent the line number from shrinking to ensure it's always fully visible */
            margin-left: auto; /* This ensures that the line number is always pushed to the far right */
        }
      
        .page-header {
            line-height: 10px;
            border-top: 1px;
            padding: 5 px;
        }

        .function-name {
            color: #CCCCCC;
        }

        .callstack-entry:hover {
            background-color: rgba(200, 200, 200, 0.2);
        }
    </style>
</head>

<body>
    <div class="page-header" role="button" aria-label="Toggle Call Stack" tabindex="0">
        <h3 class="title" title="Code Navigation Stack" color="#CCCCCC">Code Navigation Stack</h3>
    </div>
    <div class="stack-container"> </div>
</body>
<script nonce="${nonce}" src="${scriptUri}"></script>

</html>

    `);
  }

  /**
   * Generates the HTML content for the webview
   * @param webview - The webview to generate HTML for
   * @returns The HTML string
   */
  private _getHtmlForWebview(webview: vscode.Webview): string {
    this.initizalizeDOM(webview);

    const stack = getNewStack();

    const document = this._dom.window.document;
    const stackContainer = document.querySelector(".stack-container");

    let index = 0;

    stack.forEach(function (func: StackElement) {
      const element = document.createElement("div");
      // write the index to the element
      element.dataset.index = index.toString();

      // a.target = '_blank'; // Open the link in a new tab
      element.className = "callstack-entry";

      const functionName = document.createElement("span");
      functionName.className = "function-name";
      functionName.innerHTML = func.symbol.name;

      if (func.isCurrent) {
        functionName.style.fontWeight = "bold";
      }

      element.appendChild(functionName);

      const className = document.createElement("span");
      className.className = "class-name";
      //className.innerHTML = func.location.uri.fsPath;
      const path = func.location.uri.fsPath.split("\\");
      className.innerHTML = path[path.length - 1];

      const colorMap = getColorMap();

      className.style.color = colorMap[func.location.uri.fsPath];

      if (func.isCurrent) {
        // this entry will be bold
        element.style.fontWeight = "bold";
      }

      element.appendChild(className);

      stackContainer?.appendChild(element);

      index++;
    });

    return this._dom.serialize();
  }

  /**
   * Refreshes the webview with the current stack state
   */
  public refresh(): void {
    if (this._view) {
      this._view.webview.postMessage({
        command: "updateStack",
        stack: getNewStackCopy(),
      });
    }
  }
}

/**
 * Generates a random nonce for script security
 * @returns A random alphanumeric string
 */
function getNonce(): string {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
