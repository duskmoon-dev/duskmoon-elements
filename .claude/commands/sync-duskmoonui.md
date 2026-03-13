---
description: Analyze @duskmoon-dev/core and @duskmoon-dev/css-art changes from duskmoonui repo, propagate to el-base and art-elements packages, and generate update plan for duskmoon-elements.
---

## Input

```text
$ARGUMENTS
```

If empty, analyze all element and css-art packages. If specified, analyze only named package(s).
Supports flags: `--from=<tag>` `--to=<tag|HEAD>` for version range. Default: last consumed version → latest.
Supports flags: `--only=core` or `--only=css-art` to restrict to one upstream package.

## Constraints

- **READ-ONLY** — output analysis only, no file modifications
- **Scope** — `@duskmoon-dev/core` → `@duskmoon-dev/el-base` → `elements/`; `@duskmoon-dev/css-art` → `css-arts/`
- Single report, no interactive prompts

## Prerequisites

Read `.claude/skills/duskmoon-dev-core/SKILL.md` first — it contains the current `@duskmoon-dev/core` API surface, conventions, and known patterns. Use this as baseline context before diffing.

## Steps

### 1. Resolve upstream package versions

Both packages live in the **same repo**: `duskmoon-dev/duskmoonui`.

```bash
# Clone or update duskmoonui repo as reference (shallow, temp dir)
UPSTREAM_REF="/tmp/duskmoonui-ref"
if [ -d "$UPSTREAM_REF" ]; then
  git -C "$UPSTREAM_REF" fetch --tags --depth=50
else
  git clone --depth=50 https://github.com/duskmoon-dev/duskmoonui.git "$UPSTREAM_REF"
fi

LATEST_VER=$(git -C "$UPSTREAM_REF" describe --tags --abbrev=0 2>/dev/null || echo "main")

# @duskmoon-dev/core — consumed by el-base
CORE_VER=$(jq -r '.dependencies["@duskmoon-dev/core"] // .devDependencies["@duskmoon-dev/core"]' package.json 2>/dev/null | sed 's/[\^~]//')
echo "root pins core@$CORE_VER, latest upstream is $LATEST_VER"

# @duskmoon-dev/css-art — consumed by css-arts/* packages
CSSART_VER=$(jq -r '.dependencies["@duskmoon-dev/css-art"] // .devDependencies["@duskmoon-dev/css-art"]' css-arts/atom/package.json 2>/dev/null | sed 's/[\^~]//')
echo "art-elements pins css-art@$CSSART_VER"
```

### 2. Extract API diff — @duskmoon-dev/core

**Layer 1: core changes** — Compare between versions:

```bash
cd "$UPSTREAM_REF"
git diff "v${CORE_VER}..${LATEST_VER}" --stat -- packages/core/
git diff "v${CORE_VER}..${LATEST_VER}" -- packages/core/src/ packages/core/index.ts
```

**Layer 2: el-base exposure** — Determine which core changes el-base re-exports or wraps:

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

### 3. Extract API diff — @duskmoon-dev/css-art

Compare the CSS art library between versions:

```bash
cd "$UPSTREAM_REF"
git diff "v${CSSART_VER}..${LATEST_VER}" --stat -- packages/css-art/
git diff "v${CSSART_VER}..${LATEST_VER}" -- packages/css-art/src/ packages/css-art/index.ts
```

Focus on:
- New art modules added (new `<el-dm-art-*>` opportunities)
- Removed or renamed CSS class names used by existing art-elements
- Changed animation keyframes, CSS variable names
- Breaking changes to the CSS-only API surface

### 4. Scan packages for usage

**Elements (core impact):**

```bash
for ELEMENT in elements/*/; do
  grep -rn "from.*@duskmoon-dev/el-base" "$ELEMENT/src/"
  grep -rn "this\.\(render\|update\|emit\|query\|attachStyles\)" "$ELEMENT/src/"
  grep -rn "static.*properties" "$ELEMENT/src/"
done
```

**CSS Arts (css-art impact):**

```bash
for ART in css-arts/*/; do
  grep -rn "from.*@duskmoon-dev/css-art" "$ART/src/"
  grep -rn "@import.*css-art\|class=.*dm-art" "$ART/src/"
done
```

### 5. Cross-reference and classify

For each package, map changed APIs to actual usage sites. Classify:

| Priority | Criteria |
|----------|----------|
| CRITICAL | Uses removed/renamed API — will not compile |
| HIGH | Uses deprecated API — works now, breaks later |
| MEDIUM | Could benefit from new features |
| LOW | No relevant changes |

### 6. Output report

```markdown
# DuskMoon UI Sync Analysis: v{FROM} → v{TO}

## Changes in @duskmoon-dev/core

### Breaking
- `oldExport` removed → use `newExport`

### Deprecated
- `method()` deprecated, removal planned v{X}

### New
- `newFeature()` added — {one-line description}

## Impact on @duskmoon-dev/el-base

Which core changes affect el-base's public API (re-exports, BaseElement methods, style utilities).

## Changes in @duskmoon-dev/css-art

### Breaking
- CSS class `dm-art-foo` renamed → `dm-art-bar`

### New
- New art module `bonsai` available — `<el-dm-art-bonsai>` can be added

## Element Impact (core changes)

| Element | Priority | Breaking | Deprecated | New Available |
|---------|----------|----------|------------|---------------|
| button  | LOW      | 0        | 0          | 1             |

## CSS Art Impact

| Package | Priority | Breaking | New Available |
|---------|----------|----------|---------------|
| atom    | LOW      | 0        | 0             |

## Update Plan

### el-dm-{name} (CRITICAL)

**Breaking:**
- `src/el-dm-{name}.ts:42` — `this.oldMethod()` → `this.newMethod()`

### el-dm-art-{name} (HIGH)

**Deprecated:**
- `src/el-dm-art-{name}.ts:15` — CSS class `dm-art-old` → `dm-art-new`

## Verification

After applying updates, run:
\`\`\`bash
bun run build:all && bun run test
\`\`\`
```

Keep the report concise. Only include sections with actual findings.
