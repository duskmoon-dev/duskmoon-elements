# Data Model: `el-dm-markdown-input`

**Branch**: `001-el-markdown-input` | **Phase**: 1 | **Date**: 2026-03-09

---

## Entities

### Suggestion

Represents an autocomplete item provided by the host application.

```ts
interface Suggestion {
  id: string        // Value inserted on confirmation (e.g. user handle, issue key)
  label: string     // Display name shown in dropdown
  subtitle?: string // Secondary line (e.g. email, description)
}
```

**Constraints**:
- `id` must be non-empty
- `label` must be non-empty
- `subtitle` is optional display-only text

**State transitions**: Suggestions are ephemeral — they exist only while the dropdown is open. Calling `setSuggestions([])` clears them and closes the dropdown.

---

### UploadTask

Represents a single in-progress file upload. Created when a file is accepted; destroyed on completion or error.

```ts
interface UploadTask {
  id: string          // Random unique ID for tracking DOM row
  file: File          // Original File object
  progress: number    // 0–100 upload percentage
  status: 'uploading' | 'done' | 'error'
  error?: string      // Present when status === 'error'
  url?: string        // Present when status === 'done'
}
```

**State machine**:
```
          accept file
              ↓
          uploading ──(xhr progress)──→ progress 0→100
              │
    ┌─────────┴──────────┐
  success               error
    ↓                     ↓
  done (url set)        error (error set)
    ↓                     ↓
  row removed after     inline error shown
  markdown inserted     auto-dismiss after 4s
```

---

### AutocompleteState

Internal state of the autocomplete subsystem.

```ts
interface AutocompleteState {
  active: boolean              // Whether dropdown is visible
  trigger: '@' | '#' | null    // Which trigger character is active
  query: string                // Text after the trigger
  triggerPos: number           // Index in textarea.value where trigger char appears
  suggestions: Suggestion[]    // Current suggestion list
  selectedIndex: number        // Keyboard-highlighted item (0-based), -1 = none
}
```

**Initial state**: `{ active: false, trigger: null, query: '', triggerPos: -1, suggestions: [], selectedIndex: -1 }`

**State transitions**:
- `input` event → scan for trigger → set `active: true`, `trigger`, `query`, `triggerPos`; OR set `active: false` if trigger lost
- `setSuggestions([...])` → set `suggestions`; if empty and `active` → `active: false`
- `↑`/`↓` key → adjust `selectedIndex` with wrap-around
- `Enter`/`Tab` → confirm selected suggestion → `active: false`
- `Escape` → `active: false`
- Cursor move away from trigger → `active: false`

---

### StatusBarState

Internal state for word/char count display.

```ts
interface StatusBarState {
  wordCount: number
  charCount: number
  maxWords: number | null   // null when max-words attr not set
}
```

**Derived values**:
- `percentage = maxWords ? (wordCount / maxWords) * 100 : null`
- `colour = percentage === null ? 'normal' : percentage >= 100 ? 'error' : percentage >= 90 ? 'warning' : 'normal'`

---

## Element Properties (Reactive)

These map to the element's `static properties` definition in `BaseElement`:

| Property | Attribute | Type | Default | Reflect |
|----------|-----------|------|---------|---------|
| `name` | `name` | String | `""` | true |
| `value` | `value` | String | `""` | false |
| `placeholder` | `placeholder` | String | `"Write markdown…"` | true |
| `disabled` | `disabled` | Boolean | false | true |
| `uploadUrl` | `upload-url` | String | `undefined` | true |
| `maxWords` | `max-words` | Number | `undefined` | true |
| `dark` | `dark` | Boolean | false | true |

**Notes**:
- `value` is NOT reflected to attribute (content can be very long; attribute reflection would cause issues)
- `maxWords` uses `undefined` (not 0) to distinguish "not set" from "zero"
- `dark` drives Prism theme selection and CSS variable overrides

---

## Public Method Signatures

```ts
class ElDmMarkdownInput extends BaseElement {
  static formAssociated: true

  // Read current markdown content
  getValue(): string

  // Set markdown content programmatically (updates form value, fires no change event)
  setValue(str: string): void

  // Insert text at current cursor position, respecting selection
  insertText(str: string): void

  // Feed suggestions into the autocomplete dropdown
  setSuggestions(list: Suggestion[]): void
}
```

---

## Events Dispatched

| Event | Detail Type | Bubbles | Composed |
|-------|-------------|---------|---------|
| `change` | `{ value: string }` | true | true |
| `upload-start` | `{ file: File }` | true | true |
| `upload-done` | `{ file: File, url: string, markdown: string }` | true | true |
| `upload-error` | `{ file: File, error: string }` | true | true |
| `mention-query` | `{ trigger: "@", query: string, resolve: (s: Suggestion[]) => void }` | true | true |
| `reference-query` | `{ trigger: "#", query: string, resolve: (s: Suggestion[]) => void }` | true | true |

---

## Internal Module Interfaces

### HighlightModule (`highlight.ts`)

```ts
// Returns a promise that resolves when Prism is ready (cached after first call)
function ensurePrism(): Promise<void>

// Highlight markdown text → HTML string using Prism.languages.markdown
// Returns plain escaped text if Prism not available
function highlightMarkdown(text: string): string

// Inject or update Prism theme <style> inside shadowRoot
function applyPrismTheme(shadowRoot: ShadowRoot, dark: boolean): void
```

### UploadModule (`upload.ts`)

```ts
// Upload a single File to uploadUrl, reporting progress via onProgress callback
// Returns the URL from the server response
function uploadFile(
  file: File,
  uploadUrl: string,
  onProgress: (pct: number) => void
): Promise<string>

// Generate markdown insertion string for a file
function fileToMarkdown(file: File, url: string): string
// → "![filename](url)" for images, "[filename](url)" for others
```

### AutocompleteModule (`autocomplete.ts`)

```ts
// Scan textarea value backward from cursor to detect @ or # trigger
// Returns null if no active trigger
function detectTrigger(
  value: string,
  cursorPos: number
): { trigger: '@' | '#'; query: string; triggerPos: number } | null

// Replace the trigger+query in value with the confirmed replacement
function confirmSuggestion(
  value: string,
  triggerPos: number,
  cursorPos: number,
  trigger: '@' | '#',
  replacement: string
): { newValue: string; newCursorPos: number }
```

### StatusBarModule (`status-bar.ts`)

```ts
// Count words in a string using the PRD algorithm
function countWords(text: string): number

// Return the colour class for a given percentage
function countColour(wordCount: number, maxWords: number | null): 'normal' | 'warning' | 'error'
```
