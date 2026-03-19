# PRD Addendum: Render Layer for `<el-dm-markdown-input>`

> Append this to the existing `markdown-input-PRD.md`. Updates the preview tab architecture and package structure.

---

## Render Pipeline

The preview tab uses a **unified** pipeline to transform raw markdown into styled HTML. The pipeline is lazy-loaded — modules are only imported when the user first activates the preview tab.

### Pipeline

```
value (raw markdown string)
  → remark-parse            # markdown → mdast
  → remark-gfm              # tables, task lists, strikethrough, autolinks
  → remark-math             # $inline$ and $$block$$ math syntax → math nodes
  → remark-rehype           # mdast → hast
  → rehype-katex            # math nodes → KaTeX HTML
  → rehype-prism-plus       # code block syntax highlighting
  → rehype-sanitize         # XSS protection (strict schema)
  → rehype-stringify         # hast → HTML string
  → inject into .markdown-body container
```

### Mermaid (post-render)

Mermaid diagrams are **not** part of the unified pipeline. They're handled as a post-render step:

1. `rehype-sanitize` whitelist includes `<code class="language-mermaid">` blocks
2. After `innerHTML` injection, query all `pre > code.language-mermaid` nodes
3. Lazy-load `mermaid` (ESM, from CDN or bundled)
4. Call `mermaid.render(id, codeText)` for each block
5. Replace the `<pre>` with the returned SVG

```typescript
// render.ts — post-render mermaid step
async function renderMermaidBlocks(container: HTMLElement): Promise<void> {
  const blocks = container.querySelectorAll('pre > code.language-mermaid');
  if (blocks.length === 0) return;

  const { default: mermaid } = await import('mermaid');
  mermaid.initialize({
    startOnLoad: false,
    theme: getCurrentTheme() === 'moonlight' ? 'dark' : 'default',
    // Inherit font from host
    fontFamily: 'inherit',
  });

  for (const [i, block] of [...blocks].entries()) {
    const pre = block.parentElement!;
    const id = `mermaid-${Date.now()}-${i}`;
    try {
      const { svg } = await mermaid.render(id, block.textContent ?? '');
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-diagram';
      wrapper.innerHTML = svg;
      pre.replaceWith(wrapper);
    } catch {
      // Leave original code block on render failure
      pre.classList.add('mermaid-error');
    }
  }
}
```

### Theme Awareness

- Mermaid re-initializes with `theme: 'dark' | 'default'` when Sunshine ↔ Moonlight toggles
- KaTeX inherits font size and color from `.markdown-body` CSS
- Prism theme injected into shadow DOM matches active theme (`prism-tomorrow` for Moonlight, `prism-coy` for Sunshine)

---

## Sanitization Schema

Extend `rehype-sanitize`'s default GitHub schema to allow:

```typescript
import { defaultSchema } from 'rehype-sanitize';
import { deepMerge } from './utils';

const schema = deepMerge(defaultSchema, {
  attributes: {
    // KaTeX output
    span: ['className', 'style'],
    // Mermaid placeholder
    code: ['className'],
    // Task list checkboxes
    input: ['type', 'checked', 'disabled'],
  },
  tagNames: [
    // KaTeX elements
    'math', 'semantics', 'mrow', 'mi', 'mo', 'mn', 'msup', 'msub',
    'mfrac', 'mover', 'munder', 'msqrt', 'mtable', 'mtr', 'mtd',
    'annotation',
  ],
});
```

Task list checkboxes are rendered as `disabled` — no interactive toggling in preview.

---

## Lazy Loading Strategy

All render dependencies load on first preview tab activation:

```typescript
// render.ts
let processor: ReturnType<typeof unified> | null = null;

async function getProcessor() {
  if (processor) return processor;

  const [
    { unified },
    { default: remarkParse },
    { default: remarkGfm },
    { default: remarkMath },
    { default: remarkRehype },
    { default: rehypeKatex },
    { default: rehypePrismPlus },
    { default: rehypeSanitize },
    { default: rehypeStringify },
  ] = await Promise.all([
    import('unified'),
    import('remark-parse'),
    import('remark-gfm'),
    import('remark-math'),
    import('remark-rehype'),
    import('rehype-katex'),
    import('rehype-prism-plus'),
    import('rehype-sanitize'),
    import('rehype-stringify'),
  ]);

  processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex)
    .use(rehypePrismPlus, { ignoreMissing: true })
    .use(rehypeSanitize, schema)
    .use(rehypeStringify);

  return processor;
}

export async function renderMarkdown(source: string): Promise<string> {
  const proc = await getProcessor();
  const file = await proc.process(source);
  return String(file);
}
```

The processor is cached after first build — subsequent renders reuse it.

