# Tasks: `el-dm-markdown-input` Custom Element

**Input**: Design documents from `/specs/001-el-markdown-input/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not included (not requested in spec). Add manually if TDD is desired.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Exact file paths in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the `elements/markdown-input/` package with all build/config files. No implementation logic yet.

- [x] T001 Create `elements/markdown-input/package.json` for `@duskmoon-dev/el-markdown-input` — name, version 0.1.0, type module, exports (`.` + `./register`), build scripts (`build:esm`, `build:cjs`, `build:types`), deps on `@duskmoon-dev/el-base: workspace:*` and `@duskmoon-dev/core: ^1.10.1`
- [x] T002 [P] Create `elements/markdown-input/tsconfig.json` — extends `../../tsconfig.json`, composite true, references `../../packages/base`, excludes `*.test.ts`
- [x] T003 [P] Create `elements/markdown-input/bunfig.toml` — `preload = ["../../test-setup.ts"]` for test environment setup

**Checkpoint**: Package scaffold ready — `bun install` from repo root resolves the new workspace entry

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shadow DOM stylesheet and element class skeleton that ALL user stories build on top of.

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete.

- [x] T004 Implement `elements/markdown-input/src/css.ts` — full Shadow DOM stylesheet using `css` tagged template: `:host` layout, `.toolbar` tab bar with `.tab-btn` (write/preview), `.write-area` (position: relative), `.backdrop` (position: absolute, pointer-events: none, inert, aria-hidden), `textarea` (color: transparent, caret-color: var(--md-text), background: transparent, z-index above backdrop), identical font metrics shared between backdrop and textarea (`font-family`, `font-size`, `line-height`, `padding`, `white-space: pre-wrap`, `word-wrap: break-word`), `.preview-body.markdown-body` container, `.status-bar` flex row, `.ac-dropdown` (position: absolute, z-index: 10), `.upload-row` with `.upload-bar` progress fill, `.upload-error` inline error, `--md-*` CSS custom properties on `:host` with `var(--color-*)` fallbacks, `:host([dark])` overrides for dark defaults
- [x] T005 Create `elements/markdown-input/src/element.ts` skeleton — `ElDmMarkdownInput extends BaseElement`, `static formAssociated = true as const`, `static properties` for `name`/`value`/`placeholder`/`disabled`/`uploadUrl`/`maxWords`/`dark` with correct types and attributes, `declare` for all reactive props, `attachStyles(styles)` in constructor, override `update()` to patch DOM incrementally (full `shadowRoot.innerHTML` on first render only, then selective patching of named regions thereafter), `connectedCallback` calling `super.connectedCallback()`, `disconnectedCallback` calling `super.disconnectedCallback()`, `render()` returning complete initial DOM string (toolbar, write-area with backdrop + textarea, preview-body, status-bar, ac-dropdown, upload-list regions)

**Checkpoint**: Foundation ready — element mounts and renders its DOM shell; all story phases can now proceed sequentially

---

## Phase 3: User Story 1 — Write and Preview Markdown (Priority: P1) 🎯 MVP

**Goal**: A user can type markdown in the editor with syntax highlighting and switch to a rendered preview tab.

**Independent Test**: Mount `<el-dm-markdown-input>` with no attributes. Type `# Hello **world**`. Verify highlighted backdrop updates within 100ms. Click Preview tab. Verify rendered HTML appears. Click Write tab. Verify original markdown is still present.

