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

// Store the promise itself so concurrent calls share one build (no duplicate initialization)
let processorPromise: Promise<Processor> | null = null;

async function buildProcessor(): Promise<Processor> {
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

  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeKatex)
    .use(rehypePrismPlus, { ignoreMissing: true })
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

  // Dynamic import — either from provided URL or the npm package
  const mermaidModule = mermaidSrc
    ? await import(/* @vite-ignore */ mermaidSrc)
    : await import('mermaid');
  const mermaid = mermaidModule.default ?? mermaidModule;

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
      wrapper.innerHTML = svg;
      pre.replaceWith(wrapper);
    } catch {
      // Leave original code block on render failure
      pre.classList.add('mermaid-error');
    }
  }
}
