# MCP Setup Guide for OMINA

This folder contains the React MCP (Model Context Protocol) server that connects Claude AI to your React development environment.

## Files

- `SKILL.md` - Main UI/UX design skill documentation
- `component-templates/` - Reusable component patterns

## Configuration

The MCP server is already installed at: `../../react-mcp-agent/`

See `docs/REACT_MCP_SETUP.md` for full setup instructions.

## Quick Start

1. Open Claude Desktop settings
2. Add this to your config.json:
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
3. Restart Claude
4. Ask Claude to create components using react-mcp

## Using with UI/UX Skill

```
Using react-mcp and UI/UX design guidelines, create:
- Component: EmergencyButton
- Follows: OMINA design system
- Tests: WCAG 2.1 compliant
- Location: client/src/components/
```
