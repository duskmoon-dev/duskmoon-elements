# Feature Specification: `el-dm-markdown-input` Custom Element

**Feature Branch**: `001-el-markdown-input`
**Created**: 2026-03-09
**Status**: Draft
**Input**: User description: "Create el-dm-markdown-input custom element with syntax highlighting, file upload, autocomplete, and status bar"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Write and Preview Markdown (Priority: P1)

A developer or content author opens a form page, types markdown content into the editor, and instantly switches to a preview tab to see rendered output — all without leaving the page or installing any plugins.

**Why this priority**: Writing and previewing markdown is the core value proposition. Every other feature is additive. Without this, the element has no purpose.

**Independent Test**: Mount `<el-dm-markdown-input>` on a page with no attributes. Type markdown text. Verify syntax highlighting appears in the editor. Switch to the Preview tab. Verify rendered HTML matches the markdown input.

**Acceptance Scenarios**:

1. **Given** the element is mounted with no attributes, **When** a user types `# Hello **world**`, **Then** the editor applies syntax highlighting to the heading and bold tokens within 100ms.
2. **Given** the user has typed markdown content, **When** the user clicks the Preview tab, **Then** the rendered HTML preview appears and accurately reflects the markdown.
3. **Given** the user is on the Preview tab, **When** the user clicks the Write tab, **Then** the original markdown source is shown with cursor position preserved.
4. **Given** the element has the `disabled` attribute, **When** the user attempts to type, **Then** the textarea rejects input and appears visually disabled.

---

### User Story 2 - Form Participation and Value Binding (Priority: P1)

A Phoenix or plain-HTML developer places `<el-dm-markdown-input name="body">` inside a `<form>`. When the form is submitted, the markdown content is included under the `body` field — identical to how a standard `<textarea name="body">` works.

**Why this priority**: Native form integration is a foundational requirement for all server-side frameworks and plain HTML usage. It eliminates the need for hidden inputs or JavaScript glue.

**Independent Test**: Wrap the element in a `<form>` with `name="body"`. Type text. Submit the form. Verify the submitted FormData contains `body` with the entered markdown value.

**Acceptance Scenarios**:

1. **Given** the element is inside a `<form>` with `name="body"`, **When** the user types content and the form is submitted, **Then** the form data contains `body` equal to the entered markdown.
2. **Given** the `value` attribute is set to a pre-filled string, **When** the page loads, **Then** the textarea displays that string and form data reflects it.
3. **Given** `setValue("new content")` is called via JavaScript, **When** the form is submitted, **Then** the submitted value equals `"new content"`.

---

### User Story 3 - File Upload via Drag, Paste, or Click (Priority: P2)

A user writing a post drags an image from their desktop onto the editor, or pastes an image from their clipboard. The file is uploaded to the server, and an image markdown snippet is automatically inserted at the cursor.

**Why this priority**: Inline media attachment is a high-frequency action for content creators. Without it, users must manually upload files elsewhere and paste URLs.

**Independent Test**: Set `upload-url` to a test endpoint. Drag an image file onto the editor. Verify an `upload-start` event fires, a per-file progress row appears, and on upload success an `![filename](url)` snippet is inserted at the cursor.

**Acceptance Scenarios**:

1. **Given** `upload-url` is set, **When** a user drags an image file onto the write area, **Then** an `upload-start` event fires and a progress row appears below the textarea.
2. **Given** an upload is in progress, **When** the XHR upload advances, **Then** the progress bar updates to reflect current upload percentage.
3. **Given** the upload succeeds with `{ url: "https://cdn/img.png" }`, **When** the response is received, **Then** `![img.png](https://cdn/img.png)` is inserted at the cursor and the progress row disappears.
4. **Given** `upload-url` is not set, **When** a user drops a file, **Then** an `upload-error` event fires with `"no upload-url set"` and an inline error message appears, auto-dismissing after 4 seconds.
5. **Given** `upload-url` is set, **When** a user pastes an image from clipboard, **Then** the same upload flow triggers as with drag-and-drop.
6. **Given** `upload-url` is set, **When** a user clicks the Attach button and selects a non-image file (e.g. PDF), **Then** `[filename.pdf](url)` is inserted on success.

---

### User Story 4 - Autocomplete for Mentions and References (Priority: P2)

A user typing a comment types `@ali` and a dropdown appears with matching team members. They press `↓`, `Enter` to confirm, and `@ali` is replaced with the selected user's handle.

**Why this priority**: Autocomplete for `@mentions` and `#references` enables structured linking to users and entities — a high-value productivity feature for collaborative platforms.

**Independent Test**: Listen for `mention-query` events. Type `@al` in the editor. Verify the event fires with `{ trigger: "@", query: "al" }`. Call `resolve([...])`. Verify the dropdown renders. Press `Enter`. Verify the text is replaced with the selected suggestion.

