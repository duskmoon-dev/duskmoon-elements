# Research: `el-dm-markdown-input` Element

**Branch**: `001-el-markdown-input` | **Phase**: 0 | **Date**: 2026-03-09

---

## 1. Form-Associated Custom Elements (ElementInternals)

**Decision**: Use `static formAssociated = true` + `this.attachInternals()` directly on the `ElDmMarkdownInput` class. `BaseElement` does not need to change.

**Rationale**: `ElementInternals` is the standard Web API for native form participation. No existing element in this monorepo uses it — `el-dm-markdown-input` will be the first. The pattern is self-contained: attach internals in `connectedCallback`, call `setFormValue()` on every content change.

**Alternatives considered**:
- Hidden `<input type="hidden">` in Shadow DOM — rejected: would require manual name/value wiring and breaks native constraint validation APIs
- Relying on host form scripts — rejected: violates the "zero glue code for basic form use" success criterion

**Browser support**: Chrome 77+, Firefox 93+, Safari 16.4+ — within the constitution's required baseline.

---

## 2. Rendering Strategy: Textarea Preservation

**Decision**: Override `update()` in `ElDmMarkdownInput` to perform **incremental DOM patching** rather than full `shadowRoot.innerHTML` replacement.

**Rationale**: `BaseElement.update()` calls `render()` and sets `shadowRoot.innerHTML = content`. This destroys the textarea and its value on every reactive property change (e.g. when `max-words` updates the status bar). The element renders its full DOM structure once (in `connectedCallback` via initial `update()`), then subsequent updates only touch specific named regions:
- `.backdrop-content` — updated on debounced input for highlighting
- `.status-bar-count` — updated on debounced input for word/char count
- `.preview-body` — updated when switching to preview tab

The textarea itself is never re-created after initial render.

**Pattern** (from `el-dm-tabs` precedent): `update()` is already overridden in `ElDmTabs` to re-attach event listeners after re-render — confirming this is an established escape hatch.

**Alternatives considered**:
- Saving and restoring textarea value around `innerHTML` reset — rejected: loses cursor position, selection state, and scroll position; also fires spurious input events
- Diffing library (morphdom etc.) — rejected: external dependency, violates constitution's no-framework rule

---

## 3. Prism.js Loading in Shadow DOM

**Decision**: Load Prism as a CDN UMD script tag injected into `<head>` (not Shadow DOM). Inject Prism theme CSS as a `<style>` element **inside** the Shadow DOM. Check `window.Prism` before loading.

**Rationale**: Prism v1.29.0 is a UMD bundle that attaches to `window.Prism`. It does not need to be in Shadow DOM — it operates on DOM nodes passed to `Prism.highlight()`. The theme CSS (`.token.keyword` etc.) **must** be in the Shadow DOM since Shadow DOM scopes styles.

**Loading flow**:
```
first render → check window.Prism
  if absent → inject <script src="cdnjs.../prism.js"> into document.head
             → inject grammar scripts sequentially (or via autoloader)
             → on script.onload → trigger initial highlight pass
  if present → highlight immediately
```

A module-level `let prismReady: Promise<void>` caches the load promise so concurrent elements share one load.

**Prism theme injection**: A `<style id="prism-theme">` element in the Shadow DOM is created once during `connectedCallback`. Its content swaps between `prism-tomorrow` (dark) and `prism-coy` (light) based on `[dark]` attribute changes.

**CDN URLs** (from PRD):
- Core: `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js`
- Autoloader: `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js`
- Theme tomorrow: `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css`
- Theme coy: `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-coy.min.css`

**Graceful degradation**: If CDN load fails, the debounced highlight function silently no-ops. Editor remains fully functional.

**Alternatives considered**:
- Bundling Prism — rejected: significantly increases bundle size for an optional feature; many hosts already have Prism
- Import via ESM — rejected: Prism 1.x is not an ESM module; v2 is not stable yet

---

## 4. Backdrop Technique Implementation

**Decision**: Use `position: relative` wrapper `.write-area`, with `.backdrop` (`position: absolute`, `pointer-events: none`, `inert`, `aria-hidden`) overlaid by `<textarea>` (`color: transparent`, `caret-color: var(--md-text)`, `background: transparent`).

**Critical constraints** (from PRD):
- Backdrop and textarea share: `font-family`, `font-size`, `line-height`, `padding`, `white-space: pre-wrap`, `word-wrap: break-word`, `overflow-wrap: break-word`
- `backdrop.scrollTop = textarea.scrollTop` on every `input` and `scroll` event
- `ResizeObserver` on textarea → mirror `width`/`height` to backdrop (or use `width: 100%; height: 100%` with matching overflow)
- Highlight debounce: 60ms using `setTimeout` + `clearTimeout`

**Highlight process**:
1. Get `textarea.value`
2. Escape HTML (`&` → `&amp;`, `<` → `&lt;`, `>` → `&gt;`)
3. Pass to `Prism.highlight(text, Prism.languages.markdown, 'markdown')`
4. Append `&nbsp;` to prevent backdrop height collapse on trailing newlines
5. Set `backdrop.innerHTML = highlighted`

