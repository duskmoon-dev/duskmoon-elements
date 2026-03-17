---
description: Bump @duskmoon-dev/core and @duskmoon-dev/css-art to latest npm versions across the monorepo, build, fix any breakage, then sync element packages to match upstream component additions/removals/API changes.
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

### 2. Update all pinned versions

Edit every `package.json` that pins these packages, preserving the existing range prefix (`^`, `~`, or exact). Only write files where the version actually changed.

- **`@duskmoon-dev/core`** — update in:
  - `packages/docs/package.json`
  - `elements/*/package.json` (all that list `@duskmoon-dev/core`)
- **`@duskmoon-dev/css-art`** — update in:
  - `art-elements/*/package.json` (all that list `@duskmoon-dev/css-art`)

### 3. Install and build

```bash
bun install
bun run build:all
```

If `build:all` fails, read the compiler errors and fix them before continuing. Repeat until the build is clean.

### 4. Diff upstream API changes

Clone or update the upstream repo to understand what changed between versions:

```bash
UPSTREAM_REF="/tmp/duskmoonui-ref"
if [ -d "$UPSTREAM_REF" ]; then
  git -C "$UPSTREAM_REF" fetch --tags --depth=50
else
  git clone --depth=50 https://github.com/duskmoon-dev/duskmoonui.git "$UPSTREAM_REF"
fi

cd "$UPSTREAM_REF"
git diff "v${PINNED_CORE}..v${LATEST_CORE}" --stat -- packages/core/
git diff "v${PINNED_CORE}..v${LATEST_CORE}" -- packages/core/src/ packages/core/index.ts

git diff "v${PINNED_CSSART}..v${LATEST_CSSART}" --stat -- packages/css-art/
git diff "v${PINNED_CSSART}..v${LATEST_CSSART}" -- packages/css-art/src/ packages/css-art/index.ts
```

For each package, identify:

| Category | Action required |
|----------|----------------|
| New component in `@duskmoon-dev/core` | Add a corresponding `elements/` package via `/create_element` |
| Removed component from `@duskmoon-dev/core` | Remove the corresponding `elements/` package (delete folder, remove from workspace) |
| New art module in `@duskmoon-dev/css-art` | Add a corresponding `art-elements/` package |
| Removed art module | Remove the corresponding `art-elements/` package |
| Changed prop/method/CSS class name | Update all usage sites in `elements/` and `art-elements/` |
| New optional prop/method | No action required unless it improves an existing element |
| `@deprecated` annotation | Update usage to the recommended alternative |

Ignore internal implementation details that don't affect the public surface.

### 5. Sync element packages

Apply the changes identified in step 4 in this order:

1. **Remove** packages for deleted upstream components — delete the folder and remove from `bun workspaces` in root `package.json`.
2. **Add** packages for new upstream components — use the `/create_element` skill for each, following existing naming conventions (`el-dm-<name>`, package `@duskmoon-dev/el-<name>`).
3. **Update** existing packages for API changes — fix renamed props, changed method signatures, or renamed CSS classes.

### 6. Final verify

```bash
bun install
bun run build:all && bun run test
```

Report the final result: versions bumped, components added/removed, API fixes applied, and test outcome.
