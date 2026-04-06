# VS Code Copilot Configuration Guide

## ✅ Quick Setup (2 minutes)

### 1. Install GitHub Copilot Extension
- Open VS Code Extensions (`Ctrl+Shift+X`)
- Search: `GitHub Copilot`
- Click **Install** on both:
  - GitHub Copilot
  - GitHub Copilot Chat

### 2. Sign In to GitHub
- VS Code will prompt you
- Click "Sign in with GitHub"
- Authorize the extension

### 3. Verify Settings (Optional)
Copy `.vscode/settings.json` content to your VS Code settings:
- `Ctrl+Shift+P` → "Preferences: Open User Settings JSON"
- Paste the settings

Done! Copilot is now active.

## 🚀 Using OMINA Configuration

### Auto-Applied Design Guidelines
When editing React components in `client/src/components/`, Copilot automatically applies OMINA design guidelines:

```
Open: client/src/components/SOSButton.jsx
Type: Create a button
Copilot suggests: WCAG 2.1 compliant, mobile-first, OMINA colors
```

### Ask Copilot (Inline Suggestions)
Press `Ctrl+Alt+[` for inline suggestions:
- "Create a SafetyButton component"
- "Add accessibility features"
- "Make this WCAG compliant"

### Use Copilot Chat
- **Windows/Linux**: `Ctrl+Shift+I`
- **macOS**: `Cmd+Shift+I`

Then ask:
```
"Create an OMINA component:
- Name: EmergencyPanel
- Follow design system (red #DC2626)
- Mobile-first responsive
- WCAG 2.1 compliant
- TypeScript types"
```

## 📁 Configuration Files

### Auto-Applied (No Setup Needed)
- `.github/instructions/ui-ux-design.instructions.md` — Auto-applies to `client/**/*.jsx`
- `.github/skills/ui-ux-design/SKILL.md` — Available in Copilot Chat

### Custom Prompts
- `.github/prompts/OMINA_COMPONENT_CREATION.md` — Component template
- `.github/prompts/ui-ux-pro-max/PROMPT.md` — Advanced design guide

### Workspace Standards
- `.github/copilot-instructions.md` — Main config file
- `copilot-instructions.md` — Workspace guidelines
- `.github/AGENTS.md` — MCP & agent specs

## 🎯 Common Tasks

### Create Components
```
📝 In Copilot Chat:

"Create an AccessibilityPanel component:
- List accessibility settings
- Toggle switches for features
- Mobile-friendly (48px+ buttons)
- WCAG 2.1 compliant
- Follow OMINA blue (#2563EB)
- Save to: client/src/components/AccessibilityPanel.jsx"
```

### Review Code
```
📝 In Copilot Chat:

"Review this component for OMINA compliance:
[paste code]

Check:
- WCAG 2.1 AA standards
- Touch target sizes (48px minimum)
- Mobile responsiveness (320px start)
- Keyboard navigation
- Color contrast"
```

### Fix Accessibility Issues
```
📝 In Copilot Chat:

"Make this component WCAG 2.1 compliant:
[paste code]

Improve:
- Add ARIA labels
- Keyboard navigation
- Focus states
- Color contrast
- Semantic HTML"
```

### Optimize for Mobile
```
📝 In Copilot Chat:

"Make this form mobile-responsive:
[paste code]

Ensure:
- 48px+ touch targets
- Full-width buttons on mobile
- Single-column layout
- Bottom action buttons
- Clear error messages"
```

## 🔍 Verify Setup

Check that configuration is working:

1. **Open a component file**
   ```
   Open: client/src/components/SOSButton.jsx
   ```

2. **Ask Copilot**
   ```
   Ctrl+Shift+I → "Create a button component"
   ```

3. **Verify response includes:**
   - OMINA design system reference
   - WCAG 2.1 compliance mention
   - Mobile-first approach
   - Color palette reference
   - TypeScript types

If all present → ✅ Setup successful!

## 🐛 Troubleshooting

### "Copilot not suggesting design guidelines"
- Ensure file is in `client/src/components/` directory
- Check file extension is `.jsx` or `.tsx`
- Reload VS Code: `Ctrl+Shift+P` → "Developer: Reload Window"

### "Can't access Copilot Chat"
- Verify GitHub Copilot Chat extension is installed
- Sign out/in to GitHub account
- Windows/Linux: `Ctrl+Shift+I`, macOS: `Cmd+Shift+I`

### "Design system colors not mentioned"
- These are in `.github/instructions/ui-ux-design.instructions.md`
- Copilot may need context: mention "OMINA design" in your prompt
- Ask: "Show me OMINA color palette"

### "Instructions file not recognized"
- Files must be in `.github/` directory
- `.instructions.md` files work best for auto-apply
- Restart VS Code to refresh

## 💡 Pro Tips

1. **Be specific** — "OMINA emergency button" gets better results than "big button"
2. **Reference docs** — Write "see docs/DESIGN_SYSTEM.md" to give context
3. **Use chat for design** — Copilot Chat works best for UI design questions
4. **Review suggestions** — Always check Copilot's code before accepting
5. **Update instructions** — Modify `.github/instructions/` to customize behavior

## 📚 Reference Files

- **Design System**: `docs/DESIGN_SYSTEM.md`
- **Component Library**: `.github/skills/ui-ux-design/component-templates.md`
- **Architecture**: `.github/AGENTS.md`
- **Network Setup**: `docs/NETWORK_TROUBLESHOOTING.md`

## 🚀 Next Steps

1. ✅ Install GitHub Copilot extension
2. ✅ Sign in with GitHub account
3. ✅ Open a component file
4. ✅ Start using Copilot with OMINA design guidance!

---

**Questions?** Ask Copilot: "How do I use OMINA design guidelines?"
