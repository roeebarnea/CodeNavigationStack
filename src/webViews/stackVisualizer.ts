import * as vscode from "vscode";
import { JSDOM } from "jsdom";
import { getStack } from "../extension";
import { StackElement } from "../dataTypes";

export class StackVisualizerProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  public static readonly viewType = "stackVisualizer";

  private _dom = new JSDOM(`<!DOCTYPE html><body></body>`);

  constructor(private readonly _extensionUri: vscode.Uri) {}

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

    this._view = webviewView;
    this._update();
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Here you can generate the HTML to visualize the stack
    // For simplicity, I'm just showing a simple message

    const stack = getStack();

    return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    /* Add some basic styling */
                    #stackContainer {
                        display: flex;
                        flex-direction: column; /* This makes the last item appear at the bottom */
                        align-items: center;
                        gap: 10px;
                    }
                    .stackElement {
                        padding: 10px;
                        background-color: #f0f0f0;
                        border: 1px solid #ddd;
                        color: black;
                        size: 15px;
                    }
                    .stackElementChosen {
                      padding: 10px;
                      background-color: #f0f0f0;
                      border: 1px solid #ddd;
                      color: blue;
                      bold: true;
                      size: 20px;
                  }
                </style>
                <title>Stack Visualizer</title>
            </head>
            <body>
                <h1>Stack Visualizer</h1>
                <p>Visualize the stack here</p>
                <div id="stackContainer">
                    ${this.visualizeStackToHtmlString(stack)}
                </div>
            </body>
            </html>`;
  }

  private visualizeStackToHtmlString(stack: StackElement[]): string {
    // Initialize an empty array to hold HTML strings for each stack element
    const htmlElements: string[] = stack.map((element) => {
      if (element.isCurrent) {
        return `<div class="stackElementChosen">${element.symbol.name}: ${element.word}</div>`;
      } else {
        return `<div class="stackElement">${element.symbol.name}: ${element.word}</div>`;
      }
    });

    // Join all HTML strings into a single string
    return htmlElements.join("");
  }

  private _update() {
    if (this._view) {
      this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    }
  }

  public refresh() {
    this._update();
  }
}
