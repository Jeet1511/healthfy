---
name: OMINA Development Platform
description: "Comprehensive VS Code Copilot configuration for OMINA emergency response platform. Includes design system, MCP integration, and development standards."
---

# OMINA Development Platform - VS Code Copilot Configuration

This configuration enables VS Code Copilot to provide intelligent assistance for OMINA platform development with:
- ✅ UI/UX Design System guidance
- ✅ React MCP integration
- ✅ Accessibility & WCAG compliance
- ✅ Component creation patterns
- ✅ Development standards

## Quick Start

### 1. UI/UX Components
When working on React components, Copilot automatically applies design guidelines:
```
"Create a SafetyButton component"
```
Copilot will automatically:
- Apply OMINA color system (#DC2626 red, #2563EB blue, #16A34A green)
- Ensure WCAG 2.1 AA compliance
- Implement mobile-first responsive design
- Add accessibility features (keyboard nav, ARIA labels, focus states)

### 2. With React MCP
For Claude AI integration with full component scaffolding:
```
Using react-mcp, create an EmergencyContactsList component:
- List emergency contacts with quick-call buttons
- Follow OMINA design system
- Mobile-first responsive
- Touch targets ≥ 48px
- WCAG 2.1 compliant
```

### 3. Design Reviews
Ask Copilot to audit existing components:
```
"Review this component for accessibility and OMINA design compliance"
"Make this form mobile-friendly"
"Audit for WCAG 2.1 AA compliance"
```

## Configuration Files

### Instructions (Auto-Applied)
- **Location**: `.github/instructions/ui-ux-design.instructions.md`
- **Applies to**: `client/**/*.{jsx,tsx,css}`
- **Triggers**: Automatically when editing React components
- **Contains**: Design guidelines, color palette, accessibility checklist

### Skills (Invokable)
- **Location**: `.github/skills/ui-ux-design/SKILL.md`
- **Trigger**: Ask Copilot "Let's use the UI/UX skill" or tasks that reference OMINA design
- **Contains**: Design patterns, component templates, WCAG guidelines

### Prompts (Available)
- **Location**: `.github/prompts/ui-ux-pro-max/PROMPT.md`
- **Use For**: Advanced component creation with detailed specifications

## Design System

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Primary Red | #DC2626 | Emergency SOS, critical alerts |
| Safety Blue | #2563EB | Assistance requests, information |
| Success Green | #16A34A | Confirmations, completed actions |
| Warning Orange | #EA580C | Warnings, cautions |
| Neutral Gray | #6B7280 | Disabled states, secondary actions |

### Typography
- **Headings**: Bold, 24-32px
- **Body**: 16px base (min 14px)
- **Labels**: Medium, 14px
- **Line Height**: 1.5 body, 1.3 headings

### Touch Targets
- Standard: 48px × 48px minimum
- Emergency buttons: 56px × 56px minimum

## Component Template

Copilot generates components like this:

```jsx
import React, { FC } from 'react';

interface SafetyButtonProps {
  label: string;
  onClick: () => void;
  isLoading?: boolean;
}

/**
 * SafetyButton - OMINA design system compliant button
 * 
 * - WCAG 2.1 AA accessible
 * - Mobile-first responsive
 * - Touch target: 56px minimum
 */
export const SafetyButton: FC<SafetyButtonProps> = ({
  label,
  onClick,
  isLoading = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        w-full md:w-auto px-8 py-4 rounded-lg font-semibold
        text-white text-lg bg-blue-600 hover:bg-blue-700
        disabled:bg-gray-400 disabled:cursor-not-allowed
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        min-h-[56px] md:min-w-[56px]
      `}
      aria-label={label}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          Loading...
        </>
      ) : (
        label
      )}
    </button>
  );
};
```

## Accessibility Standards

All components MUST meet:
- ✅ WCAG 2.1 Level AA
- ✅ Focus visible on all interactive elements
- ✅ Semantic HTML (buttons, labels, navigation)
- ✅ Color contrast ≥ 4.5:1
- ✅ Touch targets ≥ 48px
- ✅ Keyboard navigable (Tab, Enter, Escape)
- ✅ Screen reader compatible
- ✅ Mobile-first responsive

## Development Workflow

### Step 1: Create Component
```
"Create a DistasterAlertPanel component following OMINA design"
```

### Step 2: Review Design
```
"Review this component for:
- WCAG 2.1 compliance
- Mobile responsiveness
- Touch target sizes
- Color contrast"
```

### Step 3: Add Tests
```
"Add unit tests for this component:
- User interactions
- Keyboard navigation
- Screen reader compatibility"
```

### Step 4: Optimize
```
"Optimize this component for:
- Bundle size
- Performance
- Lighthouse score ≥ 85"
```

## MCP Integration

React MCP is installed at: `react-mcp-agent/`

**To enable in Claude Desktop:**
1. Open `%APPDATA%\Claude\claude_desktop_config.json`
2. Add:
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

## File Structure

```
.github/
├── instructions/
│   └── ui-ux-design.instructions.md    ← Auto-applied to React files
├── skills/
│   └── ui-ux-design/
│       ├── SKILL.md                    ← Design skill reference
│       ├── README.md                   ← Quick start
│       └── component-templates.md      ← Code templates
├── prompts/
│   └── ui-ux-pro-max/
│       └── PROMPT.md                   ← Advanced prompts
├── copilot-instructions.md             ← This file (config)
└── AGENTS.md                           ← MCP agent specs
```

## When to Use Each Component

### Use Emergency Components (Red #DC2626)
- SOS button
- Critical alert banners
- Emergency actions
- Disaster alerts

### Use Safety Components (Blue #2563EB)
- Assistance requests
- Information panels
- Navigation
- Status displays

### Use Success Components (Green #16A34A)
- Form confirmations
- Success messages
- Completed actions
- Safe status indicators

## Validation Checklist

Before submitting PR, components must have:
- ✅ Component created with semantic HTML
- ✅ TypeScript/JSDoc types defined
- ✅ WCAG 2.1 AA audit passed
- ✅ Mobile responsiveness verified (320px+)
- ✅ Keyboard navigation tested
- ✅ Screen reader compatible
- ✅ Touch targets ≥ 48px
- ✅ Color contrast checked
- ✅ Focus states visible
- ✅ Loading/error states handled
- ✅ Unit tests added (80%+ coverage)
- ✅ Lighthouse audit ≥ 85

## References

- **Skill Details**: `.github/skills/ui-ux-design/SKILL.md`
- **Instructions**: `.github/instructions/ui-ux-design.instructions.md`
- **Components**: `.github/skills/ui-ux-design/component-templates.md`
- **Platform Docs**: `docs/DESIGN_SYSTEM.md`
- **Network Setup**: `docs/NETWORK_TROUBLESHOOTING.md`
- **Agents**: `.github/AGENTS.md`

## Support

### Common Questions

**Q: Component not following design system?**
A: Make sure you're editing files in `client/src/components/`. The instruction file auto-applies.

**Q: How do I use React MCP?**
A: See `.github/AGENTS.md` for configuration. Need Node.js and React MCP installed at `react-mcp-agent/`.

**Q: Can I customize the design system?**
A: Yes! Colors and patterns are defined in `.github/instructions/ui-ux-design.instructions.md`. Update there and all new components follow.

**Q: How do I audit existing components?**
A: Ask Copilot: "Review this file for OMINA design compliance and WCAG 2.1 AA standards"

---

**Status**: ✅ Ready for VS Code Copilot  
**Last Updated**: 2026-04-02  
**Servers**: Running at https://192.168.29.62:5174 (frontend), https://192.168.29.62:5000 (backend)
