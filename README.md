# Code Navigation Stack

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A VS Code extension that visualizes your code navigation history as an interactive tree and stack, helping you understand and navigate complex codebases more effectively.

![Demo](https://raw.githubusercontent.com/roeebarnea/CodeNavigationStackMedia/user/robarnea/bla/CodeNavigationStackReadme_WithTree_new.gif)

## Features

This extension provides two powerful views to help you track your code navigation:

### Code Navigation Tree

Located in the Explorer sidebar, this view presents the complete hierarchical structure of your navigation path. The tree is fully interactive - simply click on any node to jump back to that point in your navigation history.

![Navigation Tree](https://raw.githubusercontent.com/roeebarnea/CodeNavigationStackMedia/user/robarnea/bla/tree.png)

**Key Features:**

- 📊 Visual hierarchy of your code navigation
- 🎯 Click any node to navigate back to that location
- 🎨 Color-coded by file for easy identification
- 🔄 Automatically updates as you navigate

### Code Navigation Stack Panel

This panel shows your current navigation branch, displaying the path from the root to your current position in the navigation tree.

![Stack Panel](https://raw.githubusercontent.com/roeebarnea/CodeNavigationStackMedia/user/robarnea/bla/stackPanel.png)

**Key Features:**

- 📍 Shows current position in navigation hierarchy
- 📝 Displays function/method names with file locations
- 🎨 Color-coded file indicators
- ⚡ Quick navigation by clicking on any stack entry

## How It Works

The extension tracks your cursor position as you navigate through code:

- When you move to a function, method, or property definition
- It builds a hierarchical tree of your navigation path
- The current path is displayed in both the tree and stack views
- You can navigate backward by clicking on any previous position

## Use Cases

- **Code Review**: Track your exploration path when reviewing unfamiliar code
- **Debugging**: Maintain context when jumping between function calls
- **Learning**: Visualize code structure relationships as you explore
- **Refactoring**: Keep track of dependencies while restructuring code

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Code Navigation Stack"
4. Click Install

Or install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=RoeeBarnea.code-navigation-stack)

## Requirements

- Visual Studio Code version 1.78.0 or higher

## Extension Settings

This extension works out of the box with no configuration required. The views will automatically appear in:

- Explorer sidebar: Code Navigation Tree
- Panel area: Code Navigation Stack

## Known Issues

Please report any issues on the [GitHub repository](https://github.com/robarnea_microsoft/CodeNavigatorStack/issues).

## Release Notes

### 0.2.9

Current release with improved stability and performance.

## Development

### Running Tests

The extension includes comprehensive unit tests covering core functionality:

```bash
# Run all tests
npm test

# Compile in watch mode for development
npm run watch

# Run linter
npm run lint
```

For detailed testing information, see [TESTING.md](TESTING.md).

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package the extension
vsce package
```

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Quick start:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this extension helpful, please consider:

- ⭐ Starring the [GitHub repository](https://github.com/robarnea_microsoft/CodeNavigatorStack)
- 📝 Writing a review on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=RoeeBarnea.code-navigation-stack)
- 🐛 Reporting bugs or suggesting features via [GitHub Issues](https://github.com/robarnea_microsoft/CodeNavigatorStack/issues)

---

**Enjoy navigating your code!** 🚀
