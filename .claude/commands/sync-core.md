---
description: Analyze @duskmoon-dev/core changes from duskmoonui repo, propagate to @duskmoon-dev/el-base, and generate update plan for duskmoon-elements packages.
---

## Input

```text
$ARGUMENTS
```

If empty, analyze all element packages. If specified, analyze only named element(s).
Supports flags: `--from=<tag>` `--to=<tag|HEAD>` for version range. Default: last consumed version → latest.

## Constraints

- **READ-ONLY** — output analysis only, no file modifications
- **Scope** — `@duskmoon-dev/core` API surface → `@duskmoon-dev/el-base` → impact on `elements/` packages
- Single report, no interactive prompts

## Prerequisites

Read `.claude/skills/duskmoon-dev-core/SKILL.md` first — it contains the current `@duskmoon-dev/core` API surface, conventions, and known patterns. Use this as baseline context before diffing.

## Steps

### 1. Resolve core package versions

The core package lives in a **separate repo**: `duskmoon-dev/duskmoonui`.

```bash
# Clone or update core repo as reference (shallow, temp dir)
CORE_REF="/tmp/duskmoonui-ref"
if [ -d "$CORE_REF" ]; then
  git -C "$CORE_REF" fetch --tags --depth=50
else
  git clone --depth=50 https://github.com/duskmoon-dev/duskmoonui.git "$CORE_REF"
fi

# Determine version range
# Dependency chain: @duskmoon-dev/core (duskmoonui) → @duskmoon-dev/el-base → elements/*
# Check what version of core el-base currently consumes
ELBASE_CORE_VER=$(jq -r '.dependencies["@duskmoon-dev/core"] // .devDependencies["@duskmoon-dev/core"]' packages/base/package.json 2>/dev/null | sed 's/[\^~]//')
LATEST_VER=$(git -C "$CORE_REF" describe --tags --abbrev=0 2>/dev/null || echo "main")

echo "el-base pins core@$ELBASE_CORE_VER, latest core is $LATEST_VER"
```

### 2. Extract API diff (two layers)

**Layer 1: core changes** — Compare `@duskmoon-dev/core` between versions:

```bash
cd "$CORE_REF"
git diff "v${ELBASE_CORE_VER}..${LATEST_VER}" --stat
git diff "v${ELBASE_CORE_VER}..${LATEST_VER}" -- src/ types/ index.ts
```

**Layer 2: el-base exposure** — Determine which core changes `el-base` re-exports or wraps:

```bash
# Check what el-base exposes from core
grep -rn "export.*from.*@duskmoon-dev/core" packages/base/src/
# Check BaseElement class surface
grep -rn "public\|protected\|static" packages/base/src/base-element.ts
```

Focus on:
- Exported types, interfaces, classes (especially `BaseElement`)
- Function signatures (`css`, `combineStyles`, `cssVars`, etc.)
- CSS custom properties (`--dm-*`)
- `properties` static definition structure and type converters
- Removed/renamed exports (breaking)
- `@deprecated` annotations
- New exports/methods (additive)

Ignore internal implementation changes that don't affect the public API.

### 3. Scan element packages for usage

For each target element in `elements/`:

```bash
# Extract all imports from el-base (the base element class package)
grep -rn "from.*@duskmoon-dev/el-base" elements/${ELEMENT}/src/
# Find BaseElement method usage
grep -rn "this\.\(render\|update\|emit\|query\|attachStyles\)" elements/${ELEMENT}/src/
# Find theme variable usage
grep -rn "\-\-dm-" elements/${ELEMENT}/src/
# Find static properties definitions
grep -rn "static.*properties" elements/${ELEMENT}/src/
```

### 4. Cross-reference and classify

For each element, map changed APIs to actual usage sites. Classify:

| Priority | Criteria |
|----------|----------|
| CRITICAL | Uses removed/renamed API — will not compile |
| HIGH | Uses deprecated API — works now, breaks later |
| MEDIUM | Could benefit from new features |
| LOW | No relevant changes |

### 5. Output report

```markdown
# Core Sync Analysis: v{FROM} → v{TO}

## Changes in @duskmoon-dev/core

### Breaking
- `oldExport` removed → use `newExport`

### Deprecated
- `method()` deprecated, removal planned v{X}

### New
- `newFeature()` added — {one-line description}

## Impact on @duskmoon-dev/el-base

Which core changes affect el-base's public API (re-exports, BaseElement methods, style utilities).

## Element Impact

| Element | Priority | Breaking | Deprecated | New Available |
|---------|----------|----------|------------|---------------|
| button  | LOW      | 0        | 0          | 1             |

## Update Plan

### el-dm-{name} (CRITICAL)

**Breaking:**
- `src/el-dm-{name}.ts:42` — `this.oldMethod()` → `this.newMethod()`

**Deprecated:**
- `src/el-dm-{name}.ts:78` — `deprecatedProp` → `newProp`

## Verification

After applying updates, run:
\`\`\`bash
bun run build:all && bun run test
\`\`\`
```

Keep the report concise. Only include sections with actual findings.