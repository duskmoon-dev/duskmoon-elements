# Quickstart: Vite Playground Package

**Feature**: 001-vite-playground
**Date**: 2025-12-31

## Prerequisites

- Bun v1.0 or higher installed
- Repository cloned and dependencies installed

## Setup

From the repository root:

```bash
# Install all workspace dependencies (if not already done)
bun install

# Build core and elements (required for playground to import them)
bun run build:all
```

## Development

Start the playground development server:

```bash
# From repository root
bun run --filter @duskmoon-dev/playground dev

# Or from the playground package directory
cd packages/playground
bun run dev
```

The dev server will start and display a URL (typically `http://localhost:5173`).

### Available Pages

| URL | Description |
|-----|-------------|
| `http://localhost:5173/` | Landing page with navigation |
| `http://localhost:5173/button.html` | Button element demos |
| `http://localhost:5173/card.html` | Card element demos |
| `http://localhost:5173/input.html` | Input element demos |
| `http://localhost:5173/markdown.html` | Markdown element demos |

### Hot Reload

Changes to files in `packages/playground/` will trigger automatic page updates.

Changes to element source files (in `elements/` or `packages/core/`) will trigger a full page reload.

## Build

Build the playground for production deployment:

```bash
# From repository root
bun run --filter @duskmoon-dev/playground build

# Or from the playground package directory
cd packages/playground
bun run build
```

Output will be in `packages/playground/dist/`.

## Preview Production Build

Preview the production build locally:

```bash
cd packages/playground
bun run preview
```

## Verification Checklist

After setup, verify the following:

- [ ] Dev server starts without errors
- [ ] Landing page loads and shows navigation
- [ ] Each element demo page renders the element correctly
- [ ] Navigation links work between pages
- [ ] Production build completes without errors
- [ ] Preview server shows the built site correctly

## Troubleshooting

### Elements not rendering

Ensure the element packages are built:

```bash
bun run build:all
```

### Dev server fails to start

Check that port 5173 is not in use. Vite will suggest an alternative port if needed.

### TypeScript errors

Ensure all packages are built first (TypeScript project references require built output):

```bash
bun run build:core
bun run build:elements
```
