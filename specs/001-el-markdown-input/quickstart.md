# Quickstart: `el-dm-markdown-input`

**Branch**: `001-el-markdown-input` | **Date**: 2026-03-09

---

## Installation

```bash
bun add @duskmoon-dev/el-markdown-input
```

---

## Basic Usage

```html
<script type="module">
  import { register } from '@duskmoon-dev/el-markdown-input';
  register();
</script>

<form method="post">
  <el-dm-markdown-input name="body" placeholder="Write markdown…"></el-dm-markdown-input>
  <button type="submit">Save</button>
</form>
```

The element participates in native form submission — no extra JavaScript needed.

---

## Pre-filling Content

Via attribute (short content):
```html
<el-dm-markdown-input value="# Hello world"></el-dm-markdown-input>
```

Via JavaScript (for longer content):
```js
const el = document.querySelector('el-dm-markdown-input');
el.setValue("# Hello world\n\nThis is some **markdown** content.");
```

---

## Listening for Changes

```js
el.addEventListener('change', (e) => {
  console.log('New content:', e.detail.value);
});
```

---

## File Uploads

```html
<el-dm-markdown-input
  name="body"
  upload-url="/api/uploads"
></el-dm-markdown-input>
```

The server at `/api/uploads` should:
- Accept `POST multipart/form-data` with field `file`
- Return `{ "url": "https://cdn.example.com/file.png" }` on success

Upload events:
```js
el.addEventListener('upload-start', (e) => console.log('Uploading:', e.detail.file.name));
el.addEventListener('upload-done', (e) => console.log('Done:', e.detail.url));
el.addEventListener('upload-error', (e) => console.error('Failed:', e.detail.error));
```

---

## @mention Autocomplete

```js
el.addEventListener('mention-query', async (e) => {
  const users = await fetchUsers(e.detail.query);
  e.detail.resolve(users.map(u => ({
    id: u.handle,
    label: u.name,
    subtitle: u.email
  })));
});
```

The dropdown appears automatically once `resolve()` is called with a non-empty list.

---

## #reference Autocomplete

```js
el.addEventListener('reference-query', async (e) => {
  const issues = await searchIssues(e.detail.query);
  e.detail.resolve(issues.map(i => ({
    id: String(i.number),
    label: i.title,
    subtitle: `#${i.number}`
  })));
});
```

---

## Word Limit

```html
<el-dm-markdown-input max-words="500"></el-dm-markdown-input>
```

The status bar shows `N / 500 words`. Turns amber at 90%, red at 100%.

---

## Dark Mode

```html
<!-- Explicit dark mode -->
<el-dm-markdown-input dark></el-dm-markdown-input>
```

Or toggle dynamically:
```js
el.setAttribute('dark', '');  // enable
el.removeAttribute('dark');   // disable
```

---

## Custom Theming

```css
el-dm-markdown-input {
  --md-border: #30363d;
  --md-border-focus: #58a6ff;
  --md-bg: #0d1117;
  --md-bg-toolbar: #161b22;
  --md-text: #e6edf3;
  --md-text-muted: #8b949e;
  --md-accent: #58a6ff;
  --md-radius: 8px;
}
```

---

## Phoenix LiveView Integration

```js
// app.js
import { MarkdownInputHook } from '@duskmoon-dev/el-markdown-input';
import { register } from '@duskmoon-dev/el-markdown-input';

register();

let liveSocket = new LiveSocket('/live', Socket, {
  hooks: { MarkdownInput: MarkdownInputHook }
});
```

```heex
<el-dm-markdown-input
  id="body-input"
  name="body"
  data-value={@content}
  phx-hook="MarkdownInput"
/>
```

The hook syncs `data-value` on mount and pushes `content_changed` events to the LiveView process.

---

## Building the Package

```bash
# From repo root
bun run build:base  # Build el-base first
bun run --filter @duskmoon-dev/el-markdown-input build

# Run tests
bun run --filter @duskmoon-dev/el-markdown-input test
```

---

## Package Structure

```
elements/markdown-input/
├── src/
│   ├── index.ts          # re-exports element, register(), MarkdownInputHook
│   ├── element.ts        # ElDmMarkdownInput class
│   ├── highlight.ts      # Prism loader + backdrop highlight
│   ├── upload.ts         # XHR upload, drag/paste/click handlers
│   ├── autocomplete.ts   # trigger detection + dropdown
│   ├── status-bar.ts     # word/char count
│   └── css.ts            # Shadow DOM stylesheet
├── package.json
├── tsconfig.json
└── README.md
```
