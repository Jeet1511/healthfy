# MCP & UI/UX Skill Setup Complete ✅

**Created:** All agent customization and skill files for OMINA platform

## Files Created

### 1. **UI/UX Design Instructions** 
📍 `.github/instructions/ui-ux-design.instructions.md`
- Applies to: `client/**/*.{jsx,tsx,css}`
- Contains: 15+ design guidelines, color palette, accessibility checklist
- Automatically active when editing React components

### 2. **UI/UX Design Skill**
📍 `.github/skills/ui-ux-design/SKILL.md`
- Main skill file with design patterns
- Component templates included
- 5 common design tasks documented
- Reference to OMINA color system

### 3. **Component Templates**
📍 `.github/skills/ui-ux-design/component-templates.md`
- Emergency Button template (TypeScript)
- Form Field template
- Mobile Layout template
- All WCAG 2.1 compliant

### 4. **Skill README**
📍 `.github/skills/ui-ux-design/README.md`
- Quick start guide
- React MCP configuration
- Usage instructions

### 5. **Agents Configuration**
📍 `.github/AGENTS.md`
- React MCP server details (installed at `react-mcp-agent/`)
- UI/UX agent triggers
- MCP + UI/UX workflow
- Status: ✅ Ready to use

### 6. **Workspace Instructions**
📍 `copilot-instructions.md`
- Global platform guidelines
- Code organization
- Component standards
- Git practices
- Performance targets

## How to Use

### With React MCP (for Claude)
```
Using react-mcp, create an AccessibilityPanel component:
- Follow OMINA UI/UX guidelines
- Use color palette: red #DC2626, blue #2563EB
- Mobile-first responsive design
- TypeScript types
- WCAG 2.1 AA compliant
```

### With VS Code Copilot
```
Let's create a SafetyButton component following OMINA design system:
- 56px height minimum
- Red (#DC2626) for emergency
- Touch-friendly
- Keyboard navigable
```

### Design System Reference
- **Active**: Automatically applied when editing `client/**/*.{jsx,tsx,css}`
- **Color Reference**: OMINA palette with primary red, safety blue, success green
- **Accessibility**: Mobile-first, WCAG 2.1, keyboard nav, focus visible

## Configuration Status

✅ **UI/UX Design Instructions** — Active, applies to all React files  
✅ **UI/UX Design Skill** — Ready for Claude use  
✅ **Component Templates** — Available for reference  
✅ **Agents Configuration** — MCP server details documented  
✅ **Workspace Instructions** — Global guidelines set  

## Next Step: Configure Claude Desktop

1. Open Claude Desktop settings
2. Edit `claude_desktop_config.json` (Windows: `%APPDATA%\Claude\`)
3. Add MCP server configuration:

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

4. Restart Claude Desktop
5. Start creating components with React MCP!

**See:** `.github/AGENTS.md` for full MCP configuration details

## Design Checklist

Every component should have:
- ✅ Semantic HTML
- ✅ Color contrast ≥ 4.5:1
- ✅ Touch targets ≥ 48px
- ✅ Focus visible
- ✅ Keyboard navigable
- ✅ Mobile-first responsive
- ✅ Loading states
- ✅ Error handling
- ✅ TypeScript types
- ✅ JSDoc comments

## References

- **Design System Details**: `docs/DESIGN_SYSTEM.md`
- **MCP Setup**: `docs/REACT_MCP_SETUP.md`
- **Network Access**: `docs/NETWORK_TROUBLESHOOTING.md`
- **Skill File**: `.github/skills/ui-ux-design/SKILL.md`
- **Agents**: `.github/AGENTS.md`

---

**Setup is complete!** You now have:
1. ✅ UI/UX design guidelines auto-applied to components
2. ✅ MCP skill ready for Claude AI integration
3. ✅ Component templates for quick development
4. ✅ Workspace-wide development standards

**Next:** Configure Claude Desktop to enable React MCP, then start building components with built-in design guidance! 🚀
