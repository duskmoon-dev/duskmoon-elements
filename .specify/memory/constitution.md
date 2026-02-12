<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Modified principles:
  - Principle V: "Accessibility and Theming" updated --dm-* prefix to --color-* naming
Added sections:
  - Principle VI: Design System Bridge (new principle)
  - Project Mission statement
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ No changes needed (generic template)
  - .specify/templates/spec-template.md: ✅ No changes needed (generic template)
  - .specify/templates/tasks-template.md: ✅ No changes needed (generic template)
Follow-up TODOs: None
-->

# DuskMoon Elements Constitution

## Project Mission

DuskMoon Elements is a custom web components library that bridges the design system defined in
`@duskmoon-dev/core` to real-world projects. It provides framework-agnostic, reusable UI
components that consume and apply the core design tokens (colors, typography, spacing) through
native Web Components APIs.

## Core Principles

### I. Web Standards First

DuskMoon Elements MUST be built using native Web Components APIs without framework dependencies.

- All elements MUST use Custom Elements v1 and Shadow DOM v1 specifications
- Elements MUST NOT require any JavaScript framework (React, Vue, Angular, etc.) to function
- Elements MUST be usable in any environment that supports modern web standards
- Styling MUST use Constructable Stylesheets and CSS custom properties for theming

**Rationale**: Framework independence ensures maximum compatibility and longevity. Native APIs
have stable browser support and avoid ecosystem churn.

### II. BaseElement Pattern

Every custom element MUST extend the `BaseElement` class from `@duskmoon-dev/el-base`.

- Elements MUST use the reactive properties system via static `properties` definition
- Elements MUST implement the `render()` method for declarative templating
- Elements MUST use `attachStyles()` for component-specific CSS
- Elements MUST export a `register()` function for explicit custom element registration

**Rationale**: Consistent patterns across all elements reduce cognitive load and make the
library predictable for consumers.

### III. Package Independence

Each element MUST be published as an independent, tree-shakable package.

- Package naming: `@duskmoon-dev/el-<name>` for npm, `<el-dm-<name>>` for custom element tag
- Elements MUST only depend on `@duskmoon-dev/el-base` (no cross-element dependencies)
- Each package MUST build to both ESM and CJS formats with TypeScript declarations
- Packages MUST be independently installable and usable

**Rationale**: Tree-shaking support and independent packages minimize bundle size for consumers
who only need specific elements.

### IV. Type Safety

All code MUST be written in TypeScript with strict type checking enabled.

- TypeScript `strict` mode MUST be enabled in all packages
- Public APIs MUST have explicit type annotations
- Element properties MUST use `declare` for TypeScript-defined reactive properties
- All packages MUST export type declarations

**Rationale**: TypeScript provides compile-time safety, better IDE support, and serves as
living documentation for the API.

### V. Accessibility and Theming

Elements MUST be accessible and customizable through CSS custom properties.

- Elements MUST follow WAI-ARIA guidelines where applicable
- All interactive elements MUST be keyboard navigable
- Theming MUST use CSS custom properties with `--color-*` naming convention (inherited from
  `@duskmoon-dev/core`)
- CSS custom properties MUST inherit from the light DOM; elements MUST NOT define fallback
  values that create self-referential declarations in Shadow DOM
- Default theme values are provided by `@duskmoon-dev/core` and consumed by elements

**Rationale**: Accessibility is non-negotiable for a component library. CSS custom properties
provide a stable theming API without JavaScript overhead. Inheriting from light DOM ensures
consistent theming across the application.

### VI. Design System Bridge

Elements MUST consume and apply CSS styles from `@duskmoon-dev/core`.

- Elements MUST use class-based styling from `@duskmoon-dev/core` (e.g., `.btn`, `.card`,
  `.input`, `.markdown-body`)
- Elements MUST NOT duplicate or override core design tokens; they MUST inherit them
- CSS layers from `@duskmoon-dev/core` MUST be stripped (via `stripLayers: true`) for Shadow
  DOM compatibility
- Version updates to `@duskmoon-dev/core` SHOULD be tested and adopted promptly

**Rationale**: This library exists to bridge the design system to real projects. Consuming
styles from `@duskmoon-dev/core` ensures visual consistency and reduces maintenance burden.
Changes to the design system automatically propagate to all elements.

## Technology Standards

### Required Technologies

- **Runtime**: Bun (v1.0+) for development, testing, and building
- **Language**: TypeScript (ES2022+ target)
- **Package Manager**: Bun workspaces for monorepo management
- **Build Output**: Dual ESM/CJS with `.d.ts` type declarations
- **Design System**: `@duskmoon-dev/core` for CSS styles and design tokens

### Browser Support

Elements MUST support:
- Chrome/Edge 84+
- Firefox 101+
- Safari 16.4+

### Code Quality

- ESLint MUST pass with zero errors before merge
- Prettier MUST format all source files
- TypeScript MUST compile with zero errors

## Development Workflow

### Build Order

The core package (`@duskmoon-dev/el-base`) MUST be built before any element packages due to
TypeScript project references.

```bash
bun run build:base   # First
bun run build:elements  # Second
```

### Package Structure

Each element package MUST follow this structure:

```
elements/<name>/
├── src/
│   ├── index.ts           # Exports element class and register()
│   └── el-dm-<name>.ts    # Element implementation
├── package.json
├── tsconfig.json
└── README.md
```

### Commit Standards

- Commits MUST use semantic commit messages (feat, fix, docs, refactor, test, chore)
- Breaking changes MUST be clearly marked in commit messages

## Governance

### Amendment Process

1. Propose changes via pull request modifying this constitution
2. Changes MUST be reviewed and approved before merge
3. Version number MUST be updated according to semantic versioning:
   - MAJOR: Backward-incompatible principle changes or removals
   - MINOR: New principles or material expansions
   - PATCH: Clarifications and wording fixes

### Compliance

- All pull requests MUST comply with these principles
- CLAUDE.md provides runtime development guidance and MUST align with this constitution
- Deviations require explicit justification in the PR description

**Version**: 1.1.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2026-01-05
