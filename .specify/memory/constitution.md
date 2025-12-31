<!--
Sync Impact Report
==================
Version change: N/A (initial) → 1.0.0
Added sections:
  - Core Principles (5 principles)
  - Technology Standards
  - Development Workflow
  - Governance
Templates requiring updates:
  - .specify/templates/plan-template.md: ✅ No changes needed (generic template)
  - .specify/templates/spec-template.md: ✅ No changes needed (generic template)
  - .specify/templates/tasks-template.md: ✅ No changes needed (generic template)
Follow-up TODOs: None
-->

# DuskMoon Elements Constitution

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

Every custom element MUST extend the `BaseElement` class from `@duskmoon-dev/el-core`.

- Elements MUST use the reactive properties system via static `properties` definition
- Elements MUST implement the `render()` method for declarative templating
- Elements MUST use `attachStyles()` for component-specific CSS
- Elements MUST export a `register()` function for explicit custom element registration

**Rationale**: Consistent patterns across all elements reduce cognitive load and make the
library predictable for consumers.

### III. Package Independence

Each element MUST be published as an independent, tree-shakable package.

- Package naming: `@duskmoon-dev/el-<name>` for npm, `<el-dm-<name>>` for custom element tag
- Elements MUST only depend on `@duskmoon-dev/el-core` (no cross-element dependencies)
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
- Theming MUST use CSS custom properties with `--dm-*` prefix
- Default theme values MUST be provided but overridable

**Rationale**: Accessibility is non-negotiable for a component library. CSS custom properties
provide a stable theming API without JavaScript overhead.

## Technology Standards

### Required Technologies

- **Runtime**: Bun (v1.0+) for development, testing, and building
- **Language**: TypeScript (ES2022+ target)
- **Package Manager**: Bun workspaces for monorepo management
- **Build Output**: Dual ESM/CJS with `.d.ts` type declarations

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

The core package (`@duskmoon-dev/el-core`) MUST be built before any element packages due to
TypeScript project references.

```bash
bun run build:core   # First
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

**Version**: 1.0.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2025-12-31