**Alternatives considered**:
- CodeMirror/Monaco — rejected: heavy external dependency, violates constitution
- `contenteditable` — rejected: significantly more complex cursor/selection management

---

## 5. CSS Custom Properties: `--md-*` vs `--color-*`

**Decision**: The element exposes a **local theming API** using `--md-*` custom properties (as specified in PRD), which map to the design system's `--color-*` tokens as defaults. Both coexist.

**Rationale**: The constitution mandates using `--color-*` for **internal** styling (borders, text colors, focus rings from the core design system). The `--md-*` vars are the **external consumer API** — they let host applications customise the markdown input independently of the global theme. This pattern is already used implicitly in `el-dm-markdown` which exposes `--markdown-font-family`, `--markdown-code-font-family`.

**Mapping** (in element's Shadow DOM stylesheet):
```css
:host {
  --md-border: var(--color-outline, #d0d7de);
  --md-border-focus: var(--color-primary, #0969da);
  --md-bg: var(--color-surface, #ffffff);
  --md-text: var(--color-on-surface, #1f2328);
  /* etc. */
}
```

This means: if the host sets `--md-border: red`, it overrides. If not set, it inherits from the core design system automatically.

---

## 6. Autocomplete Dropdown Positioning

**Decision**: Position the dropdown using `position: absolute` relative to `.write-area`. Calculate `top` by counting lines from cursor position × `line-height`.

**Trigger detection algorithm**:
```
1. Get textarea.selectionStart
2. Scan backward through textarea.value from cursor
3. If hit whitespace/newline before trigger char → no trigger
4. If hit @ or # → extract query = text between trigger and cursor
5. If trigger found → fire event, else close dropdown
```

**Cursor line estimation** (approximate, sufficient for UX):
```
linesBefore = textarea.value.substring(0, selectionStart).split('\n').length - 1
dropdownTop = (linesBefore + 1) * lineHeight + paddingTop - textarea.scrollTop
```

**Confirmation replacement**:
```
value before trigger = textarea.value.slice(0, triggerPos)
value after cursor   = textarea.value.slice(cursorPos)
new value = before + '@' + suggestion.id + after
```

---

## 7. LiveView Hook Architecture

**Decision**: Export `MarkdownInputHook` as a plain object literal (not a class) from `src/index.ts`. Zero framework dependencies.

**Rationale**: Phoenix LiveView hooks are plain objects with `mounted()`, `updated()`, `destroyed()` lifecycle methods. No import from `phoenix_live_view` is needed in the JavaScript package — the hook object is passed to LiveSocket by the consumer. This keeps the npm package entirely framework-agnostic.

---

## 8. Module Structure Decision

**Decision**: Split into 6 source files as specified in PRD, with clear single responsibilities.

| File | Responsibility |
|------|---------------|
| `element.ts` | `ElDmMarkdownInput` class — wires all modules, handles lifecycle, DOM |
| `highlight.ts` | Prism loader + backdrop highlight function |
| `upload.ts` | XHR upload, drag/drop/paste handlers, progress tracking |
| `autocomplete.ts` | Trigger detection, dropdown render, keyboard navigation |
| `status-bar.ts` | Word count, char count, limit colouring |
| `css.ts` | Shadow DOM stylesheet (`css` tagged template) |
| `index.ts` | Re-exports element class, `register()`, `MarkdownInputHook` |

This follows the precedent of `el-dm-markdown` splitting theme CSS into `src/themes/`.

---

## 9. Preview Markdown Renderer

**Decision**: Use a minimal inline renderer — no external dependency. Implement only GFM subset needed for preview: headings, bold, italic, strikethrough, blockquotes, code blocks, inline code, links, images, lists, horizontal rules.

**Rationale**: The PRD explicitly states "no external dep" for the preview renderer. A ~150-line regex-based renderer is sufficient for preview purposes. For full fidelity, consumers can replace preview rendering by listening for the `change` event and rendering server-side (LiveView use case).

**Alternatives considered**:
- `marked.js` — rejected: external dependency
- `showdown.js` — rejected: external dependency
- Reusing `el-dm-markdown` — rejected: cross-element dependency violates constitution Principle III

---

## 10. Testing Approach

**Decision**: Unit-test pure logic (highlight string manipulation, trigger detection, word count, upload flow state machine) without DOM. Test element behaviour with `happy-dom` where needed.

**Constraints** (from memory):
- `happy-dom` has no `ResizeObserver` — mock it in tests
- `ElementInternals` support in happy-dom is limited — test form value via mock
- No `window.Prism` in test env — tests must mock `window.Prism`

**Test files**: `el-dm-markdown-input.test.ts` (element), `highlight.test.ts`, `upload.test.ts`, `autocomplete.test.ts`, `status-bar.test.ts`
