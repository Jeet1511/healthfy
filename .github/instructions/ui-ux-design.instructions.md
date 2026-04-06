---
name: ui-ux-design-guidelines
description: "Use when: creating components, updating UI, designing interfaces, working on accessibility, ensuring design consistency. Applies to all React component development in OMINA platform."
applyTo: "client/**/*.{jsx,tsx,css}"
---

# OMINA UI/UX Design Guidelines

**You are assisting with the OMINA emergency response platform. All components MUST follow these design principles.**

## Core Principles

### 1. Mobile-First & Accessibility
- Design for smallest screens first (mobile phones)
- WCAG 2.1 AA compliance mandatory
- Touch targets minimum 48px × 48px
- Color contrast ratio ≥ 4.5:1 for text
- Keyboard navigation support required
- Screen reader friendly (semantic HTML)

### 2. Emergency Context
- Users are in stressful situations
- Minimize cognitive load (simple, clear actions)
- Fast feedback for all interactions
- Clear status indicators
- Emergency features must be immediately visible

### 3. Information Hierarchy
- Most critical info at top/center
- Progressive disclosure for secondary details
- Clear visual distinction between action types
- Scannable layouts for quick comprehension

## Color Palette

| Name | Value | Usage |
|------|-------|-------|
| Primary Red | #DC2626 | Emergency actions, SOS button, critical alerts |
| Safety Blue | #2563EB | Non-emergency assistance, information |
| Success Green | #16A34A | Confirmations, safe status |
| Warning Orange | #EA580C | Warnings, cautions |
| Neutral Gray | #6B7280 | Secondary actions, disabled states |

## Typography

- **Headings**: Bold, 24-32px (scale to device)
- **Body Text**: Regular, 16px base (minimum 14px)
- **UI Labels**: Medium, 14px
- **Line Height**: 1.5 for body, 1.3 for headings
- **Font Family**: System fonts preferred (faster loading)

## Component Requirements

### Emergency Buttons
```jsx
// REQUIRED for all emergency actions
- Background: #DC2626
- Text: White
- Size: 56px+ (not 48px minimum - needs extra visibility)
- Rounded: 8px
- Hover: Darker shade (#991B1B)
- Loading state: Spinner with clear feedback
- No tooltips on mobile (use hints below button)
```

### Forms
- Label: Always visible (not placeholder-only)
- Error text: Red #DC2626, below field
- Success feedback: Green #16A34A
- Required fields: Marked with red asterisk
- Helper text: Gray #6B7280, below label

### Maps & Locations
- Touch gestures supported (pinch zoom, drag)
- Satellite view option for disaster areas
- Current location indicator (blue dot)
- Clear markers with proper contrast
- No map controls hidden on mobile

### Modals & Overlays
- Dismissible via back button / escape key
- Focus trapped inside modal
- Darkened backdrop (opacity: 0.5)
- Content scrollable if height exceeds screen

## Layout Patterns

### Responsive Breakpoints
- Mobile: 320px - 640px (primary)
- Tablet: 641px - 1024px (secondary)
- Desktop: 1025px+ (optional, not required)

### Safe Areas
- Padding: 16px minimum on mobile
- Buttons: Full width on mobile (unless grouped)
- Centered content max-width: 480px on mobile

### Navigation
- Bottom tab bar on mobile (thumb-friendly)
- Top navigation on desktop
- Active state clear and visible
- Icon + Label combination

## Accessibility Checklist

Before submitting any component:
- [ ] Semantic HTML used (buttons, links, labels)
- [ ] Color not sole indicator of meaning
- [ ] Focus visible on all interactive elements
- [ ] Images have alt text
- [ ] Forms properly labeled with `<label>` tags
- [ ] Error messages clear and associated with fields
- [ ] Loading/disabled states clear
- [ ] Touch targets ≥ 48px
- [ ] Text readable (color contrast, font size)
- [ ] Keyboard navigable (Tab, Enter, Escape)

## Performance

- Bundle size per component: < 50KB
- Lazy load images
- CSS-in-JS or CSS modules (not global styles)
- Use React.memo for expensive renders
- Avoid layout shifts (reserve space for images/ads)

## Testing Requirements

- Test on real mobile devices (not just Chrome DevTools)
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Test keyboard navigation (Tab, Enter, Escape, Arrow keys)
- Test dark mode if supported
- Performance audit: Lighthouse score ≥ 85

## Common Anti-Patterns ❌

1. **Hero images without overlay** - Text not readable
2. **Time-based alerts** - Dismissed before user can read
3. **Gesture-only controls** - No keyboard alternative
4. **Color-coded status** - Color-blind users can't see
5. **Hover states only** - Mobile users can't access
6. **Disabled form submission** - No feedback on why
7. **Tiny text links** - Users click wrong target
8. **Auto-playing video/audio** - Annoys users, fails accessibility

## Reference Files

- Design system details: `docs/DESIGN_SYSTEM.md`
- Color palette reference: `docs/DESIGN_SYSTEM.md` (Colors section)
- Mobile patterns: See design library mobile-design folder
- Accessibility guide: https://www.w3.org/WAI/WCAG21/quickref/

---

**Ask me**: "Let's review this component against UI/UX guidelines" or "Create a component following OMINA design standards"
