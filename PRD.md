# Product Requirements Document (PRD)

## DuskMoon Elements

**Version:** 0.5.1
**Last Updated:** January 2026
**Status:** Active Development

---

## 1. Executive Summary

DuskMoon Elements is a comprehensive, lightweight web components library providing 30+ customizable UI elements built with vanilla TypeScript and Shadow DOM. The library enables developers to build modern, accessible, and themeable user interfaces without framework lock-in.

**Key Value Propositions:**
- Zero framework dependencies - works with React, Vue, Angular, Svelte, or vanilla HTML
- Tree-shakable architecture - import only the components you need
- Built-in theming with light/dark mode support
- Accessible by default with ARIA attributes and keyboard navigation
- Modern browser features (Shadow DOM, Constructable Stylesheets, oklch colors)

---

## 2. Problem Statement

### Current Challenges

1. **Framework Lock-in:** Traditional component libraries (Material UI, Ant Design, Chakra) are tightly coupled to specific frameworks, making migration costly and limiting interoperability.

2. **Bundle Size:** Monolithic UI libraries force developers to include unused components, bloating bundle sizes and degrading performance.

3. **Inconsistent Theming:** Implementing consistent theming across components often requires complex CSS overrides or JavaScript solutions.

4. **Accessibility Debt:** Many UI libraries treat accessibility as an afterthought, requiring significant additional work to meet WCAG standards.

5. **Style Encapsulation:** Global CSS conflicts cause unpredictable styling issues, especially in micro-frontend architectures.

### Solution

DuskMoon Elements addresses these challenges by:
- Using native Web Components for true framework independence
- Publishing individual packages for optimal tree-shaking
- Leveraging CSS custom properties for consistent, easily customizable theming
- Building accessibility into every component from the ground up
- Using Shadow DOM for complete style encapsulation

---

## 3. Goals and Objectives

### Primary Goals

| Goal | Success Criteria |
|------|------------------|
| Framework Independence | Works identically across React, Vue, Angular, Svelte, and vanilla HTML |
| Minimal Bundle Impact | Individual component packages < 5KB gzipped |
| Accessibility Compliance | WCAG 2.1 AA compliance for all interactive components |
| Theme Flexibility | Full customization via CSS custom properties |
| Developer Experience | < 5 minutes from install to first working component |

### Secondary Goals

- Comprehensive documentation with interactive examples
- TypeScript-first development with full type safety
- Consistent API patterns across all components
- Support for form integration and validation

---

## 4. Target Users

### Primary Users

**Frontend Developers**
- Need production-ready UI components
- Work across multiple frameworks or vanilla JavaScript
- Value accessibility and performance
- Prefer TypeScript for type safety

**Design System Teams**
- Building internal component libraries
- Need a foundation to customize and extend
- Require consistent theming across products

### Secondary Users

**Full-Stack Developers**
- Building MVPs or internal tools quickly
- Don't want to manage complex frontend build configurations
- Need components that "just work" with minimal setup

**Enterprise Teams**
- Managing micro-frontend architectures
- Need style isolation between independently deployed applications
- Require framework-agnostic shared components

---

## 5. Product Features

### 5.1 Component Categories

#### Input Components (10)

| Component | Tag | Key Features |
|-----------|-----|--------------|
| Button | `<el-dm-button>` | 9 variants, 4 sizes, loading state, icon slots |
| Input | `<el-dm-input>` | Validation, helper text, multiple types |
| Switch | `<el-dm-switch>` | Animated toggle, 7 colors, label positioning |
| Slider | `<el-dm-slider>` | Range selection, keyboard nav, value display |
| Select | `<el-dm-select>` | Dropdown selection, search, multi-select |
| Cascader | `<el-dm-cascader>` | Multi-level hierarchical selection |
| Autocomplete | `<el-dm-autocomplete>` | Search suggestions, async loading |
| Datepicker | `<el-dm-datepicker>` | Calendar UI, range selection, localization |
| File Upload | `<el-dm-file-upload>` | Drag & drop, file preview, progress |
| Form | `<el-dm-form>` | Validation, field grouping, submission handling |

#### Feedback Components (6)

| Component | Tag | Key Features |
|-----------|-----|--------------|
| Alert | `<el-dm-alert>` | 4 variants, dismissible, icons |
| Dialog | `<el-dm-dialog>` | Modal/non-modal, native dialog API |
| Badge | `<el-dm-badge>` | Counter, status indicator, positioning |
| Chip | `<el-dm-chip>` | Tags, removable, clickable |
| Tooltip | `<el-dm-tooltip>` | Hover/focus trigger, positioning |
| Progress | `<el-dm-progress>` | Bar, circular, indeterminate |