**Acceptance Scenarios**:

1. **Given** the user types `@ali`, **When** the input event fires, **Then** a `mention-query` event is dispatched with `{ trigger: "@", query: "ali" }`.
2. **Given** `resolve([{ id: "asmith", label: "Ali Smith" }])` is called, **When** the suggestions are set, **Then** a dropdown appears showing "Ali Smith".
3. **Given** the dropdown is open, **When** the user presses `↑`/`↓`, **Then** the highlighted item moves accordingly.
4. **Given** the dropdown is open and "Ali Smith" is highlighted, **When** the user presses `Enter` or `Tab`, **Then** `@ali` is replaced with `@asmith` and the dropdown closes.
5. **Given** the dropdown is open, **When** the user presses `Escape`, **Then** the dropdown closes without modifying text.
6. **Given** the user types `#issue`, **When** the input event fires, **Then** a `reference-query` event fires with `{ trigger: "#", query: "issue" }`.
7. **Given** no suggestions are provided, **When** `resolve([])` is called, **Then** the dropdown does not appear.

---

### User Story 5 - Status Bar with Word and Character Count (Priority: P3)

A user writing a post sees a live word count and character count in the footer of the editor. When a word cap is configured, the count changes colour as they approach the limit.

**Why this priority**: Status information improves the writing experience but does not block core functionality. It can be implemented and tested independently.

**Independent Test**: Mount the element with `max-words="50"`. Type text. Verify word count and character count update live. Verify the count turns amber when words exceed 45 (90%) and red at 50 (100%).

**Acceptance Scenarios**:

1. **Given** the user types text, **When** the content changes, **Then** the status bar shows accurate word count and character count within 150ms.
2. **Given** `max-words="500"` is set and word count is 480, **When** the status bar updates, **Then** it shows `480 / 500 words` in amber.
3. **Given** `max-words="500"` is set and word count reaches 500, **When** the status bar updates, **Then** the count displays in red.
4. **Given** `max-words` is not set, **When** the user types, **Then** the status bar shows `N words · M chars` without a cap indicator.

---

### User Story 6 - LiveView Hook Integration (Priority: P3)

A Phoenix LiveView developer adds `phx-hook="MarkdownInput"` to the element. On mount, the server-provided value is synced to the editor. On every change, the new value is pushed to the LiveView process.

**Why this priority**: Phoenix LiveView integration enables real-time server sync without manual JavaScript wiring. Valuable for Phoenix users but does not affect standalone HTML usage.

**Independent Test**: Import `MarkdownInputHook`, register it with LiveSocket, mount the element with `data-value="initial"`. Verify the editor shows "initial". Type new content. Verify a `content_changed` event is pushed to LiveView.

**Acceptance Scenarios**:

1. **Given** the element has `data-value="initial"` and `MarkdownInputHook` is mounted, **When** `mounted()` is called, **Then** the editor value is `"initial"`.
2. **Given** the editor is mounted and the user types, **When** the `change` event fires, **Then** `pushEvent("content_changed", { value })` is called with the current markdown.
3. **Given** the server pushes a new `data-value` to the element, **When** `updated()` is called and the new value differs from the current editor value, **Then** `setValue()` is called with the new value.

---

### Edge Cases

