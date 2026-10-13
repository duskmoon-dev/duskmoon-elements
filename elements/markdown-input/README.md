# `@duskmoon-dev/el-markdown-input`

A form-associated custom element providing a full-featured markdown editor.

## Features

- **Write / Preview tabs** — switch between editing and rendered output
- **Rich preview** — highlighted YAML front matter, inline color chips, and soft line breaks
- **Syntax highlighting** — backdrop technique with Prism.js (lazy CDN load)
- **File upload** — drag-and-drop, clipboard paste, or file picker with progress
- **Autocomplete** — `@mention` and `#reference` with keyboard navigation
- **Status bar** — live word / character count with optional `max-words` cap
- **Form participation** — native `<form>` submission via `ElementInternals`
- **LiveView hook** — first-class Phoenix LiveView integration

## Installation

```bash
bun add @duskmoon-dev/el-markdown-input
```

## Preview dependencies

The published package includes the remark/rehype math adapters and a separate,
lazy-loaded Mermaid bundle with patched KaTeX. Consumers do not need dependency
overrides or a separate Mermaid installation. Bundling these adapters avoids their
upstream KaTeX 0.16 dependency ranges.

In browsers, the first Mermaid diagram loads this package's version-pinned
`dist/esm/mermaid.js` asset from jsDelivr. This requires network access and permission
for `https://cdn.jsdelivr.net` in your Content Security Policy. To self-host, copy
that asset from the installed package to your HTTPS server and set `mermaid-src`
to its URL. The asset is self-contained, including its patched KaTeX runtime.
Native Node/Bun consumers load the package-local bundle instead. Neither path
loads Mermaid until a preview contains a Mermaid diagram.

The default math stylesheet also uses jsDelivr and matches KaTeX 0.18.2;
`katex-css-url` can provide a custom HTTPS stylesheet.

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

## Attributes

| Attribute    | Type    | Default         | Description                                   |
|--------------|---------|-----------------|-----------------------------------------------|
| `name`       | string  | `""`            | Form field name                               |
| `value`      | string  | `""`            | Initial markdown content                      |
| `placeholder`| string  | `"Write markdown…"` | Textarea placeholder                      |
| `disabled`   | boolean | `false`         | Disables editing                              |
| `upload-url` | string  | —               | POST endpoint returning `{ url: string }`     |
| `max-words`  | number  | —               | Soft word cap in status bar                   |
| `dark`       | boolean | `false`         | Dark Prism theme + dark CSS variable defaults |

## Public API

```ts
el.getValue(): string
el.setValue(str: string): void
el.insertText(str: string): void
el.setSuggestions(list: Suggestion[]): void
```

## Events

| Event             | Detail                                          | When                        |
|-------------------|-------------------------------------------------|-----------------------------|
| `change`          | `{ value: string }`                             | On every input              |
| `upload-start`    | `{ file: File }`                                | File accepted for upload    |
| `upload-done`     | `{ file: File, url: string, markdown: string }` | Upload completed            |
| `upload-error`    | `{ file: File, error: string }`                 | Upload failed               |
| `mention-query`   | `{ trigger: "@", query, resolve }`              | User typed `@word`          |
| `reference-query` | `{ trigger: "#", query, resolve }`              | User typed `#word`          |

## CSS Custom Properties

| Property          | Default (light)         | Purpose                    |
|-------------------|-------------------------|----------------------------|
| `--md-border`     | `var(--color-outline)`  | Editor border              |
| `--md-border-focus` | `var(--color-primary)` | Focus ring colour         |
| `--md-bg`         | `var(--color-surface)`  | Editor background          |
| `--md-bg-toolbar` | `var(--color-surface-variant)` | Toolbar background  |
| `--md-text`       | `var(--color-on-surface)` | Primary text colour      |
| `--md-text-muted` | `var(--color-on-surface-variant)` | Muted text colour |
| `--md-accent`     | `var(--color-primary)`  | Tab active indicator       |
| `--md-radius`     | `6px`                   | Border radius              |
| `--md-upload-bar` | `var(--color-primary)`  | Upload progress bar        |

## File Upload

```html
<el-dm-markdown-input upload-url="/api/uploads"></el-dm-markdown-input>
```

The endpoint must accept `POST multipart/form-data` with field `file` and respond with:
```json
{ "url": "https://cdn.example.com/file.png" }
```

## Autocomplete

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

## Phoenix LiveView

```js
// app.js
import { MarkdownInputHook, register } from '@duskmoon-dev/el-markdown-input';
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
