# PRD: `<markdown-input>` Custom Element

## Context

This element lives in the `duskmoon-elements` monorepo under `elements/markdown-input` as `@duskmoon-dev/el-markdown-input`. It follows the existing custom element conventions: autonomous element extending `HTMLElement`, `ElementInternals` for form participation, no framework dependencies.

It will be consumed by `phoenix-duskmoon-ui` as a Phoenix component that emits `<el-dm-markdown-input>` tags, and by any other host via plain HTML.

---

## Element Tag

```html
<el-dm-markdown-input>
```

---

## Attributes

| Attribute    | Type    | Default              | Description                                              |
|--------------|---------|----------------------|----------------------------------------------------------|
| `name`       | string  | `""`                 | Form field name for `ElementInternals.setFormValue()`    |
| `value`      | string  | `""`                 | Current markdown content                                 |
| `placeholder`| string  | `"Write markdown…"`  | Textarea placeholder                                     |
| `disabled`   | boolean | false                | Disables editing                                         |
| `upload-url` | string  | —                    | POST endpoint for file uploads. Expects `{ url: string }`|
| `max-words`  | number  | —                    | Optional soft cap shown in status bar                    |

---

## Public API

```ts
getValue(): string
setValue(str: string): void
insertText(str: string): void          // inserts at cursor, respects selection
setSuggestions(list: Suggestion[]): void  // feeds the autocomplete dropdown
```

```ts
type Suggestion = {
  id: string
  label: string
  subtitle?: string
}
```

---

## Events

All events bubble and are composed.

| Event             | `detail`                                        | When                                      |
|-------------------|-------------------------------------------------|-------------------------------------------|
| `change`          | `{ value: string }`                             | On every input                            |
| `upload-start`    | `{ file: File }`                                | File accepted for upload                  |
| `upload-done`     | `{ file: File, url: string, markdown: string }` | Upload completed, markdown inserted       |
| `upload-error`    | `{ file: File, error: string }`                 | Upload failed                             |
| `mention-query`   | `{ trigger: "@", query: string, resolve: fn }`  | User typed `@` + chars                    |
| `reference-query` | `{ trigger: "#", query: string, resolve: fn }`  | User typed `#` + chars                    |

For `mention-query` and `reference-query`, the host calls `resolve(suggestions: Suggestion[])` which feeds `setSuggestions()` internally. The dropdown renders if suggestions are non-empty.

---

## Features

### 1. Write / Preview Tabs

- **Write tab**: editor with syntax highlighting
- **Preview tab**: rendered HTML from the markdown content
- Preview uses a built-in minimal markdown renderer (no external dep). Code blocks in preview are highlighted by Prism.

### 2. Syntax Highlighting in Editor (Backdrop Trick)

The editor uses the **backdrop technique**:

```
┌─ .write-area (position: relative) ──────────────────┐
│  ┌─ .backdrop (position: absolute, inert) ─────────┐ │
│  │  <div> with highlighted HTML, pointer-events:none│ │
│  └───────────────────────────────────────────────── ┘ │
│  ┌─ <textarea> (transparent bg, position: relative) ┐ │
│  │  Raw text input, caret visible, z-index above    │ │
│  └───────────────────────────────────────────────── ┘ │
└──────────────────────────────────────────────────────┘
```

**Critical constraints:**
- Backdrop and textarea must share identical `font-family`, `font-size`, `line-height`, `padding`, `white-space`, `word-wrap`
- Scroll sync: `backdrop.scrollTop = textarea.scrollTop` on every scroll/input event
- Resize sync: use `ResizeObserver` on textarea, mirror dimensions to backdrop
- Textarea has `color: transparent`, `caret-color: var(--md-text)`, `background: transparent`

**What Prism highlights:**
- Markdown syntax tokens: headings (`#`), bold (`**`), italic (`_`), strikethrough (`~~`), blockquote (`>`), horizontal rule (`---`)
- Inline code: `` `code` ``
- Fenced code blocks: language-specific highlighting via Prism grammar for the declared lang
  ```
  ```elixir
  def hello, do: :world
  ```
  ```

**Prism loading:**
- Load Prism core + grammars lazily from CDN on first render (`https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/`)
- Grammars to include: `javascript`, `typescript`, `elixir`, `rust`, `go`, `bash`, `python`, `json`, `sql`, `yaml`, `dart`, `nix`, `css`, `markup`
- If Prism is already on `window.Prism`, skip loading
- Highlight is debounced 60ms on input to avoid jank

Syntax highlight colours in the editor backdrop use Prism's own token classes (`token.keyword`, `token.string`, etc.) styled via a Prism theme stylesheet injected into the shadow DOM. Use the `prism-tomorrow` theme for dark mode and `prism-coy` (or equivalent light) for light mode — both available on the same CDN as Prism itself.

### 3. File Upload

**Triggers:**
- Drag files onto the write area
- Paste image from clipboard (`paste` event, filter `file.type.startsWith("image/")`)
- Click attach zone in footer (`<input type="file" multiple>`)

