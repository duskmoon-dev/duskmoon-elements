# Implementation Plan: `el-dm-markdown-input`

**Branch**: `001-el-markdown-input` | **Date**: 2026-03-09 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-el-markdown-input/spec.md`

## Summary

Implement `<el-dm-markdown-input>` (`@duskmoon-dev/el-markdown-input`) — a form-associated, framework-agnostic markdown editor custom element with syntax-highlighted write mode (backdrop technique + Prism CDN), live preview (`.markdown-body` from `@duskmoon-dev/core`), file upload (XHR with progress), `@mention`/`#reference` autocomplete dropdown, and a live status bar. Ships with a Phoenix LiveView hook.

---

## Technical Context

**Language/Version**: TypeScript (ES2022+ target, `strict: true`)
**Primary Dependencies**: `@duskmoon-dev/el-base` (BaseElement, css tag), `@duskmoon-dev/core` (markdown-body styles), Prism.js v1.29.0 (CDN, not bundled)
**Storage**: N/A — element holds in-memory state only
**Testing**: Bun test (`bun:test`), happy-dom environment
**Target Platform**: Modern browsers — Chrome/Edge 84+, Firefox 101+, Safari 16.4+ (ElementInternals baseline)
**Project Type**: Single npm package within Bun workspace monorepo
**Performance Goals**: Syntax highlight debounced at 60ms; status bar debounced at 100ms; no jank on 100k-char input
**Constraints**: No bundled external deps (Prism loaded from CDN); Shadow DOM isolation; first form-associated element in this repo
**Scale/Scope**: Single package, 6 source files, ~800–1200 lines of TypeScript across all modules

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| I. Web Standards First | No framework deps; Custom Elements v1 + Shadow DOM v1 | ✅ PASS — Prism is a CDN load, not a framework |
| II. BaseElement Pattern | Extends `BaseElement`; uses `properties`, `render()`, `attachStyles()`, exports `register()` | ✅ PASS — `ElDmMarkdownInput extends BaseElement` |
| III. Package Independence | `@duskmoon-dev/el-markdown-input`, no cross-element deps | ✅ PASS |
| IV. Type Safety | TypeScript strict mode, explicit public API types, `declare` for reactive props | ✅ PASS |
| V. Accessibility & Theming | WAI-ARIA (textarea + tablist roles), keyboard navigation, CSS custom properties | ✅ PASS — dropdown keyboard nav, `[dark]` attribute, `--md-*` vars |
| VI. Design System Bridge | Uses `@duskmoon-dev/core/components/markdown-body` for preview; `--color-*` fallbacks in CSS vars | ✅ PASS |

**No violations. No complexity justification table needed.**

**Post-design re-check**: The `static formAssociated = true` pattern and `ElementInternals` use are Web Standards (not framework) — Principle I is still satisfied. The override of `update()` to prevent textarea destruction is an established escape hatch (precedent: `el-dm-tabs`).

---

## Project Structure

### Documentation (this feature)