### Loading UX

While the pipeline loads on first preview activation:
1. Show a skeleton / shimmer inside the preview container
2. Cache the processor — subsequent tab switches are instant
3. If render fails, show raw markdown as fallback with error toast

---

## Debounced Live Preview (Optional Enhancement)

If the element supports live preview (auto-update while typing):

- Debounce render at **300ms** after last keystroke
- Cancel in-flight renders on new input
- Use `requestIdleCallback` for non-blocking render on long documents

This is **opt-in** via attribute:

```html
<el-dm-markdown-input live-preview debounce="300"></el-dm-markdown-input>
```

Default behaviour: preview only renders on tab switch.

---

## CSS Dependencies in Shadow DOM

The preview container needs these stylesheets injected into shadow DOM:

| Stylesheet | Source | Purpose |
|------------|--------|---------|
| `.markdown-body` | `@duskmoon-dev/core` | Base markdown typography and layout |
| KaTeX CSS | `katex/dist/katex.min.css` | Math rendering styles + fonts |
| Prism theme | `prismjs/themes/prism-tomorrow.css` or `prism-coy.css` | Code block syntax colors |

KaTeX CSS includes `@font-face` declarations — these reference font files that must be resolvable. Options:
1. **CDN**: Load KaTeX CSS from `cdn.jsdelivr.net` (simplest)
2. **Bundle**: Copy KaTeX font files into package dist and use relative paths
3. **Inline**: Use `katex.min.css` with inlined base64 fonts (largest, most portable)

**Recommendation**: CDN for default, with `katex-css-url` attribute override for self-hosted.

---

## Updated Package Structure

```
elements/markdown-input/
├── src/
│   ├── index.ts            # registers element + exports hook
│   ├── element.ts          # MarkdownInput class
│   ├── highlight.ts        # backdrop highlighter + Prism loader (write tab)
│   ├── render.ts           # unified pipeline + mermaid post-render (preview tab)  ← NEW
│   ├── sanitize-schema.ts  # rehype-sanitize custom schema                        ← NEW
│   ├── upload.ts           # file upload logic
│   ├── autocomplete.ts     # trigger detection + dropdown
│   ├── status-bar.ts       # word/char count
│   └── css.ts              # shadow DOM stylesheet (tagged template)
├── package.json            # @duskmoon-dev/el-markdown-input
└── README.md
```

---

## Dependencies

### Runtime (bundled)

```json
{
  "dependencies": {
    "unified": "^11.0.0",
    "remark-parse": "^11.0.0",
    "remark-gfm": "^4.0.0",
    "remark-math": "^6.0.0",
    "remark-rehype": "^11.0.0",
    "rehype-katex": "^7.0.0",
    "rehype-prism-plus": "^2.0.0",
    "rehype-sanitize": "^6.0.0",
    "rehype-stringify": "^10.0.0"
  }
}
```

### Lazy-loaded (CDN or peer)

```json
{
  "optionalDependencies": {
    "mermaid": "^11.0.0"
  }
}
```

Mermaid is heavy (~2MB). Default: load from CDN. Override via `mermaid-src` attribute.

---

## Attributes (additions to existing PRD)

| Attribute        | Type    | Default  | Description                                        |
|------------------|---------|----------|----------------------------------------------------|
| `live-preview`   | boolean | false    | Auto-update preview while typing                   |
| `debounce`       | number  | 300      | Debounce ms for live preview                       |
| `katex-css-url`  | string  | CDN URL  | Override KaTeX stylesheet location                 |
| `mermaid-src`    | string  | CDN URL  | Override mermaid.js source URL                     |

---

## Events (additions)

| Event            | Detail                        | When                          |
|------------------|-------------------------------|-------------------------------|
| `render-start`   | `{}`                          | Preview render begins         |
| `render-done`    | `{ html: string }`           | Preview render complete       |
| `render-error`   | `{ error: Error }`           | Pipeline or mermaid failure   |

---

## Acceptance Criteria

1. Preview tab shows rendered HTML with `.markdown-body` styling
2. GFM tables, task lists, strikethrough render correctly
3. `$E=mc^2$` renders inline math; `$$` blocks render display math
4. ` ```mermaid ` code blocks render as SVG diagrams
5. ` ```javascript ` (and other langs) get Prism syntax highlighting
6. XSS payloads (`<script>`, `<img onerror>`, `javascript:` URLs) are stripped
7. First preview load shows skeleton, subsequent switches are instant
8. Theme toggle updates Prism theme, mermaid theme, and KaTeX colors
9. Render pipeline is tree-shaken from write-only usage (no import cost if preview never opened)
10. Works in Shadow DOM — all styles scoped, no leaking
