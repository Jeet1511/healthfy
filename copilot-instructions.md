---
name: omina-development
description: "OMINA platform development guidelines. Includes design system, testing standards, and code organization."
applyTo: "**/*.{js,jsx,ts,tsx,css}"
---

# OMINA Platform Development Guidelines

These guidelines apply to all code in the OMINA platform.

## 📋 Table of Contents

1. Code Organization
2. Component Standards
3. Testing Requirements
4. Naming Conventions
5. Git Practices

## 📁 Code Organization

### Directory Structure

```
client/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page-level components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API calls, utilities
│   ├── context/          # Context providers
│   ├── styles/           # Global styles
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript types
│   └── App.jsx           # Root component
```

### Naming Conventions

- **Components**: PascalCase (`SOSButton.jsx`)
- **Hooks**: camelCase starting with `use` (`useEmergencyState.js`)
- **Utilities**: camelCase (`formatPhoneNumber.js`)
- **Constants**: UPPER_SNAKE_CASE (`API_TIMEOUT = 5000`)
- **CSS Classes**: kebab-case (`.button-primary`)

## 🎨 Component Standards

All components MUST:

1. **Be Accessible** - WCAG 2.1 compliant
2. **Be Mobile-First** - Work on 320px width first
3. **Follow Design System** - Use approved colors, typography
4. **Have TypeScript** - Types for props
5. **Be Tested** - Unit + integration tests
6. **Be Documented** - PropTypes or comments

### Component Template

```jsx
import React, { FC } from 'react';

interface MyComponentProps {
  title: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * MyComponent - Brief description
 * 
 * Accessible, mobile-first component following OMINA design system
 */
export const MyComponent: FC<MyComponentProps> = ({
  title,
  onClick,
  disabled = false
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      aria-label={title}
    >
      {title}
    </button>
  );
};
```

## ✅ Testing Requirements

- **Unit Tests**: All utilities and hooks
- **Component Tests**: User interactions
- **Integration Tests**: Component + API
- **Accessibility Tests**: Keyboard nav, screen reader
- **Target**: 80%+ code coverage

## 🔧 Git Practices

### Branch Naming
```
feature/component-name
fix/bug-description
docs/what-changed
```

### Commit Messages
```
feat: add emergency button component
fix: resolve API timeout issue
chore: update dependencies
docs: add accessibility guidelines
```

### PR Requirements
- [ ] Tests passing
- [ ] No console errors
- [ ] Accessibility checked
- [ ] Design guidelines followed
- [ ] Documentation updated

## 🎯 Performance Targets

- Lighthouse Score: ≥ 85
- First Contentful Paint: < 3s
- Largest Contentful Paint: < 4s
- Cumulative Layout Shift: < 0.1

## 🔐 Security

- No hardcoded API keys
- Sanitize user input
- Use HTTPS only
- Validate on frontend + backend
- Keep dependencies updated

## 📚 References

- **Design System**: See `.github/skills/ui-ux-design/SKILL.md`
- **MCP Setup**: See `docs/REACT_MCP_SETUP.md`
- **Network Sharing**: See `docs/NETWORK_TROUBLESHOOTING.md`

---

**Questions?** Check the docs or ask Claude with: "How do I follow OMINA development standards for..."
