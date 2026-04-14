# Code Engine Topbar & Bottombar

**Date:** 2026-04-13
**Element:** `el-dm-code-engine` (`@duskmoon-dev/el-code-engine`)
**File:** `elements/code-engine/src/el-dm-code-engine.ts`

## Overview

Add an opt-in topbar and bottombar to `el-dm-code-engine`. The bars provide VS Code-style chrome around the existing CodeMirror 6 editor: a topbar with language badge, title, and quick-action buttons, and a bottombar with cursor position, line count, encoding, and language info.

Bars are **hidden by default** for backwards compatibility. Users opt in with `show-topbar` and `show-bottombar` boolean attributes. Each bar renders default content derived from element attributes but can be fully replaced via named slots.

## Attribute API

### New attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `show-topbar` | Boolean | `false` | Show the topbar |
| `show-bottombar` | Boolean | `false` | Show the bottombar |
| `title` | String | `""` | Title displayed in the topbar (e.g. filename) |

### Existing attributes (unchanged)

`language`, `readonly`, `theme`, `wrap`, `value`

## Slots

| Slot | When rendered | Fallback (default content) |
|------|--------------|---------------------------|
| `topbar` | `show-topbar` is set | Language badge + title + action buttons |
| `bottombar` | `show-bottombar` is set | Cursor position + line count + encoding + language |

When a slot is populated, the entire default content for that bar is replaced. The bar container (with its `part` attribute and base styling) remains.

## Default Topbar Content

**Left side:**
- Language badge — short uppercase label (e.g. "JS", "PY", "RS") derived from the `language` attribute
- Title — from the `title` attribute, dimmed if empty

**Right side (action buttons, left to right):**
1. **Undo** — triggers CodeMirror's `undo` command
2. **Redo** — triggers CodeMirror's `redo` command
3. **Wrap toggle** — toggles the `wrap` attribute on/off
4. **Copy** — copies editor content to clipboard, emits `copy` event
5. **Fullscreen** — toggles fullscreen mode on the host element, emits `fullscreen` event

Buttons use icon glyphs (no text labels) with `title` attributes for accessibility.

## Default Bottombar Content

**Left side:**
- Cursor position: `Ln {line}, Col {col}` — updated on every cursor move via CodeMirror's `updateListener`
- Line count: `{n} lines`

**Right side:**
- Encoding: `UTF-8` (static)
- Language name: full name from the `language` attribute (e.g. "JavaScript", "Python")

## CSS Parts

| Part | Target |
|------|--------|
| `topbar` | Topbar container div |
| `bottombar` | Bottombar container div |
| `editor` | CodeMirror mount container (existing) |

## Events

### New events

| Event | Detail | Fired when |
|-------|--------|------------|
| `copy` | `{ value: string }` | Copy button clicked and content copied |
| `fullscreen` | `{ active: boolean }` | Fullscreen toggled on or off |

### Existing events (unchanged)

`input`, `change`

## Render Structure

```html
<!-- Shadow DOM template -->
<div class="topbar" part="topbar">           <!-- hidden unless show-topbar -->
  <slot name="topbar">
    <!-- default topbar content -->
  </slot>
</div>

<div class="cm-host" part="editor"></div>    <!-- existing -->

<div class="bottombar" part="bottombar">     <!-- hidden unless show-bottombar -->
  <slot name="bottombar">
    <!-- default bottombar content -->
  </slot>
</div>
```

## Styling

Bars use the existing `--dm-*` CSS custom properties from `@duskmoon-dev/core` (same tokens as `el-dm-code-block`):

- Topbar background: `var(--dm-surface-container, #f0f0f0)` (matches code-block header)
- Bottombar background: `var(--dm-surface-container-high, #e0e0e0)`
- Border: `1px solid var(--dm-border, #e0e0e0)`
- Text: `var(--dm-on-surface, #1a1a1a)`, dimmed text: `var(--dm-on-surface-variant, #555)`
- Font: inherits `--dm-font-mono` from `:host`
- Action buttons: `var(--dm-on-surface-variant, #555)` color, `var(--dm-surface-container-high, #e0e0e0)` background on hover
- Language badge: `var(--dm-primary, #6750a4)` background, `var(--dm-on-primary, #fff)` text
- Border radius: `var(--dm-radius-sm, 0.25rem)` for buttons/badge

Fullscreen mode sets `:host` to `position: fixed; inset: 0; z-index: 9999;` and restores on toggle-off.

## Cursor Position Tracking

Add a new CodeMirror `updateListener` that fires on selection changes (not just doc changes). Track `line` and `col` from `state.selection.main.head` and update the bottombar. Use a private field (`#cursorLine`, `#cursorCol`) and only re-render the bottombar span, not the full shadow DOM.

## Language Badge Mapping

A static map from language identifiers to short labels:

```
javascript → JS, typescript → TS, python → PY, rust → RS,
go → GO, java → JAVA, cpp → C++, html → HTML, css → CSS,
json → JSON, markdown → MD, sql → SQL, yaml → YAML,
xml → XML, php → PHP, elixir → EX, dart → DART, zig → ZIG,
vue → VUE, angular → NG, sass → SASS, less → LESS
```

Fallback: uppercase the `language` string.

## Usage Examples

```html
<!-- Bare editor (unchanged behavior) -->
<el-dm-code-engine language="javascript"></el-dm-code-engine>

<!-- Full chrome with default bars -->
<el-dm-code-engine
  language="javascript"
  title="main.js"
  show-topbar
  show-bottombar
></el-dm-code-engine>

<!-- Only bottombar -->
<el-dm-code-engine
  language="python"
  show-bottombar
></el-dm-code-engine>

<!-- Custom topbar, default bottombar -->
<el-dm-code-engine language="rust" show-topbar show-bottombar>
  <div slot="topbar">
    <span>Custom Toolbar</span>
    <button>Run</button>
    <button>Format</button>
  </div>
</el-dm-code-engine>

<!-- Both bars fully custom -->
<el-dm-code-engine language="go" show-topbar show-bottombar>
  <div slot="topbar">My Toolbar</div>
  <div slot="bottombar">My Status Bar</div>
</el-dm-code-engine>
```

## Scope

### In scope
- `show-topbar` / `show-bottombar` / `title` attributes
- Default topbar: language badge, title, undo, redo, wrap toggle, copy, fullscreen buttons
- Default bottombar: cursor position, line count, UTF-8, language name
- `topbar` and `bottombar` named slots
- `::part(topbar)` and `::part(bottombar)` CSS parts
- `copy` and `fullscreen` events
- Fullscreen toggle via Fullscreen API or fixed positioning fallback
- Cursor tracking via CodeMirror updateListener
- Updated docs page

### Out of scope
- Multiple file tabs
- Integrated terminal or output panel
- Search/replace UI (CodeMirror has built-in keybindings)
- Minimap
- Breadcrumbs
