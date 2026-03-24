# Plan: Fix Editor Render Layer (CodeMirror-inspired)

## Architecture Insight

CodeMirror separates concerns clearly:

```
┌─────────────────────────────────────┐
│ render layer  (cm-content)          │  ← visible, in normal flow, drives layout
│   highlighted/formatted content     │
│   pointer-events: none              │
└─────────────────────────────────────┘
         ↑ absolute, same rect
┌─────────────────────────────────────┐
│ input element  (hidden textarea)    │  ← invisible, just captures keystrokes
│   color: transparent                │
│   user types here → updates render  │
└─────────────────────────────────────┘
```

The **render layer determines height**. The input element is an overlay that follows it. When the user types, the input is intercepted and fed into the render layer — the render layer's content (and thus its height) is the source of truth.

---

## What Is Currently Wrong

The current implementation **inverts this**:

```
textarea  (z-index: 2, in grid flow)   ← drives the grid row height (min-height: 12rem, fixed)
backdrop  (z-index: 1, in grid flow)   ← supposed to match, but grows to full content height
```

Because the backdrop div grows to its content height while the textarea stays at `min-height: 12rem`, the grid cell height equals the backdrop's content height. The backdrop shows everything. The textarea scrolls internally. `backdrop.scrollTop = textarea.scrollTop` has no effect because the backdrop has nothing to scroll.

**Result**: highlighted content is always at document-top; textarea viewport scrolls away from it.

---

## Correct Architecture

Swap the roles:

```
.write-area { position: relative }

.render-layer         ← in normal flow, grows with highlighted content → determines height
  pointer-events: none
  white-space: pre-wrap, word-wrap, identical font metrics

textarea              ← position: absolute; inset: 0; height: 100%
  color: transparent
  background: transparent
  caret-color: var(--md-text)   ← user sees the cursor
  overflow: hidden              ← no internal scroll (render layer is the layout)
  resize: none
```

**Data flow**:
1. User types in `textarea` → `input` event fires
2. `highlightMarkdown(ta.value)` → sets `.render-layer` innerHTML
3. `.render-layer` grows/shrinks with content → `.write-area` height follows
4. `textarea` fills `.write-area` via `position: absolute; inset: 0` → always the same rectangle as the render layer
5. No scroll sync. No height JS. No misalignment.

---

## Implementation Plan

### Step 1 — Rename `.backdrop` → `.render-layer` in `element.ts` render()

Rename the class in the HTML template for clarity. Update `#cacheDOMRefs` to query `.render-layer`. Update the `#backdropContent` → `#renderContent` ref.

Also rename the class in `css.ts`.

### Step 2 — Rewrite layout CSS in `css.ts`

**`.write-area`** — switch from grid to `position: relative`:
```css
.write-area {
  position: relative;
  min-height: 12rem;
  flex: 1 1 auto;
}
```

**`.render-layer`** (was `.backdrop`) — normal flow, drives height:
```css
.render-layer {
  position: relative;          /* in normal flow */
  z-index: 1;
  pointer-events: none;
  min-height: 12rem;

  /* font metrics — must match textarea exactly */
  font-family: ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  padding: 0.75rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  color: var(--md-text);
}
```

**`textarea`** — absolute overlay, follows render layer:
```css
textarea {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: block;
  width: 100%;
  height: 100%;

  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: transparent;
  caret-color: var(--md-text);
  box-sizing: border-box;
  overflow: hidden;             /* no internal scroll */

  /* MUST match .render-layer exactly */
  font-family: ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  padding: 0.75rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
```

Remove the `.render-layer-content` child div — move `white-space: pre-wrap` directly onto `.render-layer`. The extra wrapper was needed to avoid a leading whitespace rendering artifact from the grid template; with `position: relative` layout it is no longer required.

### Step 3 — Remove scroll listener in `element.ts`

Delete the `scroll` event listener from `#attachEventHandlers`. With `overflow: hidden` on the textarea and the render layer in normal flow, neither element scrolls internally. The page/editor container scrolls as a whole.

Also remove the scroll-sync tail from `#scheduleHighlight`.

### Step 4 — Update DOM refs in `element.ts`

```typescript
// #cacheDOMRefs
this.#renderLayer = this.shadowRoot.querySelector('.render-layer'); // was #backdrop
// Remove #backdropContent — render directly into .render-layer
```

Update all `this.#backdropContent.innerHTML = ...` calls to `this.#renderLayer.innerHTML = ...`.

### Step 5 — Verify trailing-newline padding still present

`highlightMarkdown` appends `\u00a0` to prevent the render layer from being shorter than the textarea when content ends with `\n`. This is still required — verify it is still in place after the refactor.

### Step 6 — Test resize behavior (optional ResizeObserver)

If the element is reflowed (e.g. parent container width changes), the render layer re-wraps text, its height changes, and the textarea (absolute, inset: 0) follows automatically. No ResizeObserver needed for this case.

---

## Files to Change

| File | Change |
|---|---|
| `src/css.ts` | `.write-area`: switch to `position: relative`. `.render-layer` (rename from `.backdrop`): `position: relative`, remove `overflow`/scrollbar rules, move `white-space: pre-wrap` here directly. `textarea`: `position: absolute; inset: 0; height: 100%; overflow: hidden`. Remove `.backdrop-content` rule. |
| `src/element.ts` | Rename `.backdrop` → `.render-layer` in `render()`. Update `#cacheDOMRefs`. Remove `#backdropContent` ref. Update highlight writes to target `#renderLayer`. Remove `scroll` listener. Remove scroll-sync from `#scheduleHighlight`. |

---

## What This Does NOT Change

- Prism.js CDN loading and `highlightMarkdown()` — unchanged
- `\u00a0` trailing space in `highlightMarkdown` — still required
- Tab alignment: `white-space: pre-wrap` on both render layer and textarea; tab rendering still matched
- Autocomplete dropdown, upload rows, status bar — unchanged
- Form association, event emission — unchanged
