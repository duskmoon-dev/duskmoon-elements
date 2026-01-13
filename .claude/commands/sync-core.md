---
description: Analyze @duskmoon-dev/core package changes and create an update plan for element packages.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding. If empty, analyze all element packages. If specified, analyze only the named element(s).

## Goal

Compare the local `@duskmoon-dev/el-core` package with the published npm version (or a specified version), identify breaking changes, new features, and deprecations, then generate an actionable update plan for element packages.

## Operating Constraints

**READ-ONLY ANALYSIS**: Do **not** modify any files automatically. Output a structured analysis report with an update plan. User must explicitly approve before any changes are applied.

**Scope**: This command focuses on `@duskmoon-dev/el-core` API surface changes and their impact on element packages in the `elements/` directory.

## Execution Steps

### 1. Determine Analysis Scope

Parse user input to determine:
- **Target elements**: If `$ARGUMENTS` specifies element name(s), analyze only those. Otherwise, analyze all elements in `elements/` directory.
- **Version comparison**: Default to comparing local vs latest npm. User can specify version like `--from=0.3.0 --to=0.4.0`.

### 2. Fetch Core Package Information

**Local version:**
```bash
cat packages/core/package.json | jq -r '.version'
```

**Published version (latest):**
```bash
npm view @duskmoon-dev/el-core version
```

**Fetch published package types (if comparing to npm):**
```bash
npm pack @duskmoon-dev/el-core --pack-destination /tmp
tar -xzf /tmp/duskmoon-dev-el-core-*.tgz -C /tmp
```

### 3. Analyze Core Package API Surface

Extract and compare the following from `@duskmoon-dev/el-core`:

**From TypeScript declarations (`dist/types/`):**

| API Category | Items to Track |
|--------------|----------------|
| **BaseElement class** | Public methods, protected methods, static properties |
| **Reactive properties system** | `properties` static definition structure, type converters |
| **Style utilities** | `css`, `combineStyles`, `cssVars` function signatures |
| **Theme variables** | CSS custom properties (`--dm-*`) |
| **Type exports** | `PropertyDefinition`, `PropertyType`, etc. |

**Change detection categories:**
- **Breaking**: Removed exports, changed method signatures, renamed properties
- **Deprecation**: Methods/properties marked with `@deprecated`
- **Addition**: New exports, new methods, new options
- **Internal**: Changes that don't affect public API

### 4. Scan Element Packages for Usage

For each target element package:

```bash
# Find all TypeScript files
find elements/${ELEMENT_NAME}/src -name "*.ts" -type f
```

Extract usage patterns:
- Imports from `@duskmoon-dev/el-core`
- `BaseElement` method calls (render, update, emit, query, etc.)
- `static properties` definitions
- Style attachment patterns (`attachStyles`, `css` template tag)
- Theme variable usage (`--dm-*`)

### 5. Generate Impact Assessment

For each element, create an impact matrix:

| Element | Breaking Changes | Deprecations | New Features Available | Update Priority |
|---------|------------------|--------------|------------------------|-----------------|
| button  | 0                | 1            | 2                      | LOW             |
| switch  | 1                | 0            | 2                      | HIGH            |

**Priority levels:**
- **CRITICAL**: Uses removed/renamed API - will not compile
- **HIGH**: Uses deprecated API - works but should update
- **MEDIUM**: Could benefit from new features
- **LOW**: No changes needed

### 6. Generate Update Plan

For each affected element, produce:

```markdown
## Update Plan: el-dm-{name}

### Breaking Changes (MUST FIX)
- [ ] Change X: `oldMethod()` → `newMethod()`
  - File: `src/el-dm-{name}.ts:L42`
  - Before: `this.oldMethod()`
  - After: `this.newMethod()`

### Deprecation Warnings (SHOULD FIX)
- [ ] Warning Y: `deprecatedProp` will be removed in v1.0
  - File: `src/el-dm-{name}.ts:L78`
  - Migration: Use `newProp` instead

### New Features (OPTIONAL)
- [ ] Feature Z: New `attachStyles()` options for scoped styles
  - Benefit: Better style encapsulation
  - Usage: `this.attachStyles(styles, { scoped: true })`
```

### 7. Output Analysis Report

Produce a Markdown report with the following structure:

```markdown
# Core Package Sync Analysis

## Version Comparison
| | Version | Date |
|---|---------|------|
| Local | 0.4.0 | 2026-01-13 |
| npm (latest) | 0.4.0 | 2026-01-13 |

## API Changes Summary

### Breaking Changes
(List all breaking changes with migration paths)

### Deprecations
(List all deprecations with timelines)

### New Features
(List new features with usage examples)

## Element Impact Assessment

(Impact matrix table)

## Update Plans

(Per-element update plans)

## Recommended Actions

1. **Immediate**: Fix breaking changes in [elements...]
2. **Soon**: Address deprecations in [elements...]
3. **Optional**: Adopt new features in [elements...]

## Commands to Apply Updates

To apply these updates, run:
- For specific element: `/sync-core apply {element-name}`
- For all affected: `/sync-core apply --all`
```

### 8. Offer to Apply Updates

At the end of the report, ask:

> Would you like me to apply the recommended updates?
> - `yes` - Apply all updates
> - `{element-name}` - Apply updates to specific element only
> - `no` - Exit without changes

**If user approves**, proceed to make the changes following the update plan.

## Operating Principles

### Analysis Guidelines

- **Compare type signatures**: Focus on public API, not implementation details
- **Track transitive dependencies**: If core changes affect utilities used by elements, flag them
- **Preserve element behavior**: Updates should maintain existing functionality
- **Minimal changes**: Only modify what's necessary for compatibility

### Context Efficiency

- **Lazy loading**: Only fetch npm package if actually comparing to published version
- **Targeted scanning**: If specific elements named, skip others entirely
- **Cache awareness**: Note if local and npm versions are identical (no changes needed)

### Safety

- **Never auto-apply breaking changes** without explicit user approval
- **Generate reversible changes**: Each change should be independently revertible
- **Test command**: Suggest running `bun run build:all && bun run test` after applying updates

## Context

$ARGUMENTS
