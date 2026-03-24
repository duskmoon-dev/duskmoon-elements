# PRD: Fix Editor Render Layer for `<el-dm-markdown-input>`

> Fixes the write-tab layout so highlighted content and the textarea stay in sync at all sizes.
> Based on: `docs/plan-markdown-input-render-layer.md`

---

## Problem

The current write-tab uses a CSS grid where the `textarea` (fixed `min-height: 12rem`) and a `.backdrop` div (grows to content height) share a grid cell. Because the `.backdrop` expands to show all highlighted content while the textarea scrolls internally, the two layers diverge as soon as content exceeds `min-height`. Scroll-sync via `backdrop.scrollTop = textarea.scrollTop` has no effect because the backdrop has nothing to scroll.

**Symptoms**:
- Highlighted content is always anchored to the top of the write area
- Typing past `min-height` causes the textarea viewport to scroll away from the highlighted layer
- The overlay is misaligned whenever content overflows

---

## Goal

Align `<el-dm-markdown-input>` with the CodeMirror render model: the highlighted render layer lives in normal flow and drives the height of the container; the textarea is an absolutely-positioned, transparent overlay that always covers exactly the same rectangle as the render layer. No scroll sync required.

---

## Scope

| In scope | Out of scope |
|---|---|
| `elements/markdown-input/src/css.ts` | Prism.js CDN loading |
| `elements/markdown-input/src/element.ts` | `highlightMarkdown()` logic |
| `elements/markdown-input/src/highlight.ts` | Preview tab pipeline |
| — | Autocomplete, upload rows, status bar |
| — | Form association, event emission |

---

## Architecture

```
.write-area { position: relative }

┌─────────────────────────────────────┐
│ .render-layer  (in normal flow)     │  ← drives container height
│   highlighted/formatted content     │
│   pointer-events: none              │
└─────────────────────────────────────┘
         ↑ position: absolute; inset: 0
┌─────────────────────────────────────┐
│ textarea  (absolute overlay)        │  ← captures keystrokes only
│   color: transparent                │
│   caret-color: var(--md-text)       │
│   overflow: hidden                  │
└─────────────────────────────────────┘
```

**Data flow** (unchanged externally):
1. User types in `textarea` → `input` event fires
2. `highlightMarkdown(ta.value)` → sets `.render-layer` innerHTML
3. `.render-layer` grows/shrinks → `.write-area` height follows
4. `textarea` fills `.write-area` via `position: absolute; inset: 0`
5. No scroll sync. No height JS. No misalignment.

---

## Tasks

### Task 1 — Rename `.backdrop` → `.render-layer` in `element.ts`

- In `render()`: replace class `backdrop` with `render-layer`; remove the inner `.backdrop-content` child div
- In `#cacheDOMRefs`: query `.render-layer` (was `.backdrop`); remove `#backdropContent` ref
- Replace all `this.#backdropContent.innerHTML = ...` with `this.#renderLayer.innerHTML = ...`

**Acceptance**: `shadowRoot.querySelector('.render-layer')` returns the element; `.backdrop` and `.backdrop-content` no longer exist in the DOM.

---

### Task 2 — Rewrite layout CSS in `css.ts`

**`.write-area`** — switch from grid to `position: relative`:
```css
.write-area {
  position: relative;
  min-height: 12rem;
  flex: 1 1 auto;
}
```

**`.render-layer`** — normal flow, drives height, font metrics identical to textarea:
```css
.render-layer {
  position: relative;
  z-index: 1;
  pointer-events: none;
  min-height: 12rem;
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
  overflow: hidden;
  font-family: ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  padding: 0.75rem;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
```

Remove `.backdrop-content` rule and all `.backdrop` rules.

**Acceptance**: typing 50+ lines causes the write area to grow; highlighted content and the caret remain aligned throughout.

---

### Task 3 — Remove scroll listener in `element.ts`

- Delete the `scroll` event listener from `#attachEventHandlers`
- Remove scroll-sync code from `#scheduleHighlight` (the `backdrop.scrollTop = textarea.scrollTop` tail)

**Acceptance**: no `scroll` listener is registered on the textarea; no scroll-sync code remains.

---

### Task 4 — Verify trailing-newline padding

`highlightMarkdown` appends `\u00a0` to prevent the render layer collapsing when content ends with `\n`. Confirm this is still present after the refactor.

**Acceptance**: typing a trailing newline keeps the textarea caret visible (render layer has non-zero height for that line).

---

## Acceptance Criteria

| # | Criterion |
|---|---|
| 1 | Write area grows with content — no fixed height cap |
| 2 | Highlighted layer and textarea caret are always aligned |
| 3 | No scroll-sync code remains |
| 4 | Trailing `\u00a0` is still appended in `highlightMarkdown` |
| 5 | No `.backdrop` or `.backdrop-content` in DOM or CSS |
| 6 | Autocomplete, upload rows, status bar, preview tab — unaffected |
| 7 | `bun run --filter @duskmoon-dev/el-markdown-input build` passes |

---

## Files Changed

| File | Change |
|---|---|
| `elements/markdown-input/src/css.ts` | Rewrite `.write-area`, add `.render-layer`, rewrite `textarea`, remove `.backdrop*` rules |
| `elements/markdown-input/src/element.ts` | Rename class in `render()`, update DOM refs, remove scroll listener |