- What happens when the editor is inside a `<form>` but `name` is empty or not set? Form data should not include an unnamed field.
- What happens when Prism fails to load from CDN (network error)? The editor must still be functional — text entry works, just without syntax highlighting.
- What happens when the user pastes very large text (100,000+ characters)? The debounce on highlighting should prevent UI blocking; the element should remain responsive.
- What happens when multiple files are dropped simultaneously? Each file should get its own progress row and upload independently.
- What happens when `setSuggestions([])` is called while the dropdown is open? The dropdown should close.
- What happens when the user moves the cursor away from a `@query` mid-autocomplete? The dropdown should dismiss.
- What happens when `upload-url` returns malformed JSON? An `upload-error` event fires and the inline error appears.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The element MUST render as an autonomous custom element (`<el-dm-markdown-input>`) with a Shadow DOM, requiring no framework dependencies.
- **FR-002**: The element MUST provide a Write tab with a plain-text editor and a Preview tab showing rendered markdown HTML.
- **FR-003**: The Write tab editor MUST display syntax-highlighted markdown using the backdrop overlay technique, where a transparent textarea overlays a visually highlighted div.
- **FR-004**: Syntax highlighting MUST cover: headings, bold, italic, strikethrough, blockquotes, horizontal rules, inline code, and fenced code blocks with language-specific highlighting.
- **FR-005**: Syntax highlighting MUST be debounced (60ms) and MUST NOT block user input.
- **FR-006**: The element MUST support the attributes: `name`, `value`, `placeholder`, `disabled`, `upload-url`, `max-words`.
- **FR-007**: The element MUST expose public methods: `getValue()`, `setValue(str)`, `insertText(str)`, `setSuggestions(list)`.
- **FR-008**: The element MUST emit `change` events on every input with `{ value: string }` in the detail.
- **FR-009**: The element MUST participate in native HTML form submission via form association, reporting its value under the `name` attribute without requiring hidden inputs.
- **FR-010**: The element MUST accept file uploads triggered by drag-and-drop onto the write area, clipboard paste (images only), and a file picker in the status bar.
- **FR-011**: File uploads MUST show per-file progress and support multiple simultaneous uploads.
- **FR-012**: On successful upload, the element MUST insert the appropriate markdown snippet (`![name](url)` for images, `[name](url)` for other files) at the cursor position.
- **FR-013**: On upload failure, the element MUST display an inline error message that auto-dismisses after 4 seconds and MUST fire an `upload-error` event.
- **FR-014**: The element MUST detect `@word` and `#word` trigger patterns from the cursor position and fire `mention-query` / `reference-query` events with `{ trigger, query, resolve }`.
- **FR-015**: The autocomplete dropdown MUST support keyboard navigation (`↑`/`↓`), confirmation (`Enter`/`Tab`), and dismissal (`Escape`), as well as click-to-confirm.
- **FR-016**: On autocomplete confirmation, the trigger + query text MUST be replaced in the textarea with the selected suggestion's `id`.
- **FR-017**: The status bar MUST display word count and character count, updated within 150ms of input.
- **FR-018**: When `max-words` is set, the status bar MUST show `N / max words`, turning amber at ≥90% and red at ≥100%.
- **FR-019**: The element MUST export a `MarkdownInputHook` compatible with Phoenix LiveView hooks that syncs `data-value` on mount and pushes `content_changed` events on input.
- **FR-020**: The element MUST be themeable via CSS custom properties on the host element (`--md-border`, `--md-bg`, `--md-text`, and related tokens).
- **FR-021**: The element MUST support a `[dark]` attribute that applies the DuskMoon Moonlight theme defaults automatically.
- **FR-022**: The preview container MUST use the `.markdown-body` class to inherit styles from `@duskmoon-dev/core`.

### Key Entities

- **Suggestion**: Represents an autocomplete item with `id` (string), `label` (string), and optional `subtitle` (string). Used for both `@mention` and `#reference` completion.
- **UploadTask**: Represents an in-progress or completed file upload with file reference and progress state. One per dropped/pasted/selected file.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can type markdown content and see syntax highlighting apply within 100ms of stopping input.
- **SC-002**: Users can switch between Write and Preview tabs without any loss of content or cursor context.
- **SC-003**: A file dragged onto the editor is inserted as a markdown link/image within 500ms of the upload response being received.
- **SC-004**: Autocomplete suggestions appear within one render cycle of `resolve()` being called; keyboard navigation is responsive with no perceptible lag.
- **SC-005**: The element participates in native form submission identically to a standard `<textarea>` — zero additional JavaScript required from the consumer for basic form use.
- **SC-006**: The element is usable in a Phoenix LiveView application by adding only `phx-hook="MarkdownInput"` — no custom event listeners required for value sync.
- **SC-007**: The element degrades gracefully when syntax highlighting fails to load — writing and form submission continue to function without interruption.
- **SC-008**: Word and character counts are accurate and update within 150ms of the user stopping input.

---

## Assumptions

- Syntax highlighting is provided by Prism.js, loaded lazily on first render. If Prism is already available globally, it is not loaded again.
- The element ships a minimal built-in markdown renderer for the preview tab — no external rendering dependency is bundled.
- Accepted upload file types are: `image/*, application/pdf, .zip, .txt, .csv, .json, .md`.
- The `upload-url` endpoint is expected to respond with `{ url: string }` JSON on success.
- Dark/light Prism theme stylesheet is injected into the shadow DOM, switching based on the presence of the `[dark]` attribute.
- The element is packaged as `@duskmoon-dev/el-markdown-input` following the monorepo's existing conventions (`dist/esm`, `dist/cjs`, `dist/types`).
- The backdrop and textarea share identical typography CSS to ensure pixel-accurate overlay alignment.

---

## Dependencies

- `@duskmoon-dev/el-base` — base class, `css` tag, `combineStyles`
- `@duskmoon-dev/core` — `markdown-body` styles for the preview tab
- Prism.js (lazy-loaded, not bundled — loaded from CDN on first render)
- Phoenix LiveView (optional — only required for `MarkdownInputHook` usage)
