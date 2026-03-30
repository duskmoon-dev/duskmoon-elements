---
name: duskmoon-art-elements
description: Use the DuskMoon CSS Art Elements (`<el-dm-art-*>` web components). Use when adding pure CSS art animations to web pages — atom, moon, sun, plasma-ball, gemini-input, synthwave-starfield, and more. Covers all 15 CSS art packages, registration patterns, size variants, and the @layer stripping technique required for Shadow DOM compatibility.
---

# DuskMoon CSS Art Elements

15 pure CSS art custom elements built on `@duskmoon-dev/el-base`. Each element renders a self-contained CSS animation — no JavaScript logic, no external images.

## Installation

```bash
# Individual art element
bun add @duskmoon-dev/el-art-atom

# All art elements at once
bun add @duskmoon-dev/art-elements
```

## Registration

```typescript
// Option 1: Explicit (tree-shakable)
import { register } from '@duskmoon-dev/el-art-atom';
register();

// Option 2: Side-effect auto-register
import '@duskmoon-dev/el-art-atom/register';

// Option 3: Register all CSS art elements
import { registerAllArts } from '@duskmoon-dev/art-elements';
registerAllArts();
```

## Usage in HTML

```html
<el-dm-art-atom></el-dm-art-atom>
<el-dm-art-atom size="lg"></el-dm-art-atom>

<el-dm-art-moon variant="crescent" glow></el-dm-art-moon>
<el-dm-art-sun variant="sunset" rays></el-dm-art-sun>

<el-dm-art-plasma-ball size="xl"></el-dm-art-plasma-ball>
<el-dm-art-synthwave-starfield size="lg" paused></el-dm-art-synthwave-starfield>

<el-dm-art-gemini-input placeholder="Ask me anything..."></el-dm-art-gemini-input>
<el-dm-art-gemini-input size="lg"></el-dm-art-gemini-input>
```

## Properties

All CSS art elements are `display: inline-block` by default. Most support `size`:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `size` | String | `'md'` | Size variant — maps to `art-{name}-{size}` CSS class (`sm`, `md`, `lg`) |

Element-specific properties:

| Element | Extra Properties |
|---------|-----------------|
| `el-dm-art-moon` | `variant` (String), `glow` (Boolean) |
| `el-dm-art-mountain` | `variant` (String) |
| `el-dm-art-sun` | `variant` (String), `rays` (Boolean) |
| `el-dm-art-snow` | `count` (Number), `unicode` (Boolean), `fall` (Boolean) |
| `el-dm-art-circular-gallery` | `title` (String), `count` (Number) |
| `el-dm-art-synthwave-starfield` | `paused` (Boolean) |
| `el-dm-art-gemini-input` | `placeholder` (String) |

## CSS Layer Stripping

CSS art elements import raw CSS from `@duskmoon-dev/css-art` and strip the `@layer css-art { ... }` wrapper before injecting into Shadow DOM:

```typescript
import rawCss from '@duskmoon-dev/css-art/dist/art/{name}.css' with { type: 'text' };
const layerMatch = rawCss.match(/@layer\s+css-art\s*\{([\s\S]*)\}\s*$/);
const coreCss = layerMatch ? layerMatch[1] : rawCss;
```

This is required because `@layer` inside Shadow DOM does not interact with the document's layer order.

Some art pieces (e.g. `gemini-input`) also have `@property` declarations outside the layer — these are preserved by the stripping regex since they appear before the `@layer` block and are not matched.

## References

- [CSS Art catalog](references/css-art-catalog.md) — all 15 CSS art packages with tags and properties
