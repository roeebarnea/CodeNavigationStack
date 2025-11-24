/**
 * Constants used throughout the Code Navigation Stack extension
 */

/**
 * Placeholder word used when no meaningful word is found at cursor position
 */
export const EMPTY_WORD = "EMPTY_WORD";

/**
 * Color palette for highlighting different files in the navigation stack
 * These colors are designed to be visible in VS Code's default themes
 */
export const ALLOWED_COLORS = [
  "#c586c0", // purple
  "#9cdcfe", // light blue
  "#dcdcaa", // yellow
  "#73c991", // light green
  "#f88070", // light red
  "#ce9178", // orange
  "#cca700", // gold
] as const;

/**
 * Symbol kinds that represent functional/navigable code elements
 */
export const FUNCTIONAL_SYMBOL_KINDS = [
  "Function",
  "Method",
  "Property",
  "Constructor",
] as const;