**Flow:**
1. Fire `upload-start`
2. If `upload-url` is set: `XHR POST multipart/form-data` with field `file`
   - Track `xhr.upload` progress → update progress bar per file
   - On success: parse `{ url }` from JSON response, call `insertText()` with markdown link/image
   - On error: show inline error, auto-dismiss after 4s
3. If no `upload-url`: fire `upload-error` with `"no upload-url set"`

**Accepted file types:** `image/*, application/pdf, .zip, .txt, .csv, .json, .md`

**Markdown inserted:**
- Images: `![filename](url)`
- Other files: `[filename](url)`

**Progress UI:** per-file row below the textarea showing filename + thin progress bar. Rows remove themselves on completion.

### 4. Autocomplete Dropdown (Shell)

The autocomplete infrastructure is wired but the dropdown renders only when `setSuggestions()` is called with a non-empty list.

**Trigger detection** (on every `input` event):
- Scan backward from cursor to find `@word` or `#word` since last whitespace/newline
- If found: fire the corresponding query event with `{ trigger, query, resolve }`
- If the trigger char is deleted or cursor moves away: close dropdown

**Dropdown behaviour:**
- Appears below the current cursor line
- Keyboard: `↑`/`↓` navigate, `Enter`/`Tab` confirm, `Escape` dismiss
- On confirm: replace `@query` / `#query` in text with `@id` / `#id` (or `label`)
- Click on suggestion item also confirms

**Host wires it like:**
```js
el.addEventListener('mention-query', e => {
  fetchUsers(e.detail.query).then(users =>
    e.detail.resolve(users.map(u => ({ id: u.handle, label: u.name, subtitle: u.email })))
  )
})
```

### 5. Status Bar

Shown at the bottom of the write tab:

```
[ 📎 Attach files ]                     142 words · 847 chars
```

- **Word count**: `value.trim().split(/\s+/).filter(Boolean).length`
- **Char count**: `value.length`
- If `max-words` is set: show `142 / 500 words`. Turns amber at 90%, red at 100%.
- Updates debounced 100ms on input

---

## Theming

The element uses Shadow DOM. Consumers customise via CSS custom properties on the host:

```css
el-dm-markdown-input {
  --md-border: #d0d7de;
  --md-border-focus: #0969da;
  --md-bg: #ffffff;
  --md-bg-toolbar: #f6f8fa;
  --md-bg-hover: #eaeef2;
  --md-text: #1f2328;
  --md-text-muted: #656d76;
  --md-accent: #0969da;
  --md-radius: 6px;
  --md-upload-bar: #0969da;
}
```

Dark mode via `[dark]` attribute — the element ships default dark values matching DuskMoonUI Moonlight theme.

DuskMoonUI's `@duskmoon-dev/core` plugin already provides `markdown-body` styles for the **preview** tab — apply the `.markdown-body` class to the preview container so it inherits those styles automatically. The editor (write) tab uses its own minimal chrome only.

---

## LiveView Hook

Exported as a named export alongside the element:

```js
// app.js
import { MarkdownInputHook } from "@duskmoon-dev/el-markdown-input"

let liveSocket = new LiveSocket("/live", Socket, {
  hooks: { MarkdownInput: MarkdownInputHook }
})
```

```heex
<el-dm-markdown-input
  id="body-input"
  name="body"
  data-value={@content}
  phx-hook="MarkdownInput"
/>
```

**Hook behaviour:**

```js
export const MarkdownInputHook = {
  mounted() {
    // Sync initial server value
    this.el.setValue(this.el.dataset.value ?? "")

    // Push changes to server
    this.el.addEventListener("change", e =>
      this.pushEvent("content_changed", { value: e.detail.value })
    )

    // Optional: handle server-side upload
    this.el.addEventListener("upload-start", e =>
      this.pushEvent("upload_file", { name: e.detail.file.name })
    )
  },
  updated() {
    // Server pushed a new value (e.g. after form reset)
    const v = this.el.dataset.value
    if (v !== undefined && v !== this.el.getValue()) {
      this.el.setValue(v)
    }
  }
}
```

---

## Form Participation

```js
static formAssociated = true

connectedCallback() {
  this.#internals = this.attachInternals()
  // ...
}

// Called whenever content changes:
this.#internals.setFormValue(this.#textarea.value)
```

This makes the element participate in native `<form>` submission under `name` without a hidden input.

---

## Package Structure

```
elements/markdown-input/
├── src/
│   ├── index.ts          # registers element + exports hook
│   ├── element.ts        # MarkdownInput class
│   ├── highlight.ts      # backdrop highlighter + Prism loader
│   ├── upload.ts         # file upload logic
│   ├── autocomplete.ts   # trigger detection + dropdown
│   ├── status-bar.ts     # word/char count
│   └── css.ts            # shadow DOM stylesheet (tagged template)
├── package.json          # @duskmoon-dev/el-markdown-input
└── README.md
```

---

## Out of Scope (this PRD)

- Toolbar buttons (intentionally removed — keyboard shortcuts preferred)
- Keyboard shortcuts (future PRD)
- Fullscreen mode (future PRD)
- Server-side markdown rendering (host responsibility)
- i18n of UI strings (future)