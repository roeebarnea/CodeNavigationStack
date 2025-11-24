/**
 * Webview script for the Code Navigation Stack panel
 * This script handles the interactive stack display and communication with the extension
 */

// VS Code API types for webview
declare function acquireVsCodeApi(): {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
};

interface StackElement {
  symbol: {
    name: string;
  };
  word: string;
  wordRange: Array<{ line: number; character: number }>;
  location: {
    uri: {
      fsPath: string;
    };
  };
  isCurrent: boolean;
  color: string;
}

interface MessageData {
  command: string;
  stack?: StackElement[];
}

(function () {
  const vscode = acquireVsCodeApi();

  console.log("stack.js loaded");

  /**
   * Handle clicks on stack entries
   */
  document.addEventListener("DOMContentLoaded", () => {
    const stackContainer = document.querySelector(".stack-container");

    if (!stackContainer) {
      console.error("Stack container not found");
      return;
    }

    stackContainer.addEventListener("click", (event) => {
      const target = (event.target as HTMLElement).closest(
        ".callstack-entry"
      ) as HTMLElement;

      if (target) {
        const functionNameElement = target.querySelector(".function-name");
        if (functionNameElement) {
          const functionName = functionNameElement.textContent;
          const index = target.dataset.index;

          vscode.postMessage({
            command: "openFile",
            text: functionName,
            index: index,
          });
        }
      }
    });
  });

  /**
   * Handle messages from the extension
   */
  window.addEventListener("message", (event) => {
    const message = event.data as MessageData;

    switch (message.command) {
      case "updateStack":
        console.log("updateStack");
        console.log(message.stack);

        if (message.stack) {
          updateStackDisplay(message.stack);
        }
        break;
    }
  });

  /**
   * Updates the stack display with new stack elements
   */
  function updateStackDisplay(stack: StackElement[]): void {
    const stackContainer = document.querySelector(".stack-container");

    if (!stackContainer) {
      console.error("Stack container not found");
      return;
    }

    // Remove all existing children
    while (stackContainer.firstChild) {
      stackContainer.removeChild(stackContainer.firstChild);
    }

    // Create elements for each stack entry
    stack.forEach((func, index) => {
      const element = document.createElement("div");
      element.dataset.index = index.toString();
      element.className = "callstack-entry";

      // Create function name element
      const functionName = document.createElement("span");
      functionName.className = "function-name";
      functionName.innerHTML = func.isCurrent
        ? "→ " + func.symbol.name
        : func.symbol.name;

      if (func.isCurrent) {
        functionName.style.fontWeight = "bold";
        element.style.fontWeight = "bold";
        element.style.borderBottom = "2px solid #CCCCCC";
      }

      element.appendChild(functionName);

      // Create line number element
      const lineNumber = document.createElement("span");
      lineNumber.className = "line-number";

      const isBackSlashContained = func.location.uri.fsPath.includes("\\");
      const path = isBackSlashContained
        ? func.location.uri.fsPath.split("\\")
        : func.location.uri.fsPath.split("/");

      lineNumber.style.color = func.color;
      lineNumber.title = func.location.uri.fsPath;

      if (func.wordRange && func.wordRange.length > 0) {
        const fileName = path[path.length - 1];
        const line = func.wordRange[0].line + 1;
        const character = func.wordRange[0].character + 1;
        lineNumber.innerHTML = `${fileName}(${line}:${character})`;
      }

      element.appendChild(lineNumber);
      functionName.style.marginRight = "0.1px";
      lineNumber.style.marginLeft = "0.1px";

      stackContainer.appendChild(element);
    });
  }
})();
