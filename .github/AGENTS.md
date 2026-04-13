---
name: OMINA Development Agents
description: "Specifications for AI agents and MCP integration in OMINA platform."
---

# OMINA Development Agents & MCP Configuration

## React MCP Server

**Location:** `react-mcp-agent/`

**Purpose:** Bridge between Claude AI and React development environment

**Status:** ✅ Installed and ready

### Configuration for Claude Desktop

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

**File Location:** 
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Available Tools via React MCP

Within Claude, you can use:
- `create-react-app` - Create new React apps
- `run-react-app` - Start dev servers
- `run-command` - Execute terminal commands
- `install-package` - Install npm packages
- `read-file` / `edit-file` - Manage files
- `list-processes` - View running processes

**Learn More:** See `docs/REACT_MCP_SETUP.md`

## UI/UX Design Agent

**Skill Location:** `.github/skills/ui-ux-design/`

**Purpose:** Ensure all components follow OMINA design system

**Triggers:** 
- "Create a component following OMINA design"
- "Review this component for accessibility"
- "Make this mobile-responsive"
- "Audit for WCAG compliance"

**Key Guidelines:**
- Mobile-first approach
- WCAG 2.1 AA compliance
- Emergency context awareness
- Design system colors: Red (#DC2626), Blue (#2563EB), Green (#16A34A)
- Touch targets ≥ 48px

**Learn More:** See `.github/skills/ui-ux-design/SKILL.md`

## File Instructions

**Location:** `.github/instructions/ui-ux-design.instructions.md`

**Applies to:** All React components in `client/**/*.{jsx,tsx,css}`

**Auto-applied**: When working with component files, these design guidelines are automatically included in context

## MCP + UI/UX Workflow

### Step 1: Design Phase
```
In Claude Chat:
"I need to design a new SOS panel component. Follow OMINA UI/UX guidelines.
What should the layout look like?"
```

### Step 2: Implementation
```
"Using react-mcp and UI/UX guidelines, create SOSPanel component:
- Red (#DC2626) for visibility
- 56px+ touch targets
- WCAG 2.1 compliant
- Mobile-first responsive
- TypeScript types
- Save to: client/src/components/SOSPanel.tsx"
```

### Step 3: Testing
```
"Audit SOSPanel component for:
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Mobile responsiveness"
```

### Step 4: Deployment
Component is ready to use in your project!

## Calling Claude with MCP

**Format:**
```
Using react-mcp, [action]:
- [requirement 1]
- [requirement 2]
- [design guideline reference]
```

**Example:**
```
Using react-mcp, create a ContactsList component:
- Display emergency contacts
- Each item clickable to call
- Follow OMINA color palette (blue for safety)
- 48px+ touch targets
- TypeScript types
- Keyboard navigable
- Mobile-first responsive
- Save to: client/src/components/ContactsList.tsx
```

## Status

✅ React MCP: Installed, configured, ready  
✅ UI/UX Skill: Active, applies to all components  
✅ Design Guidelines: Enforced via instructions  
✅ Component Templates: Available in `.github/skills/ui-ux-design/`

## Next Steps

1. Restart Claude Desktop to load MCP
2. Start creating components with: "Using react-mcp..."
3. Reference design system automatically in responses
4. Use UI/UX skill for accessibility checks

---

**Quick Links:**
- Setup: `docs/REACT_MCP_SETUP.md`
- Design System: `docs/DESIGN_SYSTEM.md`
- Troubleshooting: `docs/NETWORK_TROUBLESHOOTING.md`