#### Navigation Components (8)

| Component | Tag | Key Features |
|-----------|-----|--------------|
| Tabs | `<el-dm-tabs>` | Horizontal/vertical, lazy loading |
| Menu | `<el-dm-menu>` | Dropdown, context menu, nested |
| Navbar | `<el-dm-navbar>` | Responsive, sticky, slots |
| Drawer | `<el-dm-drawer>` | Side panel, overlay, positions |
| Breadcrumbs | `<el-dm-breadcrumbs>` | Navigation trail, custom separators |
| Pagination | `<el-dm-pagination>` | Page controls, size selector |
| Stepper | `<el-dm-stepper>` | Wizard flow, validation gates |
| Bottom Navigation | `<el-dm-bottom-navigation>` | Mobile nav bar, icons |

#### Surface Components (4)

| Component | Tag | Key Features |
|-----------|-----|--------------|
| Card | `<el-dm-card>` | 3 variants, slots, interactive mode |
| Accordion | `<el-dm-accordion>` | Collapsible sections, single/multi expand |
| Popover | `<el-dm-popover>` | Floating content, triggers, positioning |
| Bottom Sheet | `<el-dm-bottom-sheet>` | Mobile drawer, snap points |

#### Data Display Components (2)

| Component | Tag | Key Features |
|-----------|-----|--------------|
| Table | `<el-dm-table>` | Sorting, filtering, pagination |
| Markdown | `<el-dm-markdown>` | Syntax highlighting, mermaid diagrams |

### 5.2 Core Features

#### BaseElement Foundation
```typescript
- Shadow DOM encapsulation
- Reactive property system with attribute reflection
- Batched microtask updates for performance
- Event emission with custom events
- Lifecycle management (connected/disconnected callbacks)
```

#### Styling System
```typescript
- css() template tag for type-safe styles
- combineStyles() for style composition
- Constructable StyleSheets for optimal performance
- CSS custom properties for theming
```

#### Accessibility
```typescript
- ARIA attributes on all interactive elements
- Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Focus management and visible focus indicators
- Screen reader announcements
- Reduced motion support
```

---

## 6. Technical Architecture

### 6.1 Package Structure

```
@duskmoon-dev/
├── el-core           # Base utilities, theming, BaseElement class
├── el-button         # Individual component packages
├── el-input          # (30 packages total)
├── ...
└── elements          # Bundle package (all components)
```

### 6.2 Build Outputs

Each package produces:
- **ESM** (`dist/esm/`) - Modern ES modules
- **CJS** (`dist/cjs/`) - CommonJS compatibility
- **Types** (`dist/types/`) - TypeScript declarations

### 6.3 Technology Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript 5.7+ (ES2022 target) |
| Runtime | Bun 1.0+ |
| Build | Bun bundler |
| Docs | Astro 5.x + MDX |
| Playground | Vite 6.x |
| Testing | Bun test + happy-dom |
| Linting | ESLint + typescript-eslint |
| Formatting | Prettier |

### 6.4 Browser Requirements

| Feature | Minimum Version |
|---------|-----------------|
| Chrome/Edge | 111+ |
| Firefox | 113+ |
| Safari | 16.4+ |

**Required APIs:**
- Custom Elements v1
- Shadow DOM v1
- Constructable Stylesheets
- CSS oklch() color function

---

## 7. Design System

### 7.1 Theme Architecture

**Theme Selection:**
```html
<html data-theme="moonlight">  <!-- Dark theme -->
<html data-theme="sunshine">   <!-- Light theme -->
```

### 7.2 Design Tokens

#### Colors (oklch format)
```css
/* Primary palette */
--color-primary
--color-secondary
--color-tertiary

/* Surface colors */
--color-surface
--color-surface-container
--color-surface-container-high
--color-surface-container-highest

/* Text colors */
--color-on-surface
--color-on-surface-variant

/* Semantic colors */
--color-success
--color-warning
--color-error
--color-info

/* Border colors */
--color-outline
--color-outline-variant
```

#### Typography
```css
--font-family
--font-size-xs | sm | md | lg | xl | 2xl
--font-weight-normal | medium | semibold | bold
--line-height-tight | normal | relaxed
```

