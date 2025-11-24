import * as vscode from "vscode";

/**
 * Compares two document symbols for identity
 * Symbols are considered identical if they have the same name, kind, and location URI
 * @param symbol1 - First symbol to compare
 * @param symbol2 - Second symbol to compare
 * @returns True if symbols are identical, false otherwise
 */
export function areSymbolsIdentical(
  symbol1: vscode.DocumentSymbol,
  symbol2: vscode.DocumentSymbol
): boolean {
  return (
    symbol1.name === symbol2.name &&
    symbol1.kind === symbol2.kind &&
    symbol1.location?.uri.toString() === symbol2.location?.uri.toString()
  );
}

/**
 * Performs a deep comparison of two objects
 * @param obj1 - First object to compare
 * @param obj2 - Second object to compare
 * @returns True if objects are deeply equal, false otherwise
 */
export function areObjectsIdentical(obj1: unknown, obj2: unknown): boolean {
  // Get the keys of both objects
  const keys1 = Object.keys(obj1 as Record<string, unknown>);
  const keys2 = Object.keys(obj2 as Record<string, unknown>);

  // Check if the number of properties is different
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Check if the values are different
  for (const key of keys1) {
    const val1 = (obj1 as Record<string, unknown>)[key];
    const val2 = (obj2 as Record<string, unknown>)[key];
    const areObjects = isObject(val1) && isObject(val2);

    // If both values are objects, do a deep comparison
    if (
      (areObjects && !areObjectsIdentical(val1, val2)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if a value is an object (not null and typeof object)
 * @param object - The value to check
 * @returns True if the value is an object, false otherwise
 */
function isObject(object: unknown): boolean {
  return object !== null && typeof object === "object";
}
