---
name: "UI/UX Design Skill"
description: "Use when: need to create accessible, mobile-first React components following OMINA design system; working on emergency UI elements; ensuring WCAG compliance; reviewing component designs; building responsive interfaces."
---

# UI/UX Design Skill for OMINA

This skill helps you build beautiful, accessible, and mobile-first components for the OMINA emergency response platform.

## What You Can Ask

### 1. **Create Components with Design System**
```
Create an EmergencyContactsPanel component that:
- Lists emergency contacts
- Shows emergency status
- Allows quick calling
- Follows OMINA design system
- WCAG 2.1 compliant
- Mobile-first responsive
```

### 2. **Review & Improve Designs**
```
Review this component against OMINA UI/UX guidelines:
[paste component code]

Check for:
- Accessibility issues
- Mobile responsiveness
- Design system consistency
- Touch target sizes
```

### 3. **Color & Typography Updates**
```
Update component colors to use OMINA palette:
- Emergency actions: #DC2626 red
- Regular assistance: #2563EB blue
- Success states: #16A34A green
```

### 4. **Accessibility Audits**
```
Audit this component for WCAG 2.1 compliance:
[paste code]

Check: keyboard nav, color contrast, semantic HTML, labels, screen reader
```

### 5. **Mobile Optimization**
```
Make this form mobile-friendly:
- 48px+ touch targets
- Single column layout on mobile
- Bottom button placement
- Clear error messages
```

## Design System Colors

| Color | Value | Use Case |
|-------|-------|----------|
| 🔴 Primary Red | #DC2626 | Emergency SOS button, critical alerts |
| 🔵 Safety Blue | #2563EB | Assistance requests, safe status |
| 🟢 Success Green | #16A34A | Confirmations, completed actions |
| 🟠 Warning Orange | #EA580C | Warnings, cautions |
| ⚫ Neutral Gray | #6B7280 | Disabled, secondary actions |

## Component Patterns

### Emergency Button Pattern
```jsx
<button 
  className="bg-red-600 text-white px-6 py-4 rounded-lg text-lg font-semibold min-w-[56px]"
  onClick={handleSOSClick}
  disabled={isLoading}
>
  {isLoading ? <Spinner /> : "Send SOS"}
</button>
```

### Form Field Pattern
```jsx
<div className="mb-4">
  <label htmlFor="email" className="block text-sm font-medium mb-2">
    Email Address <span className="text-red-600">*</span>
  </label>
  <input
    id="email"
    type="email"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base"
    aria-label="Email address"
    aria-describedby="email-error"
    required
  />
  {error && <p id="email-error" className="text-red-600 text-sm mt-1">{error}</p>}
</div>
```

### Touch-Friendly Layout
```jsx
<div className="p-4 space-y-4">
  {/* Top navigation */}
  <header className="flex justify-between items-center">
    <h1 className="text-2xl font-bold">Emergency</h1>
    <button className="p-2 text-2xl">⚙️</button>
  </header>

  {/* Main content - full width on mobile */}
  <main className="space-y-6">
    <button className="w-full bg-red-600 text-white py-4 rounded-lg text-lg">
      🚨 Send SOS
    </button>
  </main>

  {/* Bottom tab bar - 48px minimum height */}
  <nav className="flex justify-around items-center h-16 border-t">
    <button className="flex flex-col items-center gap-1">📍 Map</button>
    <button className="flex flex-col items-center gap-1">✋ Safety</button>
    <button className="flex flex-col items-center gap-1">👤 Profile</button>
  </nav>
</div>
```

## Mobile-First Breakpoints

```css
/* Mobile-first approach */
@media (min-width: 641px) {
  /* Tablet+ styles */
}

@media (min-width: 1025px) {
  /* Desktop styles */
}
```

## Accessibility Quick Checklist

- ✅ Semantic HTML (`<button>`, `<nav>`, `<main>`, `<label>`)
- ✅ Color contrast ≥ 4.5:1
- ✅ Touch targets ≥ 48px
- ✅ Keyboard navigable (Tab, Enter, Escape)
- ✅ Focus visible
- ✅ Alt text on images
- ✅ Form labels associated with inputs
- ✅ Error messages clear and helpful
- ✅ No "click here" links (descriptive text)
- ✅ Loading states have visual feedback

## Performance Tips

1. Use CSS modules (not inline styles for performance)
2. Lazy load images: `<img loading="lazy" />`
3. Code split large components
4. Use React.memo() for expensive renders
5. Minimize bundle size per component

## Files to Reference

- **Design Details**: `docs/DESIGN_SYSTEM.md`
- **Troubleshooting**: `docs/NETWORK_TROUBLESHOOTING.md`
- **React MCP Setup**: `docs/REACT_MCP_SETUP.md`

## Quick Commands with React MCP

After React MCP is configured, ask Claude:

```
Using react-mcp, create a SafetyPanel component following OMINA design system.
Include TypeScript types and pass WCAG 2.1 audit.
Save to: client/src/components/SafetyPanel.jsx
```

---

**Start with**: "Let's design an accessible emergency button that works great on mobile"