- [x] T006 [US1] Implement `elements/markdown-input/src/highlight.ts` — `ensurePrism(): Promise<void>` (checks `window.Prism`, injects `<script src="cdnjs.../prism.min.js">` and autoloader into `document.head` if absent, caches as module-level `let _prismReady: Promise<void> | null = null`); `highlightMarkdown(text: string): string` (escapes `&`, `<`, `>` in that order, calls `window.Prism?.highlight(escaped, Prism.languages.markdown, 'markdown') ?? escaped`, appends `&nbsp;` if trailing newline); `applyPrismTheme(shadowRoot: ShadowRoot, dark: boolean): void` (creates/updates `<style id="prism-theme">` inside shadowRoot with `@import url(cdnjs.../prism-tomorrow.min.css)` for dark or `prism-coy.min.css` for light)
- [x] T007 [US1] Wire Write tab in `elements/markdown-input/src/element.ts` — in `update()` after initial render, query textarea and backdrop; attach `input` handler: fires `change` event with `{ value: textarea.value }`, clears/sets 60ms debounce timer calling `highlightMarkdown(textarea.value)` → `backdrop.innerHTML = highlighted`; attach `scroll` handler: `backdrop.scrollTop = textarea.scrollTop`; attach `ResizeObserver` on textarea mirroring `height` to backdrop; call `ensurePrism()` + `applyPrismTheme(shadowRoot, this.dark)` on first connect
- [x] T008 [US1] Implement minimal markdown renderer in `elements/markdown-input/src/element.ts` — private `#renderMarkdown(md: string): string` using sequential regex replacements for: fenced code blocks (preserve content), headings (#–######), bold (`**`/`__`), italic (`*`/`_`), strikethrough (`~~`), blockquotes (`>`), horizontal rules, inline code (`` ` ``), links (`[text](url)`), images (`![alt](url)`), unordered lists, ordered lists, paragraphs; escape HTML in non-code content; wrap result in `<div class="preview-body markdown-body">`
- [x] T009 [US1] Wire Preview tab switching in `elements/markdown-input/src/element.ts` — in `update()` after initial render, attach click handlers to `.tab-btn[data-tab="write"]` and `.tab-btn[data-tab="preview"]`; on Write tab click: show `.write-area`, hide `.preview-body`, set `[aria-selected]` on buttons; on Preview tab click: hide `.write-area`, call `#renderMarkdown(textarea.value)`, set `.preview-body.innerHTML`, show `.preview-body`, update `[aria-selected]`; initial state shows Write tab
- [x] T010 [US1] Implement `getValue()` and `insertText()` public methods in `elements/markdown-input/src/element.ts` — `getValue(): string` returns `this.#getTextarea()?.value ?? ''`; `insertText(str: string): void` gets textarea, uses `selectionStart`/`selectionEnd` to splice `str` into `textarea.value`, sets cursor to end of inserted text, fires `input` event, fires `change` event with new value; `setValue(str: string): void` sets `textarea.value = str`, syncs form value, updates backdrop highlight debounced
- [x] T011 [US1] Handle `dark` attribute reactivity in `elements/markdown-input/src/element.ts` — when `dark` property changes, call `applyPrismTheme(shadowRoot, this.dark)` to swap Prism theme stylesheet

**Checkpoint**: US1 fully functional — editor highlights markdown, Preview renders HTML, tab switching works, `getValue()`/`setValue()`/`insertText()` work

---

## Phase 4: User Story 2 — Form Participation and Value Binding (Priority: P1)

**Goal**: `<el-dm-markdown-input name="body">` inside a `<form>` submits markdown under `body` like a native textarea.

**Independent Test**: Wrap element in `<form>`. Type text. Submit. Verify FormData contains `body` = typed text. Call `setValue("preset")` via JS. Verify FormData contains `body` = `"preset"`.

- [x] T012 [US2] Implement form association in `elements/markdown-input/src/element.ts` — declare `#internals!: ElementInternals`; in `connectedCallback`, call `this.#internals = this.attachInternals()`; add private `#syncFormValue(): void` that calls `this.#internals?.setFormValue(this.getValue())`; call `#syncFormValue()` from the textarea `input` handler and from `setValue()`; observe `name` attribute changes to ensure `#internals` uses the current name (ElementInternals uses the element's `name` property automatically via the associated form)

**Checkpoint**: US1 + US2 functional — element submits via native forms with zero consumer JavaScript

---

## Phase 5: User Story 3 — File Upload (Priority: P2)

**Goal**: Users can drop, paste, or click-to-attach files; uploaded files insert markdown snippets at cursor.

**Independent Test**: Set `upload-url` to a test endpoint. Drop an image onto the editor. Verify `upload-start` event fires, progress row appears, on server success `![name](url)` is inserted, progress row removes itself.

- [x] T013 [US3] Implement `elements/markdown-input/src/upload.ts` — `uploadFile(file: File, uploadUrl: string, onProgress: (pct: number) => void): Promise<string>` using `XMLHttpRequest`, `FormData` with field `file`, `xhr.upload` progress listener computing `(e.loaded / e.total) * 100`, resolves with `JSON.parse(xhr.responseText).url` on 2xx, rejects with error message on non-2xx or network error; `fileToMarkdown(file: File, url: string): string` returns `` `![${file.name}](${url})` `` for `file.type.startsWith('image/')` else `` `[${file.name}](${url})` ``; `isAcceptedType(file: File): boolean` checks against `image/*, application/pdf, .zip, .txt, .csv, .json, .md`
- [x] T014 [P] [US3] Wire drag-and-drop in `elements/markdown-input/src/element.ts` — in `update()` after initial render, attach `dragover` (prevent default + add drag-over visual class) and `drop` handlers on `.write-area`; `drop` handler: extract `e.dataTransfer.files`, filter by `isAcceptedType`, for each file: emit `upload-start`, call `#startUpload(file)` which creates a progress row in `.upload-list`, calls `uploadFile()`, updates row progress on callback, on success calls `insertText(fileToMarkdown(file, url))` + emits `upload-done` + removes row, on error emits `upload-error` + shows error row that auto-dismisses after 4s via `setTimeout`
- [x] T015 [P] [US3] Wire clipboard paste in `elements/markdown-input/src/element.ts` — attach `paste` handler on textarea; extract `e.clipboardData.files` filtered to `file.type.startsWith('image/')` only; if image files found, `e.preventDefault()` and run same `#startUpload()` flow as drag-and-drop
- [x] T016 [P] [US3] Wire file picker in `elements/markdown-input/src/element.ts` — in `update()` after initial render, attach `click` handler on `.attach-btn` in status bar that programmatically clicks a hidden `<input type="file" multiple accept="image/*,application/pdf,.zip,.txt,.csv,.json,.md">` in the Shadow DOM; attach `change` handler on that input calling `#startUpload()` for each selected file

**Checkpoint**: US3 functional independently of US4/US5 — all three upload entry points work

---

## Phase 6: User Story 4 — Autocomplete for Mentions and References (Priority: P2)

**Goal**: Users type `@query` or `#query` and get a keyboard-navigable dropdown populated by the host.

**Independent Test**: Listen for `mention-query`. Type `@al`. Verify event fires with `{ trigger: "@", query: "al" }`. Call `resolve([{ id: "asmith", label: "Ali Smith" }])`. Verify dropdown renders. Press Enter. Verify `@al` is replaced with `@asmith`.

- [x] T017 [US4] Implement `elements/markdown-input/src/autocomplete.ts` — `detectTrigger(value: string, cursorPos: number): { trigger: '@' | '#'; query: string; triggerPos: number } | null` scanning backward from cursor to find `@word` or `#word` since last whitespace/newline; `confirmSuggestion(value: string, triggerPos: number, cursorPos: number, trigger: string, replacement: string): { newValue: string; newCursorPos: number }` splicing replacement into value; `renderDropdown(suggestions: Suggestion[], selectedIndex: number): string` returning HTML for `.ac-dropdown` with `<ul>` of `<li data-ac-index>` items each showing label + optional subtitle
- [x] T018 [US4] Wire autocomplete in `elements/markdown-input/src/element.ts` — in textarea `input` handler, call `detectTrigger(textarea.value, textarea.selectionStart)`; if trigger found: fire `mention-query` or `reference-query` with `{ trigger, query, resolve: (list) => this.setSuggestions(list) }`; if no trigger: close dropdown; implement `setSuggestions(list: Suggestion[]): void` that stores list and index, calls `#updateDropdown()`; `#updateDropdown()` sets `.ac-dropdown.innerHTML = renderDropdown(...)` and toggles `hidden`; attach `keydown` handler on textarea for `ArrowUp`/`ArrowDown` (adjust `selectedIndex`, call `#updateDropdown()`), `Enter`/`Tab` (call `#confirmAutocomplete()`), `Escape` (close dropdown); `#confirmAutocomplete()` calls `confirmSuggestion()`, sets `textarea.value`, places cursor, fires `change` event, closes dropdown; attach click handler on `.ac-dropdown` delegating to `[data-ac-index]` items

**Checkpoint**: US4 functional — `@` and `#` autocomplete work independently of upload feature

---

## Phase 7: User Story 5 — Status Bar with Word and Character Count (Priority: P3)

**Goal**: Footer shows live word/char count; turns amber/red when approaching `max-words` cap.

**Independent Test**: Mount with `max-words="50"`. Type 45 words. Verify status bar shows `45 / 50 words` in amber. Type 5 more. Verify count turns red.

- [x] T019 [US5] Implement `elements/markdown-input/src/status-bar.ts` — `countWords(text: string): number` using `text.trim().split(/\s+/).filter(Boolean).length`; `countColour(wordCount: number, maxWords: number | null): 'normal' | 'warning' | 'error'` returning `'error'` at ≥100%, `'warning'` at ≥90%, `'normal'` otherwise; `renderStatusCount(wordCount: number, charCount: number, maxWords: number | null): string` returning HTML fragment for the count span with appropriate colour class
- [x] T020 [US5] Wire status bar in `elements/markdown-input/src/element.ts` — in textarea `input` handler, add 100ms debounced call to `#updateStatusBar()`; `#updateStatusBar()` computes `countWords(textarea.value)`, `textarea.value.length`, calls `renderStatusCount(...)`, patches only `.status-bar-count.innerHTML` (no full re-render); wire `maxWords` reactive property change to also trigger `#updateStatusBar()`; initial call to `#updateStatusBar()` in `connectedCallback`

**Checkpoint**: US5 functional — status bar updates live; word cap colours work; does not interfere with US3/US4

---

## Phase 8: User Story 6 — LiveView Hook Integration (Priority: P3)

**Goal**: Phoenix LiveView developers add `phx-hook="MarkdownInput"` to get automatic value sync.

**Independent Test**: Import `MarkdownInputHook`. Mount element with `data-value="initial"`. Call `hook.mounted()`. Verify `getValue() === "initial"`. Simulate typing. Verify `pushEvent("content_changed", ...)` was called. Change `data-value`. Call `hook.updated()`. Verify `setValue()` was called.

- [x] T021 [US6] Implement `elements/markdown-input/src/index.ts` — `export { ElDmMarkdownInput } from './element.js'`; `export type { Suggestion } from './types.js'` (or inline); `export function register(): void` with `customElements.get` guard; `export const MarkdownInputHook = { mounted() { this.el.setValue(this.el.dataset.value ?? ''); this.el.addEventListener('change', e => this.pushEvent('content_changed', { value: e.detail.value })); this.el.addEventListener('upload-start', e => this.pushEvent('upload_file', { name: e.detail.file.name })); }, updated() { const v = this.el.dataset.value; if (v !== undefined && v !== this.el.getValue()) { this.el.setValue(v); } } }`; also create `elements/markdown-input/src/register.ts` with `import { register } from './index.js'; register();`

**Checkpoint**: US6 functional — LiveView hook syncs value on mount and pushes changes; `register.ts` allows auto-registration

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Build verification, documentation, lint/type fixes, and accessibility hardening.

- [x] T022 Add WAI-ARIA attributes in `elements/markdown-input/src/element.ts` — `role="tablist"` on toolbar, `role="tab"` + `aria-selected` on tab buttons, `role="tabpanel"` on write-area and preview-body, `aria-label` on textarea, `role="listbox"` on `.ac-dropdown`, `role="option"` + `aria-selected` on dropdown items, `aria-live="polite"` on `.status-bar-count`
- [x] T023 [P] Add keyboard shortcut `Ctrl+Shift+P` to toggle preview tab in `elements/markdown-input/src/element.ts` — attach `keydown` on `:host`, guard for Ctrl+Shift+P, programmatically switch active tab
- [x] T024 [P] Complete `elements/markdown-input/README.md` — installation, basic form usage, upload setup, autocomplete wiring, LiveView hook, CSS custom properties table, attribute reference table
- [x] T025 Run `bun run --filter @duskmoon-dev/el-markdown-input build` and fix all TypeScript compilation errors in `elements/markdown-input/src/`
- [x] T026 Run `bun run --filter @duskmoon-dev/el-markdown-input lint:check` and fix all ESLint errors in `elements/markdown-input/src/`
- [x] T027 Validate quickstart.md scenarios in vite playground — register element, verify form submission, upload flow, autocomplete, status bar, LiveView hook manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user story phases
- **US1 (Phase 3)**: Depends on Phase 2 — builds on element skeleton
- **US2 (Phase 4)**: Depends on Phase 3 — adds form association to the working editor
- **US3 (Phase 5)**: Depends on Phase 3 (needs `insertText()`) — US4 not required
- **US4 (Phase 6)**: Depends on Phase 3 (needs `insertText()`) — US3 not required
- **US5 (Phase 7)**: Depends on Phase 2 only — status bar patches a named DOM region independently
- **US6 (Phase 8)**: Depends on Phase 3 (needs `getValue()`/`setValue()`) — independent of US3/US4/US5
- **Polish (Phase 9)**: Depends on all desired phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational — no dependency on other stories
- **US2 (P1)**: Depends on US1 (uses `getValue()`, `setValue()`) — integrates with US1 textarea
- **US3 (P2)**: Depends on US1 (`insertText()`) — independent of US2, US4
- **US4 (P2)**: Depends on US1 (`insertText()`) — independent of US2, US3
- **US5 (P3)**: Depends on Foundational only — status bar is a named region patch
- **US6 (P3)**: Depends on US1 (`getValue()`, `setValue()`) — independent of US3, US4, US5

### Within Each Phase

- Tasks touching different files are marked `[P]` and can run in parallel
- Tasks touching `element.ts` must run sequentially within a phase (same file)
- Phase 3 (US1) tasks T006–T011 are sequential — each builds on the previous

### Parallel Opportunities

All `[P]`-marked tasks within a phase can execute concurrently:
- Phase 1: T002 + T003 in parallel with T001
- Phase 5 (US3): T014 + T015 + T016 in parallel after T013
- Phase 9: T023 + T024 in parallel with T022

---

## Parallel Example: User Story 3 (File Upload)

```
# Sequential prerequisite:
T013 — Implement upload.ts (uploadFile, fileToMarkdown, isAcceptedType)

# Then all three entry points in parallel:
T014 — Wire drag-and-drop in element.ts
T015 — Wire clipboard paste in element.ts      ← same file, serialize with T014
T016 — Wire file picker in element.ts          ← same file, serialize with T015
```

> Note: T014/T015/T016 touch the same file (element.ts) so they must serialize. Only different-file tasks are truly parallel.

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 — Write/Preview editor
4. Complete Phase 4: US2 — Form participation
5. **STOP and VALIDATE**: Editor works, form submits, `getValue()`/`setValue()` work
6. Ship as v0.1.0 — a functional markdown textarea replacement

### Incremental Delivery

1. Setup + Foundational → DOM shell renders
2. US1 + US2 → MVP: edit, preview, form submit
3. US3 → Add file upload
4. US4 → Add @mention/#reference autocomplete
5. US5 → Add status bar
6. US6 → Add LiveView hook
7. Polish → Production-ready v1.0.0

### Single-Developer Sequence

```
T001 → T002 → T003 → T004 → T005
→ T006 → T007 → T008 → T009 → T010 → T011
→ T012
→ T013 → T014 → T015 → T016
→ T017 → T018
→ T019 → T020
→ T021
→ T022 → T023 → T024 → T025 → T026 → T027
```

---

## Summary

| Phase | Story | Tasks | Can Parallel? |
|-------|-------|-------|---------------|
| 1: Setup | — | T001–T003 | T002, T003 |
| 2: Foundational | — | T004–T005 | No |
| 3: Write/Preview | US1 | T006–T011 | No (sequential) |
| 4: Form | US2 | T012 | — |
| 5: Upload | US3 | T013–T016 | T014, T015, T016 (after T013) |
| 6: Autocomplete | US4 | T017–T018 | No |
| 7: Status Bar | US5 | T019–T020 | No |
| 8: LiveView | US6 | T021 | — |
| 9: Polish | — | T022–T027 | T023, T024 |
| **Total** | | **27 tasks** | |

**Suggested MVP scope**: Phases 1–4 (T001–T012) → functional form-associated markdown editor.

---

## Notes

- `[P]` = different files, no incomplete dependencies — safe to parallelize
- `[Story]` maps each implementation task to its spec user story for traceability
- `element.ts` is touched in phases 2–8; tasks within each phase must be sequential
- `highlight.ts`, `upload.ts`, `autocomplete.ts`, `status-bar.ts` are each isolated modules — parallel with each other if two developers are available
- Stop at Phase 4 checkpoint to validate MVP independently before proceeding
- Run `bun run --filter @duskmoon-dev/el-markdown-input build` after each phase to catch type errors early
