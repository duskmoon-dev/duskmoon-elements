/**
 * Render pipeline for the preview tab.
 *
 * Uses unified (remark → rehype) to transform raw markdown into sanitized HTML.
 * All dependencies are lazy-loaded on first preview activation for tree-shaking.
 *
 * Mermaid diagrams are handled as a post-render step (not part of the unified pipeline).
 */

import { sanitizeSchema } from './sanitize-schema.js';

// ── Lazy-loaded processor cache ─────────────────────────────────────────

type Processor = {
  process(source: string): Promise<{ toString(): string }>;
};

type SyntaxNode = {
  type: string;
  tagName?: string;
  lang?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: SyntaxNode[];
};

function renderFrontMatter() {
  return (tree: SyntaxNode): void => {
    if (tree.type === 'root' && tree.children) {
      tree.children = tree.children.map((node) =>
        node.type === 'yaml' ? { type: 'code', lang: 'yaml', value: node.value } : node,
      );
    }
  };
}

function isSupportedColor(value: string): boolean {
  if (/^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.test(value)) return true;

  const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/.exec(value);
  if (rgb) return rgb.slice(1).every((channel) => Number(channel) <= 255);

  const hsl = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/.exec(value);
  return Boolean(hsl && Number(hsl[1]) <= 360 && Number(hsl[2]) <= 100 && Number(hsl[3]) <= 100);
}

function addColorChips() {
  return (tree: SyntaxNode): void => {
    appendColorChips(tree);
  };
}

function appendColorChips(node: SyntaxNode): void {
  if (!node.children) return;

  for (const child of node.children) {
    const text = child.children?.length === 1 ? child.children[0] : undefined;
    const color =
      node.tagName !== 'pre' &&
      child.type === 'element' &&
      child.tagName === 'code' &&
      text?.type === 'text'
        ? text.value
        : undefined;

    if (color && isSupportedColor(color)) {
      child.children?.push({
        type: 'element',
        tagName: 'span',
        properties: {
          className: ['color-chip'],
          style: `--color-chip: ${color}`,
          ariaHidden: 'true',
        },
        children: [],
      });
    } else {
      appendColorChips(child);
    }
  }
}

// Store the promise itself so concurrent calls share one build (no duplicate initialization)
let processorPromise: Promise<Processor> | null = null;

async function buildProcessor(): Promise<Processor> {
  const [
    { unified },
    { default: remarkParse },
    { default: remarkFrontmatter },
    { default: remarkGfm },
    { default: remarkMath },
    { default: remarkBreaks },
    { default: remarkRehype },
    { default: rehypeKatex },
    { default: rehypePrismPlus },
    { default: rehypeSanitize },
    { default: rehypeStringify },
  ] = await Promise.all([
    import('unified'),
    import('remark-parse'),
    import('remark-frontmatter'),
    import('remark-gfm'),
    import('remark-math'),
    import('remark-breaks'),
    import('remark-rehype'),
    import('rehype-katex'),
    import('rehype-prism-plus'),
    import('rehype-sanitize'),
    import('rehype-stringify'),
  ]);

  return unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(renderFrontMatter)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkBreaks)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex)
    .use(rehypePrismPlus, { ignoreMissing: true })
    .use(addColorChips)
    .use(rehypeSanitize, sanitizeSchema)
    .use(rehypeStringify) as unknown as Processor;
}

function getProcessor(): Promise<Processor> {
  if (!processorPromise) {
    processorPromise = buildProcessor().catch((err) => {
      // Clear cache on failure so subsequent calls retry the imports
      processorPromise = null;
      throw err;
    });
  }
  return processorPromise;
}

/**
 * Transform raw markdown into sanitized HTML using the unified pipeline.
 * The processor is lazy-loaded on first call and cached for subsequent renders.
 */
export async function renderMarkdown(source: string): Promise<string> {
  const proc = await getProcessor();
  const file = await proc.process(source);
  return String(file);
}

// ── Mermaid post-render ─────────────────────────────────────────────────

let mermaidIdCounter = 0;
const bundledMermaidSpecifier = 'mermaid';

/**
 * Detect the current theme by checking `data-theme` on `<html>`.
 */
function getCurrentTheme(): string {
  if (typeof document === 'undefined') return 'default';
  return document.documentElement.getAttribute('data-theme') ?? 'default';
}

/**
 * Post-render step: find all `pre > code.language-mermaid` blocks in the container,
 * lazy-load mermaid, and replace each `<pre>` with the rendered SVG.
 *
 * @param container  The preview container element (inside shadow DOM)
 * @param mermaidSrc Optional override URL for the mermaid ESM bundle
 */
export async function renderMermaidBlocks(
  container: HTMLElement,
  mermaidSrc?: string,
): Promise<void> {
  const blocks = container.querySelectorAll('pre > code.language-mermaid');
  if (blocks.length === 0) return;

  // Dynamic import — either from provided URL or the npm package.
  // Only https: URLs are accepted to prevent arbitrary code execution via
  // a consumer-supplied mermaid-src attribute pointing to a malicious module.
  if (mermaidSrc !== undefined && !/^https:\/\//i.test(mermaidSrc)) {
    console.warn(
      `[el-dm-markdown-input] mermaid-src "${mermaidSrc}" rejected — only https: URLs are allowed. Falling back to bundled mermaid.`,
    );
    mermaidSrc = undefined;
  }

  // Catch import failure separately so a CDN outage does not destroy the
  // already-rendered prose HTML. Blocks are marked as errored and we return
  // without throwing — the caller's prose render survives.
  let mermaidModule: { default?: unknown } | undefined;
  try {
    mermaidModule = mermaidSrc
      ? await import(/* @vite-ignore */ mermaidSrc)
      : await import(/* @vite-ignore */ bundledMermaidSpecifier);
  } catch (err) {
    console.error('[el-dm-markdown-input] Failed to load mermaid: %o', err);
    blocks.forEach((block) => block.parentElement?.classList.add('mermaid-error'));
    return;
  }
  const mermaid = (mermaidModule!.default ?? mermaidModule) as {
    initialize(opts: Record<string, unknown>): void;
    render(id: string, src: string): Promise<{ svg: string }>;
  };

  mermaid.initialize({
    startOnLoad: false,
    theme: getCurrentTheme() === 'moonlight' ? 'dark' : 'default',
    fontFamily: 'inherit',
  });

  for (const [i, block] of [...blocks].entries()) {
    const pre = block.parentElement;
    if (!pre) continue;

    const id = `mermaid-${++mermaidIdCounter}-${i}`;
    try {
      const { svg } = await mermaid.render(id, block.textContent ?? '');
      const wrapper = document.createElement('div');
      wrapper.className = 'mermaid-diagram';
      // Safety: mermaid's rendered SVG is treated as trusted output from the
      // mermaid library (not user HTML). It bypasses rehype-sanitize intentionally.
      // Known risk: if mermaid emits user-controlled content in SVG attributes or
      // text nodes a XSS could occur. The mermaid-src URL is validated to https: only.
      // TODO: run mermaid output through DOMPurify for defense-in-depth once a
      // lightweight sanitizer integration is available without bloating the bundle.
      wrapper.innerHTML = svg;
      pre.replaceWith(wrapper);
    } catch (err) {
      console.error(
        '[el-dm-markdown-input] mermaid.render failed for block %s: %o\nSource: %s',
        id,
        err,
        block.textContent?.slice(0, 200),
      );
      pre.classList.add('mermaid-error');
    }
  }
}
