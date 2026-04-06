# React MCP - Setup & Usage Guide

## What is React MCP?

React MCP (Model Context Protocol) is a bridge between Claude AI and React development, allowing Claude to:
- Create and manage React apps
- Edit components and files  
- Install packages
- Run development servers
- Execute terminal commands

## Installation

✅ **Already installed locally at:** `c:/Users/Rima Adhikary/mem2/react-mcp-agent/`

## Configure for Claude Desktop

1. Open Claude Desktop app
2. Go to **Settings** → **Developer**
3. Find **"config.json"** and click "Edit"
4. Add this configuration:

```json
{
  "mcpServers": {
    "react-mcp": {
      "command": "node",
      "args": ["c:/Users/Rima Adhikary/mem2/react-mcp-agent/index.js"]
    }
  }
}
```

5. Save and restart Claude Desktop

## Available Tools

### File Operations
- **read-file**: Read any file in your project
- **edit-file**: Create or edit files
- **list-processes**: See running processes

### React Development
- **create-react-app**: Create new React apps
- **run-react-app**: Start dev server
- **install-package**: Install npm packages

### System Commands
- **run-command**: Execute terminal commands
- **get-process-output**: Get output from running processes
- **stop-process**: Stop any running process

## Usage Examples

### In Claude Chat:

**Example 1:** Create Emergency Component
```
Use react-mcp to create a new SOS emergency button component in the components folder.
Include TypeScript types and proper error handling.
```

**Example 2:** Update Existing File
```
Use react-mcp to read the AssistancePanel.jsx file and suggest UI improvements 
based on the DESIGN_SYSTEM.md guidelines.
```

**Example 3:** Run Development Server
```
Use react-mcp to run the React app development server on port 5174.
```

## Process Management

The MCP logs all operations:
- **JSON logs**: `react-mcp-agent/logs/react-mcp-logs.json`
- **Text logs**: `react-mcp-agent/logs/react-mcp-logs.txt`

## Architecture

```
Your Project
├── Front-end (Vite + React)
├── Back-end (Express + Node)
└── react-mcp-agent/ (Claude AI Integration)
    ├── index.js (MCP Server)
    ├── package.json
    └── logs/
```

## Pro Tips

1. **Design-First**: Reference DESIGN_SYSTEM.md while asking Claude to update UI
2. **Type Safety**: Ask Claude to use TypeScript for new components
3. **Testing**: Request Claude to add tests for new features
4. **Documentation**: Have Claude update component docs automatically

## Troubleshooting

**MCP not appearing in Claude?**
- Restart Claude Desktop completely
- Check file path is correct
- Verify `node` is in PATH

**Process errors?**
- Check logs in `react-mcp-agent/logs/` directory
- Ensure all dependencies are installed: `npm install`

## Next Steps

1. ✅ MCP is ready to use
2. Open Claude Desktop
3. Ask Claude to help with OMINA component improvements
4. Reference design principles while building

---

**Ready to supercharge your development with AI!** 🚀
