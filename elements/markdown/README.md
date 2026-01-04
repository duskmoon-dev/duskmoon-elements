# @duskmoon-dev/el-markdown

A markdown renderer component using remark/rehype with syntax highlighting, mermaid diagram support, and streaming mode for LLM output.

## Installation

```bash
bun add @duskmoon-dev/el-markdown
```

For mermaid diagram support (optional):

```bash
bun add mermaid
```

## Usage

### Inline Content

````html
<script type="module">
  import { register } from '@duskmoon-dev/el-markdown';
  register();
</script>

<el-dm-markdown>
  # Hello World This is **markdown** content with: - Lists - Code blocks - And more! ```javascript
  console.log('Syntax highlighting!');</el-dm-markdown
>
````

</el-dm-markdown>
```

### From URL

```html
<el-dm-markdown src="/docs/readme.md"></el-dm-markdown>
```

### With Mermaid Diagrams

````html
<el-dm-markdown>
  # Flowchart Example ```mermaid graph TD A[Start] --> B{Is it?} B -->|Yes| C[OK] B -->|No|
  D[End]</el-dm-markdown
>
````

</el-dm-markdown>
```

## Features

- **GitHub Flavored Markdown**: Tables, task lists, strikethrough, autolinks
- **Syntax Highlighting**: Powered by highlight.js via rehype-highlight
- **Mermaid Diagrams**: Optional support for flowcharts, sequence diagrams, etc.
- **Multiple Themes**: GitHub, Atom One Dark, Atom One Light
- **Auto Theme**: Respects `prefers-color-scheme` media query
- **Indentation Removal**: Automatically removes common indentation from inline content
- **Streaming Mode**: Real-time rendering for LLM output with automatic syntax error recovery

## Themes

| Theme            | Description                         |
| ---------------- | ----------------------------------- |
| `auto`           | Follows system preference (default) |
| `github`         | GitHub-style light theme            |
| `atom-one-dark`  | Atom One Dark theme                 |
| `atom-one-light` | Atom One Light theme                |

````html
<el-dm-markdown theme="atom-one-dark"> ```js const dark = true;</el-dm-markdown>
````

</el-dm-markdown>
```

## Attributes

| Attribute    | Type    | Default | Description                         |
| ------------ | ------- | ------- | ----------------------------------- |
| `src`        | string  |         | URL to fetch markdown from          |
| `theme`      | string  | `auto`  | Code syntax highlighting theme      |
| `debug`      | boolean | `false` | Enable debug logging                |
| `no-mermaid` | boolean | `false` | Disable mermaid rendering           |
| `streaming`  | boolean | `false` | Read-only, reflects streaming state |

## Properties

| Property  | Type   | Description                       |
| --------- | ------ | --------------------------------- |
| `content` | string | Get/set markdown content directly |

## Methods

| Method                 | Description                                     |
| ---------------------- | ----------------------------------------------- |
| `startStreaming()`     | Begin streaming mode, clear buffer, show cursor |
| `appendContent(chunk)` | Append a chunk of content during streaming      |
| `setContent(content)`  | Replace content (works in streaming & normal)   |
| `endStreaming()`       | End streaming, perform final clean render       |

## CSS Parts

| Part        | Description                   |
| ----------- | ----------------------------- |
| `container` | The outer container           |
| `content`   | The rendered markdown content |

## Events

| Event             | Detail                               | Description                      |
| ----------------- | ------------------------------------ | -------------------------------- |
| `dm-rendered`     | `{ html: string }`                   | Fired after markdown is rendered |
| `dm-error`        | `{ error: string }`                  | Fired when an error occurs       |
| `dm-stream-chunk` | `{ content: string, chunk: string }` | Fired when a chunk is appended   |
| `dm-stream-end`   | `{ content: string }`                | Fired when streaming ends        |

## CSS Custom Properties

| Property                         | Description             |
| -------------------------------- | ----------------------- |
| `--dm-markdown-font-family`      | Font family for content |
| `--dm-markdown-code-font-family` | Font family for code    |
| `--dm-markdown-line-height`      | Line height             |

## Supported Markdown Features

- Headings (h1-h6)
- Paragraphs
- Bold, italic, strikethrough
- Links and images
- Ordered and unordered lists
- Task lists (GFM)
- Blockquotes
- Code (inline and blocks)
- Syntax highlighting
- Tables (GFM)
- Horizontal rules
- Mermaid diagrams (optional)

## Examples

### Task List

```html
<el-dm-markdown> ## Todo - [x] Complete task - [ ] Pending task - [ ] Another task </el-dm-markdown>
```

### Table

```html
<el-dm-markdown>
  | Feature | Status | |---------|--------| | Tables | Supported | | Strikethrough | ~~Yes~~ |
</el-dm-markdown>
```

### Loading Remote Content

```html
<el-dm-markdown src="https://raw.githubusercontent.com/user/repo/main/README.md"></el-dm-markdown>
```

## Streaming Mode

Streaming mode is designed for rendering LLM output in real-time. It automatically handles incomplete markdown syntax during streaming and shows a blinking cursor.

### Basic Streaming

```typescript
const md = document.querySelector('el-dm-markdown');

// Start streaming mode
md.startStreaming();

// Append chunks as they arrive from LLM
for await (const chunk of llmStream) {
  md.appendContent(chunk);
}

// End streaming (performs final clean render)
md.endStreaming();
```

### Using Content Property

```typescript
const md = document.querySelector('el-dm-markdown');

md.streaming = true; // Or call startStreaming()
let content = '';

for await (const chunk of llmStream) {
  content += chunk;
  md.content = content;
}

md.streaming = false; // Or call endStreaming()
```

### Listening to Stream Events

```typescript
const md = document.querySelector('el-dm-markdown');

md.addEventListener('dm-stream-chunk', (e) => {
  console.log('Received chunk:', e.detail.chunk);
  console.log('Total content:', e.detail.content);
});

md.addEventListener('dm-stream-end', (e) => {
  console.log('Streaming complete:', e.detail.content);
});
```

### Syntax Auto-Recovery

During streaming, incomplete markdown syntax is automatically fixed:

| Incomplete Pattern | Auto-Fix Action      |
| ------------------ | -------------------- |
| ` ``` ` unclosed   | Closes code block    |
| `` ` `` unclosed   | Closes inline code   |
| `**text` unclosed  | Closes bold          |
| `*text` unclosed   | Closes italic        |
| `~~text` unclosed  | Closes strikethrough |
| `[text](url`       | Closes link          |
| `![alt](url`       | Closes image         |

This ensures the markdown renders correctly even with partial content.

## License

MIT
