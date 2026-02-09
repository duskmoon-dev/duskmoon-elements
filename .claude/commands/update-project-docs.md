---
description: Update project documentation files in docs/ to reflect current codebase state.
---

## User Input

```text
$ARGUMENTS
```

If the user specifies file names (e.g., `development`, `SKILL`), update only those files. If empty, update all files in `docs/`.

## Goal

Bring the documentation in `docs/` up to date with the current state of the codebase. Documentation must accurately reflect the actual code, exports, commands, scripts, and project structure — not aspirational or outdated content.

## Directory Structure

```
docs/
├── development.md                          # Developer guide
└── duskmoon-elements/                      # Skill: using DuskMoon Elements
    ├── SKILL.md                            # Main skill file (YAML frontmatter)
    └── references/
        ├── core-api.md                     # Core package exports, CSS variables
        └── element-catalog.md              # All element packages by category
```

## Documentation Files

| File | Purpose | Key Sources of Truth |
|------|---------|---------------------|
| `docs/development.md` | Developer guide: setup, architecture, core API, element patterns, testing, code style | `packages/core/src/index.ts`, `package.json`, `bunfig.toml`, `tsconfig.json`, element source files |
| `docs/duskmoon-elements/SKILL.md` | Skill for using `<el-dm-*>` custom elements: installation, registration, properties, events, slots, theming | Element source files, `packages/core/src/index.ts` |
| `docs/duskmoon-elements/references/core-api.md` | Core package exports, BaseElement API, mixins, CSS variables, themes, validation | `packages/core/src/index.ts`, `packages/core/src/*.ts` |
| `docs/duskmoon-elements/references/element-catalog.md` | All element packages by category with tags and class names | `elements/` directory, each element's `src/index.ts` |

## Execution Steps

### 1. Audit Current State

Read and compare the following against each doc file:

**For `docs/development.md`:**
- `packages/core/src/index.ts` — All public exports (add any new ones, remove deleted ones)
- `packages/core/src/*.ts` — API signatures for base-element, styles, animations, themes, validation, mixins, performance, and any new modules
- `package.json` (root) — Scripts, workspaces, devDependencies
- `bunfig.toml` — Test configuration
- `tsconfig.json` — Compiler options
- `elements/` directory listing — Count and list of element packages
- A representative element `package.json` — Build scripts, exports, dependencies
- `.github/workflows/` — CI/CD pipeline steps
- Run `bun run test 2>&1 | tail -5` to get current test count

**For `docs/duskmoon-elements/SKILL.md`:**
- Element source files — Verify common properties, events, slots, CSS parts examples
- `packages/core/src/index.ts` — Theme presets, registration patterns
- Element count — Must match `elements/` directory listing

**For `docs/duskmoon-elements/references/core-api.md`:**
- `packages/core/src/index.ts` — All exports (values and types)
- `packages/core/src/base-element.ts` — BaseElement methods
- `packages/core/src/mixins.ts` — Mixin list
- `packages/core/src/themes.ts` — Theme presets and CSS variables

**For `docs/duskmoon-elements/references/element-catalog.md`:**
- `elements/` directory listing — Package count and names
- Each element's `src/index.ts` — Exported classes and register functions
- Category counts must add up to total package count

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
- **New sections**: If a new core module was added (e.g., a new `packages/core/src/foo.ts`), add a corresponding section in the appropriate place
- **SKILL.md**: Preserve YAML frontmatter — only update the body and reference files

### 4. Verify

After updating, confirm:
- All exports listed in `packages/core/src/index.ts` appear in `references/core-api.md`
- All element packages in `elements/` appear in `references/element-catalog.md`
- Element count in SKILL.md matches catalog
- All scripts in root `package.json` are documented in `development.md`
- No file paths reference non-existent files
- Code examples use current API signatures

## Output

After completing updates, print a summary:

```
## Documentation Update Summary

### docs/development.md
- [list of changes made, or "No changes needed"]

### docs/duskmoon-elements/SKILL.md
- [list of changes made, or "No changes needed"]

### docs/duskmoon-elements/references/core-api.md
- [list of changes made, or "No changes needed"]

### docs/duskmoon-elements/references/element-catalog.md
- [list of changes made, or "No changes needed"]
```

## Operating Principles

- **Accuracy over completeness**: It's better to remove an incorrect section than to leave wrong information
- **Source of truth**: The code is always right. If docs disagree with code, update the docs
- **Minimal diff**: Only change what's actually wrong or missing. Don't rewrite sections that are still accurate
- **No new docs**: This command updates existing files only. To create new doc files, do that separately