```
specs/001-el-markdown-input/
├── plan.md              # This file
├── research.md          # Phase 0 output ✅
├── data-model.md        # Phase 1 output ✅
├── quickstart.md        # Phase 1 output ✅
├── contracts/
│   └── element-api.ts   # Phase 1 output ✅
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code

```
elements/markdown-input/
├── src/
│   ├── index.ts          # Re-exports: ElDmMarkdownInput, register(), MarkdownInputHook
│   ├── element.ts        # ElDmMarkdownInput — main class, DOM wiring, lifecycle
│   ├── highlight.ts      # ensurePrism(), highlightMarkdown(), applyPrismTheme()
│   ├── upload.ts         # uploadFile(), fileToMarkdown(), drag/paste/click handlers
│   ├── autocomplete.ts   # detectTrigger(), confirmSuggestion(), dropdown rendering
│   ├── status-bar.ts     # countWords(), countColour(), status bar HTML
│   └── css.ts            # Shadow DOM stylesheet (css tagged template)
├── package.json          # @duskmoon-dev/el-markdown-input
├── tsconfig.json         # extends ../../tsconfig.json
└── README.md
```

**Structure Decision**: Single package following the established element pattern. Multi-file split (6 modules) mirrors `el-dm-markdown` which splits themes into `src/themes/` — justified by each module's distinct responsibility and independent testability.

---

## Implementation Phases

### Phase A — Package Scaffold

Create `elements/markdown-input/` with `package.json`, `tsconfig.json`, stub source files. Configure build scripts mirroring `@duskmoon-dev/el-tabs`.

**Key configuration**:
- `build:esm` / `build:cjs` — externalize `@duskmoon-dev/el-base` and `@duskmoon-dev/core`
- `tsconfig.json` references `../../packages/base`
- `bunfig.toml` with `preload = ["../../test-setup.ts"]`

---

### Phase B — CSS Module (`css.ts`)

Define the complete Shadow DOM stylesheet:
- Layout: `.editor` wrapper, `.toolbar` tab bar, `.write-area` (relative position), `.backdrop` (absolute, `pointer-events: none`), `<textarea>` (transparent color, `caret-color`)
- Status bar: `.status-bar` flex row, `.status-bar-count` span
- Autocomplete dropdown: `.ac-dropdown` (absolute, `z-index`)
- Upload progress: `.upload-row` with `.upload-bar` (progress fill)
- Inline error: `.upload-error` with auto-dismiss animation
- CSS custom properties: `--md-*` vars on `:host` with `--color-*` fallbacks
- `[dark]` attribute overrides for dark values
- Prism theme injection placeholder (handled by `highlight.ts` via `<style>`)

---

### Phase C — Highlight Module (`highlight.ts`)

1. Module-level `let _prismReady: Promise<void> | null = null`
2. `ensurePrism()` — checks `window.Prism`, injects `<script>` into `document.head` if needed, returns cached promise
3. `highlightMarkdown(text)` — escapes HTML, calls `Prism.highlight(text, Prism.languages.markdown, 'markdown')`, appends `&nbsp;` for trailing newline
4. `applyPrismTheme(shadowRoot, dark)` — creates/updates `<style id="prism-theme">` inside shadowRoot using CDN theme CSS URL (`@import`)

---

### Phase D — Status Bar Module (`status-bar.ts`)

1. `countWords(text)` — `text.trim().split(/\s+/).filter(Boolean).length`
2. `countColour(wordCount, maxWords)` — returns `'normal' | 'warning' | 'error'`
3. `renderStatusBar(state)` — returns HTML string for the status bar content

---

### Phase E — Upload Module (`upload.ts`)

1. `uploadFile(file, uploadUrl, onProgress)` — XHR POST multipart/form-data; resolves with URL string; rejects with error message
2. `fileToMarkdown(file, url)` — returns `![name](url)` for images, `[name](url)` otherwise
3. Event handlers (called from `element.ts`):
   - `handleDrop(e, uploadUrl, callbacks)` — drag event handler
   - `handlePaste(e, uploadUrl, callbacks)` — paste event handler (image files only)
   - `handleFileInput(files, uploadUrl, callbacks)` — file picker handler
4. Accepted types check: `image/*, application/pdf, .zip, .txt, .csv, .json, .md`

---

### Phase F — Autocomplete Module (`autocomplete.ts`)

1. `detectTrigger(value, cursorPos)` — backward scan from cursor; returns trigger info or `null`
2. `confirmSuggestion(value, triggerPos, cursorPos, trigger, replacement)` — string surgery to replace trigger+query with replacement
3. `renderDropdown(suggestions, selectedIndex)` — returns HTML string for `.ac-dropdown`

---

### Phase G — Element Class (`element.ts`)

The main class wires all modules together. Key implementation points:

**Class definition**:
```ts
export class ElDmMarkdownInput extends BaseElement {
  static formAssociated = true as const;

  static properties = {
    name: { type: String, reflect: true, default: '' },
    value: { type: String, default: '' },  // NOT reflected (content can be large)
    placeholder: { type: String, reflect: true, default: 'Write markdown…' },
    disabled: { type: Boolean, reflect: true },
    uploadUrl: { type: String, reflect: true, attribute: 'upload-url' },
    maxWords: { type: Number, reflect: true, attribute: 'max-words' },
    dark: { type: Boolean, reflect: true },
  };
```

**Rendering strategy — override `update()`**:
```
Initial render (connectedCallback → first update()):
  shadowRoot.innerHTML = fullRender()  ← builds complete DOM tree

Subsequent updates (property changes):
  Only patch changed regions:
  - Status bar: query('.status-bar-count').innerHTML = renderStatusCount()
  - Tab switch: toggle .write-area / .preview-body visibility
  - Dropdown: query('.ac-dropdown').innerHTML / toggle hidden
  Do NOT replace textarea, backdrop, or upload rows
```

**Form association**:
```ts
#internals!: ElementInternals;

connectedCallback() {
  super.connectedCallback();
  this.#internals = this.attachInternals();
  // ... rest of setup
}

// On every content change:
this.#internals.setFormValue(this.#getTextarea().value);
```

**ResizeObserver** (for backdrop sync):
```ts
#resizeObserver = new ResizeObserver(() => {
  const ta = this.#getTextarea();
  const bd = this.#getBackdrop();
  if (ta && bd) {
    bd.style.height = `${ta.offsetHeight}px`;
  }
});
// Observe textarea after initial render
```

**Debounce timers**:
```ts
#highlightTimer: ReturnType<typeof setTimeout> | null = null;  // 60ms
#statusTimer: ReturnType<typeof setTimeout> | null = null;     // 100ms
```

**Tab switching**: Toggle CSS classes / hidden attribute; populate `.preview-body.innerHTML` with `renderMarkdown(textarea.value)` on switch to preview.

---

### Phase H — Index Module (`index.ts`)

```ts
export { ElDmMarkdownInput } from './element.js';
export type { Suggestion } from './contracts.js';

export function register(): void {
  if (!customElements.get('el-dm-markdown-input')) {
    customElements.define('el-dm-markdown-input', ElDmMarkdownInput);
  }
}

export const MarkdownInputHook = {
  mounted() {
    this.el.setValue(this.el.dataset.value ?? '');
    this.el.addEventListener('change', (e: CustomEvent) =>
      this.pushEvent('content_changed', { value: e.detail.value })
    );
    this.el.addEventListener('upload-start', (e: CustomEvent) =>
      this.pushEvent('upload_file', { name: e.detail.file.name })
    );
  },
  updated() {
    const v = this.el.dataset.value;
    if (v !== undefined && v !== this.el.getValue()) {
      this.el.setValue(v);
    }
  }
};
```

---

### Phase I — Tests

Test files and coverage targets:

| File | Tests |
|------|-------|
| `status-bar.test.ts` | `countWords` edge cases, `countColour` thresholds |
| `autocomplete.test.ts` | `detectTrigger` all patterns, `confirmSuggestion` replacements |
| `upload.test.ts` | `fileToMarkdown` for image/non-image, XHR mock |
| `highlight.test.ts` | `highlightMarkdown` escaping, no-Prism fallback |
| `el-dm-markdown-input.test.ts` | Element mount, getValue/setValue, form value, tab switch |

**Mocks needed**:
- `window.Prism` — mock object with `highlight()` method
- `ResizeObserver` — mock class (happy-dom has none)
- `ElementInternals` — mock with `setFormValue()` spy

---

## Key Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| `update()` override destroys textarea | Override in element class; only patch named DOM regions after initial render |
| Prism CDN unavailable in test env | Mock `window.Prism`; `highlightMarkdown` falls back gracefully |
| `ElementInternals` support in happy-dom | Mock in test setup; real behaviour tested in browser |
| Backdrop font drift | CSS block in `css.ts` enforces identical font metrics between textarea and backdrop |
| ResizeObserver missing in happy-dom | Mock in `bunfig.toml` preload / test setup |
| Scroll sync lag | Sync `backdrop.scrollTop` on both `input` and `scroll` events inline (no debounce) |

---

## Dependency Map

```
el-dm-markdown-input
├── @duskmoon-dev/el-base          (workspace:*)  — BaseElement, css tag
├── @duskmoon-dev/core             (^1.x)         — markdown-body CSS
└── Prism.js 1.29.0                (CDN only)     — syntax highlighting
```

No runtime peer deps. Phoenix LiveView and Prism are both optional / CDN-loaded.
