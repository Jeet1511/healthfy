# Design & Development Integration

## Overview

You now have:
1. **Design System** - UI/UX principles from the design library
2. **React MCP** - Claude AI assistant for development
3. **OMINA Platform** - Your emergency response system

## Workflow

### Step 1: Design Phase
Reference the design library principles in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md):
- Review UI/UX guidelines
- Check mobile design patterns
- Apply accessibility standards

### Step 2: Development Phase  
Use React MCP with Claude to implement:
- Ask Claude to create components following DESIGN_SYSTEM.md
- Request TypeScript for type safety
- Have Claude add tests

**Example Claude Prompt:**
```
Using react-mcp, create an Emergency Profile component that:
1. Follows the color palette in DESIGN_SYSTEM.md
2. Includes emergency contact fields
3. Has a save button styled with the Primary red color
4. Is fully responsive for mobile devices
```

### Step 3: Review & Refine
- Check against DESIGN_SYSTEM.md guidelines
- Validate with design library principles
- Iterate with Claude's help

## File Structure

```
mem2/
├── DESIGN_SYSTEM.md              ← Design principles & guidelines
├── REACT_MCP_SETUP.md            ← MCP configuration guide
├── client/src/
│   ├── components/               ← Use MCP to generate these
│   ├── styles.css                ← Reference DESIGN_SYSTEM colors
│   └── pages/
├── server/                        ← Back-end API
├── react-mcp-agent/              ← Claude AI Integration
│   ├── index.js
│   ├── logs/
│   └── package.json
└── README.md
```

## Using React MCP in Claude

### Connect React MCP in Claude Desktop

1. Install Claude Desktop (if not already)
2. Follow steps in [REACT_MCP_SETUP.md](REACT_MCP_SETUP.md)
3. Restart Claude Desktop

### Ask Claude to Design & Build

**Template Prompt:**
```
I'm building an emergency response app called OMINA. 

Design requirements from DESIGN_SYSTEM.md:
- Use Primary Red (#DC2626) for emergency features
- Mobile-first responsive design
- WCAG 2.1 accessibility compliance
- [Your specific requirement]

Using react-mcp, please:
1. Create/Update [Component Name]
2. Ensure it follows the design system
3. Add TypeScript types
4. Include error handling

The component should be placed in: [path]
```

## Design Library Resources

Browse design patterns at:
- **Interaction Design**: Animations & transitions
- **Mobile Design**: Touch interactions & responsive
- **Style Guides**: Consistency & branding
- **User Experience**: Information architecture
- **Accessibility**: Usability for all users

Download from: https://github.com/justinhartman/ui-ux-design-library

## AI-Powered Development Tips

1. **Ask Claude to:**
   - Generate components following design system
   - Refactor existing components for better UX
   - Add accessibility features
   - Create responsive designs
   - Write tests and documentation

2. **Provide Context:**
   - Link to DESIGN_SYSTEM.md in your prompts
   - Share the specific design guidelines
   - Include accessibility requirements
   - Mention target devices/browsers

3. **Iterate Fast:**
   - Ask for UI mockups
   - Request code changes
   - Test on different screen sizes
   - Refine based on feedback

## Example: Building Emergency Button

### 1. Design Phase
Review [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md):
- Button color: Medical Red (#DC2626)
- Min size: 48px (touch-friendly)
- Label: Clear and urgent

### 2. Ask Claude:
```
Using react-mcp, create an EmergencyButton component that:
- Uses #DC2626 red for visibility
- Has a minimum 48px size for mobile
- Shows loading state during submission
- Follows DESIGN_SYSTEM.md guidelines
- Includes TypeScript types
- Is fully accessible (WCAG 2.1)
```

### 3. Claude delivers:
- Component code
- Styles matching design system
- Tests
- Accessibility improvements

### 4. Deploy:
- Component ready to use
- Consistent with design system
- Accessible to all users

## Quality Checklist

Before pushing to production:

- [ ] Component follows DESIGN_SYSTEM.md
- [ ] Mobile-responsive (tested on devices)
- [ ] Accessible (keyboard navigation, color contrast)
- [ ] Performance optimized
- [ ] Error handling included
- [ ] Tests written
- [ ] Documentation updated

## Next Mission

1. **Pick a component** (e.g., EmergencyPage, AssistancePanel)
2. **Reference DESIGN_SYSTEM.md**
3. **Open Claude Desktop**
4. **Ask Claude to improve/create it using react-mcp**
5. **Test and deploy**

---

This setup creates a **Design → AI → Code → Deploy** pipeline for OMINA! 🚀
