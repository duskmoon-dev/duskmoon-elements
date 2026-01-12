# AGENTS.md

This guide helps agentic coding tools work effectively in this repo.
It reflects the current tooling, scripts, and style seen in the codebase.

## Repository layout

- `packages/core` - BaseElement, CSS helpers, shared types.
- `packages/elements` - Bundle package that re-exports elements.
- `elements/*` - Individual custom element packages (`@duskmoon-dev/el-*`).
- `playground` - Vite playground for manual testing.
- `packages/docs` - Astro documentation site.

## Build, lint, and test commands

All commands use Bun workspaces.
Run them from the repo root unless noted otherwise.

### Install

- `bun install`

### Build

- `bun run build:all` (core -> elements -> bundle)
- `bun run build:core`
- `bun run build:elements`
- `bun run build:bundle`
- `bun run build` (all workspaces)

### Dev

- `bun run dev` (all workspaces)
- `bun run playground`
- `bun run docs:dev`

### Type checking

- `bun run typecheck` (all workspaces)
- `bun run --filter @duskmoon-dev/el-core typecheck`

### Lint and format

- `bun run lint:check`
- `bun run lint:fix`
- `bun run format:check`
- `bun run format`
- `bun run --filter @duskmoon-dev/el-button lint:check`

### Tests

- `bun run test` (all workspaces)
- `bun run --filter @duskmoon-dev/el-button test`
- `bun run --filter @duskmoon-dev/el-button test -- src/el-dm-button.test.ts`
- `bun run --filter @duskmoon-dev/el-button test -- -t "renders slot content"`

### Test notes

- Tests run with `bun:test`.
- `bunfig.toml` preloads `test-setup.ts` (happy-dom globals).
- Coverage output goes to `coverage/`.

## Code style guidelines

### Language and types

- TypeScript `strict` mode, ES2022 target.
- Prefer explicit types for public APIs and class fields.
- Use `declare` for reactive properties on `BaseElement` subclasses.
- Avoid `any`; use `unknown` + narrowing when needed.
- Use `Record<...>` or typed objects for maps.

### Imports

- Use single quotes for strings.
- Use named imports; prefer named exports in runtime modules.
- Keep external imports before local imports.
- Include `.js` extension for local TS imports (e.g. `./el-dm-button.js`).

### Formatting (Prettier)

- `semi: true`
- `singleQuote: true`
- `tabWidth: 2`
- `trailingComma: all`
- `printWidth: 100`
- `bracketSpacing: true`

### Naming conventions

- Custom element tag: `el-dm-<name>`.
- Class name: `ElDm<Name>`.
- Files: `el-dm-<name>.ts`, `index.ts`, `register.ts`.
- Tests: `*.test.ts`.
- Constants: `UPPER_SNAKE_CASE`.
- Private methods: prefix `_` (e.g. `_handleClick`).

### Custom element patterns

- Extend `BaseElement` from `@duskmoon-dev/el-core`.
- Define `static properties` with `type`, `reflect`, `default`.
- Call `super()` then `attachStyles()` in constructors.
- Implement `render()` and return an HTML string template.
- Use `connectedCallback()` and call `super.connectedCallback()`.
- Use `emit()` for custom events when needed.

### Styling

- Define component styles with `css` from `@duskmoon-dev/el-core`.
- Prefer CSS custom properties from the core theme.
- When importing core styles, strip `@layer` wrappers if required.

### Error handling

- Use guard clauses and early returns for invalid state.
- Avoid throwing for expected user input or UI state.
- Wrap JSON parsing in try/catch and return `undefined` on failure.
- Keep DOM queries null-safe (`?.` or explicit checks).

### Testing guidelines

- Use `bun:test` primitives (`describe`, `test`, `expect`).
- Create elements via `document.createElement` in tests.
- Clean up DOM in `afterEach`.
- Avoid flaky timing; rely on synchronous DOM updates.

### Project references

- Element packages reference `@duskmoon-dev/el-core` via workspace.
- Build `packages/core` before elements when doing manual builds.

## No additional rules found

- No `.cursor/rules/` or `.cursorrules` present.
- No `.github/copilot-instructions.md` present.