#### Spacing
```css
--spacing-xs (0.25rem)
--spacing-sm (0.5rem)
--spacing-md (1rem)
--spacing-lg (1.5rem)
--spacing-xl (2rem)
```

#### Effects
```css
--radius-sm | md | lg | xl | full
--shadow-sm | md | lg
--transition-fast (150ms) | normal (200ms) | slow (300ms)
```

### 7.3 Theme Customization

```css
:root {
  /* Override any token */
  --color-primary: oklch(65% 0.2 280);
  --font-family: 'Inter', sans-serif;
  --radius-md: 0.5rem;
}
```

---

## 8. Installation and Usage

### 8.1 Installation Options

**Individual packages (recommended):**
```bash
npm install @duskmoon-dev/el-button @duskmoon-dev/el-input
```

**Bundle package (all components):**
```bash
npm install @duskmoon-dev/elements
```

### 8.2 Usage Patterns

**Auto-registration:**
```javascript
import '@duskmoon-dev/el-button/register';
```

**Manual registration:**
```javascript
import { ElDmButton, register } from '@duskmoon-dev/el-button';
register(); // or customElements.define('el-dm-button', ElDmButton);
```

**In HTML:**
```html
<el-dm-button variant="primary" size="md">
  Click Me
</el-dm-button>
```

**Framework integration:**
```jsx
// React
<el-dm-button variant="primary" onClick={handleClick}>
  Click Me
</el-dm-button>

// Vue
<el-dm-button :variant="buttonVariant" @click="handleClick">
  Click Me
</el-dm-button>
```

---

## 9. Success Metrics

### 9.1 Adoption Metrics

| Metric | Target |
|--------|--------|
| Weekly npm downloads | 1,000+ |
| GitHub stars | 500+ |
| Active contributors | 5+ |

### 9.2 Quality Metrics

| Metric | Target |
|--------|--------|
| Bundle size (per component) | < 5KB gzipped |
| Lighthouse accessibility score | 100 |
| Test coverage | > 80% |
| TypeScript strictness | strict mode |

### 9.3 Developer Experience

| Metric | Target |
|--------|--------|
| Time to first component | < 5 minutes |
| Documentation coverage | 100% of components |
| Issue response time | < 48 hours |

---

## 10. Roadmap

### Phase 1: Foundation (Completed)
- [x] Core BaseElement class
- [x] 30 component packages
- [x] Dual theme support (moonlight/sunshine)
- [x] Documentation site
- [x] npm publishing workflow

### Phase 2: Enhancement (Current)
- [ ] Animation system
- [ ] Form validation library integration
- [ ] Additional theme presets
- [ ] Component composition patterns
- [ ] Performance optimization

### Phase 3: Ecosystem (Planned)
- [ ] Figma design kit
- [ ] VS Code snippets extension
- [ ] CLI scaffolding tool
- [ ] Framework-specific adapters (React, Vue, Angular)
- [ ] Storybook integration

### Phase 4: Enterprise (Future)
- [ ] RTL (right-to-left) support
- [ ] Advanced data components (DataGrid, Tree)
- [ ] Internationalization (i18n) integration
- [ ] Enterprise theming tools
- [ ] Component analytics

---

## 11. Non-Goals / Out of Scope

The following are explicitly **not** goals for this project:

1. **Server-side rendering** - Components require DOM APIs
2. **Legacy browser support** - No polyfills for IE11 or older browsers
3. **CSS-in-JS runtime** - Styles are static, not dynamically generated
4. **State management** - Components manage local state only
5. **Routing** - Navigation components don't include routing logic
6. **Animation library** - Basic CSS transitions only, no complex animations
7. **Form library** - Validation helpers but not a complete form solution
8. **Icon library** - Slots for icons but no bundled icon set

---

## 12. Appendix

### A. Component API Conventions

**Properties:**
- Use camelCase for multi-word properties: `labelPosition`
- Boolean properties default to `false`
- Reflect important properties to attributes

**Events:**
- Use standard event names: `change`, `input`, `click`
- CustomEvent with `detail` object for data
- Bubbling enabled by default

**Slots:**
- `default` slot for primary content
- Named slots for structured content: `header`, `footer`, `prefix`, `suffix`

**CSS Parts:**
- Expose internal elements via `::part()` for styling
- Use semantic part names: `button`, `input`, `label`

### B. Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

### C. License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.5.1 | Jan 2026 | DuskMoon Team | Initial PRD creation |
