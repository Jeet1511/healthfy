---
name: "OMINA Component Creation"
description: "Use when: Creating new React components for OMINA platform. Provides step-by-step guidance with design system integration."
---

# OMINA Component Creation Prompt

Use this prompt when creating components for the OMINA emergency response platform.

## Template: Create an OMINA Component

```
Create a new OMINA component:

Component Name: [ComponentName]
Purpose: [Brief description what it does]
Props: [List of props needed]
Color Scheme: 
  [ ] Emergency Red (#DC2626) - for SOS/critical alerts
  [ ] Safety Blue (#2563EB) - for assistance/info
  [ ] Success Green (#16A34A) - for confirmations
  [ ] Warning Orange (#EA580C) - for warnings
  [ ] Neutral Gray (#6B7280) - for disabled states

Features:
  [ ] Mobile-first (works on 320px screens)
  [ ] Touch targets ≥ 48px
  [ ] WCAG 2.1 AA compliant
  [ ] Keyboard navigation (Tab, Enter, Escape)
  [ ] TypeScript types
  [ ] Error/loading states
  [ ] JSDoc comments
  [ ] Unit tests

Location: client/src/components/[ComponentName].jsx

Include:
- Component with proper TypeScript interfaces
- Semantic HTML structure
- ARIA labels and roles
- CSS classes for Tailwind
- Error handling
- Loading state
- Accessibility features
```

## Example: Create SafetyButton Component

```
Create a new OMINA component:

Component Name: SafetyButton
Purpose: Call-to-action button for non-emergency assistance requests
Props: label, onClick, isLoading, disabled, size
Color Scheme: [x] Safety Blue (#2563EB)
Features:
  [x] Mobile-first
  [x] Touch targets ≥ 48px
  [x] WCAG 2.1 AA compliant
  [x] Keyboard navigation
  [x] TypeScript types
  [x] Error/loading states
  [x] JSDoc comments
  [x] Unit tests
```

## Component Requirements Checklist

### Accessibility
- [ ] Semantic HTML (`<button>`, `<nav>`, `<form>`, etc.)
- [ ] Proper label associations for form fields
- [ ] ARIA attributes where needed
- [ ] Focus visible (`:focus-visible` or `:focus`)
- [ ] Color contrast ≥ 4.5:1 (text on background)
- [ ] No functionality via hover-only
- [ ] Keyboard complete (Tab, Enter, Escape, Arrow keys)

### Styling
- [ ] Tailwind classes (no inline styles)
- [ ] Mobile-first (smallest screen first)
- [ ] 48px min touch targets
- [ ] Consistent with OMINA palette
- [ ] Dark mode compatible (if applicable)
- [ ] Responsive breakpoints (320, 640, 1024px)

### Functionality
- [ ] Props properly typed (interface)
- [ ] Error handling (try/catch or error boundary)
- [ ] Loading states (spinner, disabled, etc.)
- [ ] Empty states handled
- [ ] No console errors/warnings
- [ ] Proper event handling

### Documentation
- [ ] JSDoc comment block
- [ ] Props documented
- [ ] Return type documented
- [ ] Usage example in comments
- [ ] Accessibility notes

### Testing
- [ ] Unit tests written
- [ ] User interaction tests
- [ ] Keyboard navigation tests
- [ ] Screen reader compatibility verified
- [ ] 80%+ code coverage

## OMINA Color Palette Reference

| Color | Hex | CSS/Tailwind | Usage |
|-------|-----|---------|-------|
| Primary Red | #DC2626 | `bg-red-600` | Emergency/SOS |
| Safety Blue | #2563EB | `bg-blue-600` | Assistance/Info |
| Success Green | #16A34A | `bg-green-600` | Confirmations |
| Warning Orange | #EA580C | `bg-orange-600` | Warnings |
| Neutral Gray | #6B7280 | `bg-gray-600` | Disabled |

## Typography Standards

- **Heading 1**: `text-3xl font-bold` (32px bold)
- **Heading 2**: `text-2xl font-bold` (24px bold)
- **Body**: `text-base` (16px regular)
- **Small**: `text-sm` (14px regular)
- **Line Spacing**: `leading-relaxed` (1.5 for body), `leading-tight` (1.3 for headings)

## Mobile-First Breakpoints

```css
/* Mobile first (no breakpoint needed) */
.component { /* mobile styles */ }

/* Tablet and up (641px+) */
@media (min-width: 641px) { /* tablet+ styles */ }

/* Desktop and up (1025px+) */
@media (min-width: 1025px) { /* desktop styles */ }
```

## Common Patterns

### Emergency Button
```jsx
<button className="w-full md:w-auto px-8 py-4 bg-red-600 text-white rounded-lg font-semibold min-h-[56px]">
  Emergency Action
</button>
```

### Safety Button
```jsx
<button className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium min-h-[48px]">
  Get Help
</button>
```

### Form Field with Label
```jsx
<div className="mb-4">
  <label htmlFor="email" className="block text-sm font-medium mb-2">
    Email <span className="text-red-600">*</span>
  </label>
  <input
    id="email"
    type="email"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
    aria-describedby="email-error"
  />
</div>
```

### Touch-Friendly Bottom Navigation
```jsx
<nav className="fixed bottom-0 left-0 right-0 flex justify-around h-16 border-t">
  {/* Each nav item should be 48px+ */}
  <button className="flex-1 flex items-center justify-center h-full">
    <span>📍</span>
  </button>
</nav>
```

## Performance Tips

1. Use `React.memo()` for expensive renders
2. Lazy load images: `<img loading="lazy" />`
3. CSS modules over inline styles
4. Avoid layout shifts (reserve space for images)
5. Keep component bundle < 50KB

## Before Submitting

- [ ] Component runs without errors
- [ ] Copilot accessibility audit passed
- [ ] Tested on real mobile (not just DevTools)
- [ ] Lighthouse score ≥ 85
- [ ] All tests passing (80%+ coverage)
- [ ] Design system compliance verified
- [ ] Peer review completed

---

**Start creating**: "Let's create an OMINA component..."  
**Need review**: "Review this component for OMINA compliance"
