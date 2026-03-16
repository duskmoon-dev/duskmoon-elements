---
description: Update project documentation files in docs/, skills/, and README.md to reflect current codebase state.
---

## User Input

```text
$ARGUMENTS
```

If the user specifies file names (e.g., `development`, `SKILL`, `readme`, `css-art-catalog`), update only those files. If empty, update all files in `docs/`, `skills/duskmoon-elements/`, and `README.md`.

## Goal

Bring the documentation in `docs/`, `skills/duskmoon-elements/`, and `README.md` up to date with the current state of the codebase. Documentation must accurately reflect the actual code, exports, commands, scripts, and project structure — not aspirational or outdated content.

## Directory Structure

```
README.md                                       # Project overview, package list, theming, quick start
docs/
└── development.md                              # Developer guide
skills/duskmoon-elements/                       # Skill: using DuskMoon Elements and CSS Arts
├── SKILL.md                                    # Main skill file (YAML frontmatter)
└── references/
    ├── core-api.md                             # Core package exports, CSS variables
    ├── element-catalog.md                      # All element packages by category
    └── css-art-catalog.md                      # All CSS art packages with tags and class names
```

## Documentation Files

| File | Purpose | Key Sources of Truth |
|------|---------|---------------------|
| `README.md` | Project overview: features, quick start, package list by category, theming, project structure | `elements/` directory, `art-elements/` directory, `packages/base/src/themes.ts`, `package.json` |
| `docs/development.md` | Developer guide: setup, architecture, core API, element patterns, testing, code style | `packages/base/src/index.ts`, `package.json`, `bunfig.toml`, `tsconfig.json`, element source files |
| `skills/duskmoon-elements/SKILL.md` | Skill for using `<el-dm-*>` and `<el-dm-art-*>` elements: installation, registration, properties, events, slots, theming, CSS art elements | Element source files, css-art source files, `packages/base/src/index.ts` |
| `skills/duskmoon-elements/references/core-api.md` | Core package exports, BaseElement API, mixins, CSS variables, themes, validation | `packages/base/src/index.ts`, `packages/base/src/*.ts` |
| `skills/duskmoon-elements/references/element-catalog.md` | All element packages by category with tags and class names | `elements/` directory, each element's `src/index.ts` |
| `skills/duskmoon-elements/references/css-art-catalog.md` | All CSS art packages with tags, class names, and properties | `art-elements/` directory, each art element's `src/index.ts` |

## Execution Steps

### 1. Audit Current State

Read and compare the following against each doc file:

**For `docs/development.md`:**
- `packages/base/src/index.ts` — All public exports (add any new ones, remove deleted ones)
- `packages/base/src/*.ts` — API signatures for base-element, styles, animations, themes, validation, mixins, performance, and any new modules
- `package.json` (root) — Scripts, workspaces, devDependencies
- `bunfig.toml` — Test configuration
- `tsconfig.json` — Compiler options
- `elements/` directory listing — Count and list of element packages
- `art-elements/` directory listing — Count and list of CSS art packages
- A representative element `package.json` — Build scripts, exports, dependencies
- A representative css-art `package.json` — Dependencies (especially `@duskmoon-dev/css-art` version)
- `.github/workflows/` — CI/CD pipeline steps
- Run `bun run test 2>&1 | tail -5` to get current test count

**For `skills/duskmoon-elements/SKILL.md`:**
- Element source files — Verify common properties, events, slots, CSS parts examples
- `packages/base/src/index.ts` — Theme presets, registration patterns
- Element count — Must match `elements/` directory listing
- CSS art source files — Verify CSS art properties, sizing, layer stripping pattern
- CSS art count — Must match `art-elements/` directory listing

**For `skills/duskmoon-elements/references/core-api.md`:**
- `packages/base/src/index.ts` — All exports (values and types)
- `packages/base/src/base-element.ts` — BaseElement methods
- `packages/base/src/mixins.ts` — Mixin list
- `packages/base/src/themes.ts` — Theme presets and CSS variables

**For `skills/duskmoon-elements/references/element-catalog.md`:**
- `elements/` directory listing — Package count and names
- Each element's `src/index.ts` — Exported classes and register functions
- Category counts must add up to total package count

**For `skills/duskmoon-elements/references/css-art-catalog.md`:**
- `art-elements/` directory listing — All package names
- Each art element's `src/index.ts` — Exported class and register function
- Each art element's main `.ts` file — `static properties` (especially `size`)

**For `README.md`:**
- `elements/` directory listing — All packages present in each category table; no missing or extra entries
- `art-elements/` directory listing — All CSS art packages present in the CSS Art Components table
- `packages/base/src/themes.ts` — Theme names and descriptions in the Theming section
- `packages/` directory listing — Package directory names in Project Structure
- Element count in Project Structure comment (`# N element packages total`)
- CSS art count in Project Structure comment (`# N css art packages total`)

### 2. Identify Differences

For each doc file, list:
- **Stale content**: Information that no longer matches the codebase
- **Missing content**: New features, exports, commands, or files not yet documented
- **Removed content**: Things documented that no longer exist

### 3. Apply Updates

Edit each doc file to reflect the current state. Follow these rules:

- **Be precise**: Use exact export names, exact script names, exact file paths
- **Show real code**: Examples must use actual API signatures from the source
- **Keep structure**: Preserve the existing heading hierarchy and organization
- **No aspirational content**: Only document what exists today, not planned features
- **Test counts**: Update test/file counts if they appear in the docs
- **New sections**: If a new core module was added (e.g., a new `packages/base/src/foo.ts`), add a corresponding section in the appropriate place
- **SKILL.md**: Preserve YAML frontmatter — only update the body and reference files
- **No new doc files**: This command updates existing files only

### 4. Verify

After updating, confirm:
- All exports listed in `packages/base/src/index.ts` appear in `skills/duskmoon-elements/references/core-api.md`
- All element packages in `elements/` appear in both `skills/duskmoon-elements/references/element-catalog.md` and `README.md`
- All CSS art packages in `art-elements/` appear in both `skills/duskmoon-elements/references/css-art-catalog.md` and `README.md`
- Element count in `skills/duskmoon-elements/SKILL.md` matches `elements/` directory count
- CSS art count in `skills/duskmoon-elements/SKILL.md` matches `art-elements/` directory count
- All scripts in root `package.json` are documented in `development.md`
- No file paths reference non-existent files
- Code examples use current API signatures
- Theme names in `README.md` match the exports in `packages/base/src/themes.ts`

## Output

After completing updates, print a summary:

```
## Documentation Update Summary

### README.md
- [list of changes made, or "No changes needed"]

### docs/development.md
- [list of changes made, or "No changes needed"]

### skills/duskmoon-elements/SKILL.md
- [list of changes made, or "No changes needed"]

### skills/duskmoon-elements/references/core-api.md
- [list of changes made, or "No changes needed"]

### skills/duskmoon-elements/references/element-catalog.md
- [list of changes made, or "No changes needed"]

### skills/duskmoon-elements/references/css-art-catalog.md
- [list of changes made, or "No changes needed"]
```

## Operating Principles

- **Accuracy over completeness**: It's better to remove an incorrect section than to leave wrong information
- **Source of truth**: The code is always right. If docs disagree with code, update the docs
- **Minimal diff**: Only change what's actually wrong or missing. Don't rewrite sections that are still accurate
- **No new docs**: This command updates existing files only
