# Contributing to Code Navigation Stack

Thank you for your interest in contributing to Code Navigation Stack! This document provides guidelines for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description** of the issue
- **Steps to reproduce** the behavior
- **Expected vs actual behavior**
- **VS Code version** and extension version
- **Screenshots** if applicable
- **Error messages** from the Developer Console (Help > Toggle Developer Tools)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description** of the feature
- **Use case** - explain why this would be useful
- **Mockups or examples** if applicable

### Pull Requests

1. **Fork the repository** and create your branch from `master`
2. **Make your changes** following the code style guidelines below
3. **Add tests** if applicable
4. **Update documentation** including README.md if needed
5. **Test your changes** thoroughly
6. **Submit a pull request** with a clear description of changes

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/robarnea_microsoft/CodeNavigatorStack.git
   cd CodeNavigatorStack
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Open in VS Code:

   ```bash
   code .
   ```

4. Compile the project:

   ```bash
   npm run compile
   ```

   This compiles both the extension code and the webview scripts.

5. Press `F5` to start debugging the extension in a new Extension Development Host window

## Build Process

The project uses TypeScript for all code, including webview scripts:

- **Extension code** (`src/**/*.ts`) compiles to `out/`
- **Webview scripts** (`src/webview/*.ts`) compile to `resources/`

The compiled `resources/stack.js` is git-ignored and generated during build.

### Available Scripts

- `npm run compile` - Compile extension and webview
- `npm run compile:extension` - Compile extension only
- `npm run compile:webview` - Compile webview only
- `npm run watch` - Watch mode for both extension and webview
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Code Style Guidelines

### TypeScript

- Use **TypeScript** for all code
- Add **JSDoc comments** to all public functions, classes, and exported types
- Use **explicit return types** for functions
- Prefer **const** over let when variables don't change
- Use **meaningful variable names**
- Keep functions **small and focused**

### Formatting

- Use **2 spaces** for indentation
- Add **semicolons** at the end of statements
- Use **double quotes** for strings
- Run `npm run lint` before committing

### Commits

- Use clear and descriptive commit messages
- Start with a verb in present tense (e.g., "Add feature", "Fix bug")
- Reference issue numbers when applicable

## Project Structure

```
src/
  ├── constants.ts         # Application constants
  ├── dataTypes.ts         # Type definitions
  ├── extension.ts         # Main extension entry point
  ├── helpers.ts           # Helper functions
  ├── tree.ts              # Tree data structures
  ├── webview/             # Webview TypeScript sources
  │   ├── stack.ts         # Stack panel webview script
  │   └── tsconfig.json    # Webview-specific TypeScript config
  ├── webViews/            # Webview providers (extension side)
  │   ├── stackPanel.ts
  │   ├── TreeDataProvider.ts
  │   └── StackTreeDataProvider.ts
  ├── test/                # Test suites
  └── api/                 # API definitions

resources/
  ├── stack.js             # Compiled webview script (git-ignored)
  ├── stackIcon.svg        # Extension icons
  └── CodeNavigationStackLogo.png
```

## Testing

- Test your changes in the Extension Development Host
- Test with different file types and project structures
- Verify navigation works correctly
- Check console for errors or warnings

## Building

To create a `.vsix` package:

```bash
npm install -g @vscode/vsce
vsce package
```

## Questions?

Feel free to open an issue for any questions about contributing!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
