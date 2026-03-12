---
name: duskmoon-css-arts
description: Use the DuskMoon CSS Arts custom element library (`<el-dm-art-*>` web components). Use when adding pure CSS art animations to web pages, registering art elements, setting size/variant properties, or using the css-arts bundle. Covers all 11 CSS art packages including atom, moon, sun, plasma-ball, synthwave-starfield, and more.
---

# DuskMoon CSS Arts

11 pure CSS art custom elements built on `@duskmoon-dev/el-base`. Each element renders a self-contained CSS animation — no JavaScript logic, no external images.

## Installation

```bash
# Individual art element
bun add @duskmoon-dev/el-art-atom

# All art elements at once
bun add @duskmoon-dev/css-arts
```

## Registration

```typescript
// Option 1: Explicit (tree-shakable)
import { register } from '@duskmoon-dev/el-art-atom';
register();

// Option 2: Side-effect auto-register
import '@duskmoon-dev/el-art-atom/register';

// Option 3: Register all CSS art elements
import { registerAll } from '@duskmoon-dev/css-arts';
registerAll();
```

## Usage in HTML

```html
<el-dm-art-atom></el-dm-art-atom>
<el-dm-art-atom size="lg"></el-dm-art-atom>

<el-dm-art-moon variant="crescent" glow></el-dm-art-moon>
<el-dm-art-sun variant="sunset" rays></el-dm-art-sun>

<el-dm-art-plasma-ball size="xl"></el-dm-art-plasma-ball>
<el-dm-art-synthwave-starfield size="lg" paused></el-dm-art-synthwave-starfield>
```

## Common Properties

All CSS art elements are `display: inline-block` by default. Most share:

| Property | Type | Description |
|----------|------|-------------|
| `size` | String | Size variant — `sm`, `md` (default), `lg`, `xl` |

Element-specific properties:

| Element | Extra Properties |
|---------|-----------------|
| `el-dm-art-moon` | `variant` (String), `glow` (Boolean) |
| `el-dm-art-mountain` | `variant` (String) |
| `el-dm-art-sun` | `variant` (String), `rays` (Boolean) |
| `el-dm-art-snow` | `count` (Number), `unicode` (Boolean), `fall` (Boolean) |
| `el-dm-art-circular-gallery` | `title` (String), `count` (Number) |
| `el-dm-art-synthwave-starfield` | `paused` (Boolean) |

Set properties via HTML attributes (kebab-case) or JS properties:

```html
<!-- HTML attributes -->
<el-dm-art-moon variant="full" size="lg" glow></el-dm-art-moon>

<!-- JS properties -->
<script>
  const moon = document.querySelector('el-dm-art-moon');
  moon.variant = 'full';
  moon.size = 'lg';
  moon.glow = true;
</script>
```

## Sizing

The `size` property maps to CSS modifier classes on the inner wrapper. Omitting `size` (or setting `md`) renders at default size. Available sizes depend on the upstream `@duskmoon-dev/css-art` definitions for each art:

```html
<el-dm-art-atom size="sm"></el-dm-art-atom>
<el-dm-art-atom size="md"></el-dm-art-atom>   <!-- default -->
<el-dm-art-atom size="lg"></el-dm-art-atom>
<el-dm-art-atom size="xl"></el-dm-art-atom>
```

## CSS Layer Stripping

CSS art elements import raw CSS from `@duskmoon-dev/css-art` and strip the `@layer css-art { ... }` wrapper before injecting into Shadow DOM:

```typescript
// Pattern used in every css-art element:
import rawCss from '@duskmoon-dev/css-art/dist/art/{name}.css' with { type: 'text' };
const layerMatch = rawCss.match(/@layer\s+css-art\s*\{([\s\S]*)\}\s*$/);
const coreCss = layerMatch ? layerMatch[1] : rawCss;
```

This is required because `@layer` inside Shadow DOM does not interact with the document's layer order.

## Batched Rendering

Property changes are batched via `queueMicrotask` (inherited from `BaseElement`):

```javascript
const art = document.querySelector('el-dm-art-moon');
art.variant = 'crescent';
art.size = 'lg';
art.glow = true;
// → single re-render
```

## References

- [CSS Art Catalog](references/css-art-catalog.md) — all 11 packages with tags and class names
- [Core API](../duskmoon-elements/references/core-api.md) — BaseElement API (shared foundation)
