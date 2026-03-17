---
description: Bump @duskmoon-dev/core and @duskmoon-dev/css-art to latest npm versions across the monorepo, diff the upstream API changes, and update any affected element code.
---

## Input

```text
$ARGUMENTS
```

If empty, sync both packages. Supports `--only=core` or `--only=css-art` to restrict to one package.

## Steps

### 1. Resolve versions

```bash
# Latest published versions from npm registry
LATEST_CORE=$(npm show @duskmoon-dev/core version)
LATEST_CSSART=$(npm show @duskmoon-dev/css-art version)

# Currently pinned versions (read from first occurrence)
PINNED_CORE=$(jq -r '.dependencies["@duskmoon-dev/core"] // .devDependencies["@duskmoon-dev/core"] // empty' packages/docs/package.json | sed 's/[\^~]//')
PINNED_CSSART=$(jq -r '.dependencies["@duskmoon-dev/css-art"] // .devDependencies["@duskmoon-dev/css-art"] // empty' art-elements/atom/package.json | sed 's/[\^~]//')

echo "core:    pinned=$PINNED_CORE  latest=$LATEST_CORE"
echo "css-art: pinned=$PINNED_CSSART  latest=$LATEST_CSSART"
```

If both packages are already at latest, report "already up to date" and stop.

### 2. Diff upstream API changes

Clone or update the upstream repo, then diff only if versions differ:

```bash
UPSTREAM_REF="/tmp/duskmoonui-ref"
if [ -d "$UPSTREAM_REF" ]; then
  git -C "$UPSTREAM_REF" fetch --tags --depth=50
else
  git clone --depth=50 https://github.com/duskmoon-dev/duskmoonui.git "$UPSTREAM_REF"
fi

# Both packages use the same v*.*.* tag scheme
cd "$UPSTREAM_REF"
git diff "v${PINNED_CORE}..v${LATEST_CORE}" --stat -- packages/core/
git diff "v${PINNED_CORE}..v${LATEST_CORE}" -- packages/core/src/ packages/core/index.ts

git diff "v${PINNED_CSSART}..v${LATEST_CSSART}" --stat -- packages/css-art/
git diff "v${PINNED_CSSART}..v${LATEST_CSSART}" -- packages/css-art/src/ packages/css-art/index.ts
```

Focus on:
- Removed or renamed exports / CSS classes (breaking)
- `@deprecated` annotations (high)
- New exports, components, or CSS classes (additive)

Ignore internal implementation details that don't affect the public surface.

### 3. Output change report

```markdown
# DuskMoon UI Sync: v{FROM_CORE} → v{TO_CORE}

## @duskmoon-dev/core

### Breaking
- …

### New
- …

## @duskmoon-dev/css-art

### New
- New art module `foo` — can add `<el-dm-art-foo>`

## Element impact

| Package | Priority | Notes |
|---------|----------|-------|
| el-dm-button | LOW | picks up new ghost color variants |
```

Only include sections with actual findings. Mark priority CRITICAL/HIGH/MEDIUM/LOW.

### 4. Update all pinned versions

Use `jq` (or direct file edits) to set the new version in every `package.json` that pins these packages, preserving the existing range prefix (`^`, `~`, or exact):

- **`@duskmoon-dev/core`** — update in:
  - `packages/docs/package.json`
  - `elements/*/package.json` (all that list `@duskmoon-dev/core`)
- **`@duskmoon-dev/css-art`** — update in:
  - `art-elements/*/package.json` (all that list `@duskmoon-dev/css-art`)

Only write files where the version actually changed.

### 5. Apply code fixes for breaking changes

If step 2 identified breaking changes (removed/renamed APIs, changed class names), locate affected usage sites and apply the necessary fixes before proceeding.

### 6. Install and verify

```bash
bun install
bun run build:all && bun run test
```

Report the final result.
