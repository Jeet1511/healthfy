# OMINA VS Code Copilot Configuration Index

## 📋 Quick Reference

### Main Configuration
- **`.github/copilot-instructions.md`** — Start here! Main VS Code Copilot config

### Instructions (Auto-Applied)
- **`.github/instructions/ui-ux-design.instructions.md`** — Auto-applies to `client/**/*.{jsx,tsx,css}`

### Skills (Invokable)
- **`.github/skills/ui-ux-design/SKILL.md`** — UI/UX design skill
- **`.github/skills/ui-ux-design/README.md`** — Skill quick start
- **`.github/skills/ui-ux-design/component-templates.md`** — Code templates

### Agents & Prompts
- **`.github/AGENTS.md`** — MCP integration specs
- **`.github/prompts/ui-ux-pro-max/PROMPT.md`** — Advanced prompts

### Workspace Standards
- **`copilot-instructions.md`** — Workspace-level guidelines (root)
- **`SETUP_COMPLETE.md`** — Setup summary and next steps

## 🚀 Getting Started

### For VS Code Copilot
1. Open `.github/copilot-instructions.md`
2. Ask Copilot: "Create a component following OMINA design"
3. Design system applies automatically!

### For Claude Desktop (React MCP)
1. See `.github/AGENTS.md` for MCP config
2. Edit `%APPDATA%\Claude\claude_desktop_config.json`
3. Add React MCP server config
4. Ask: "Using react-mcp, create..."

## 📁 File Organization

```
.github/
├── copilot-instructions.md    ← Main VS Code Copilot config
├── instructions/
│   └── ui-ux-design.instructions.md
├── skills/
│   └── ui-ux-design/
│       ├── SKILL.md
│       ├── README.md
│       └── component-templates.md
├── prompts/
│   └── ui-ux-pro-max/
│       └── PROMPT.md
├── AGENTS.md
└── INDEX.md                   ← You are here
```

## 🎯 What Each File Does

| File | Purpose | Auto-Applied? | When to Use |
|------|---------|---|---|
| `copilot-instructions.md` | Main config | No | Read first, reference often |
| `instructions/*.md` | Design rules | ✅ Always | Editing components auto-applies |
| `skills/*/SKILL.md` | Skill reference | Manual | Ask Copilot to use UI/UX skill |
| `prompts/*/PROMPT.md` | Advanced prompts | No | For complex component creation |
| `AGENTS.md` | MCP specs | No | Setting up Claude Desktop |

## 💡 Quick Commands

### VS Code Copilot
```
"Create a SafetyButton component"
"Review this for accessibility"
"Make this mobile-responsive"
```

### With React MCP (Claude)
```
"Using react-mcp, create [Component]: ... (specifications)"
```

### Design System Reference
```
"What are the OMINA colors?"
"Show me an accessible button pattern"
"How do I make a form WCAG compliant?"
```

## ✅ Verification

Configuration is ready when:
- ✅ Instruction files have YAML frontmatter with `applyTo` patterns
- ✅ Skill files have YAML frontmatter with descriptions
- ✅ Files organized in `.github/` directory
- ✅ Component templates reference design system
- ✅ MCP agent specs documented

**Status**: ✅ All systems configured and ready!

## 🔗 Related Documentation

- **Design System**: `docs/DESIGN_SYSTEM.md`
- **MCP Setup**: `docs/REACT_MCP_SETUP.md`
- **Network Access**: `docs/NETWORK_TROUBLESHOOTING.md`
- **Workspace Standards**: `copilot-instructions.md` (root)

---

**For help**: Read the file referenced in your error or ask Copilot: "How do I set up VS Code Copilot for OMINA?"
