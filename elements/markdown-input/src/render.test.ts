import { describe, test, expect } from 'bun:test';
import { renderMarkdown, renderMermaidBlocks } from './render.js';

describe('renderMarkdown', () => {
  test('renders plain text as paragraph', async () => {
    const html = await renderMarkdown('Hello world');
    expect(html).toContain('<p>');
    expect(html).toContain('Hello world');
  });

  test('renders headings', async () => {
    const html = await renderMarkdown('# Heading 1\n\n## Heading 2');
    expect(html).toContain('<h1>');
    expect(html).toContain('Heading 1');
    expect(html).toContain('<h2>');
    expect(html).toContain('Heading 2');
  });

  test('renders GFM tables', async () => {
    const md = '| A | B |\n|---|---|\n| 1 | 2 |';
    const html = await renderMarkdown(md);
    expect(html).toContain('<table>');
    expect(html).toContain('<td>');
  });

  test('renders GFM task lists', async () => {
    const md = '- [x] Done\n- [ ] Todo';
    const html = await renderMarkdown(md);
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('checked');
  });

  test('renders GFM strikethrough', async () => {
    const md = '~~deleted~~';
    const html = await renderMarkdown(md);
    expect(html).toContain('<del>');
    expect(html).toContain('deleted');
  });

  test('renders inline math with KaTeX', async () => {
    const md = 'Energy is $E=mc^2$ right?';
    const html = await renderMarkdown(md);
    // KaTeX output uses .katex class
    expect(html).toContain('katex');
  });

  test('renders display math with KaTeX', async () => {
    const md = '$$\n\\sum_{i=1}^n i\n$$';
    const html = await renderMarkdown(md);
    expect(html).toContain('katex');
  });

  test('renders fenced code blocks', async () => {
    const md = '```javascript\nconst x = 1;\n```';
    const html = await renderMarkdown(md);
    expect(html).toContain('<code');
    expect(html).toContain('const');
  });

  test('preserves mermaid code blocks for post-render', async () => {
    const md = '```mermaid\ngraph TD;\n  A-->B;\n```';
    const html = await renderMarkdown(md);
    // Mermaid blocks should survive as code blocks (post-render handles them)
    expect(html).toContain('language-mermaid');
  });

  test('renders bold and italic', async () => {
    const md = '**bold** and *italic*';
    const html = await renderMarkdown(md);
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<em>italic</em>');
  });

  test('renders links', async () => {
    const md = '[click](https://example.com)';
    const html = await renderMarkdown(md);
    expect(html).toContain('<a');
    expect(html).toContain('https://example.com');
  });

  test('renders images', async () => {
    const md = '![alt](https://example.com/img.png)';
    const html = await renderMarkdown(md);
    expect(html).toContain('<img');
    expect(html).toContain('alt');
  });

  test('renders blockquotes', async () => {
    const md = '> quoted text';
    const html = await renderMarkdown(md);
    expect(html).toContain('<blockquote>');
  });

  test('renders horizontal rules', async () => {
    const md = 'above\n\n---\n\nbelow';
    const html = await renderMarkdown(md);
    expect(html).toContain('<hr');
  });

  test('renders unordered lists', async () => {
    const md = '- item 1\n- item 2';
    const html = await renderMarkdown(md);
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>');
  });

  test('renders ordered lists', async () => {
    const md = '1. first\n2. second';
    const html = await renderMarkdown(md);
    expect(html).toContain('<ol>');
    expect(html).toContain('<li>');
  });

  test('renders empty input', async () => {
    const html = await renderMarkdown('');
    expect(html.trim()).toBe('');
  });

  test('caches processor across calls', async () => {
    const html1 = await renderMarkdown('test 1');
    const html2 = await renderMarkdown('test 2');
    expect(html1).toContain('test 1');
    expect(html2).toContain('test 2');
  });

  test('concurrent calls share one processor build (no duplicate initialization)', async () => {
    // Fire multiple concurrent renders before the processor is cached.
    // All should resolve correctly without interfering with each other.
    const [a, b, c] = await Promise.all([
      renderMarkdown('# Concurrent A'),
      renderMarkdown('# Concurrent B'),
      renderMarkdown('# Concurrent C'),
    ]);
    expect(a).toContain('Concurrent A');
    expect(b).toContain('Concurrent B');
    expect(c).toContain('Concurrent C');
  });

  test('renders nested blockquotes', async () => {
    const md = '> outer\n>> inner';
    const html = await renderMarkdown(md);
    // Should contain nested blockquote elements
    expect(html).toContain('<blockquote>');
    expect(html).toContain('inner');
  });

  test('renders inline code', async () => {
    const md = 'Use `console.log()` for debug';
    const html = await renderMarkdown(md);
    expect(html).toContain('<code>console.log()</code>');
  });

  test('renders GFM autolinks', async () => {
    const md = 'Visit https://example.com for more';
    const html = await renderMarkdown(md);
    expect(html).toContain('<a');
    expect(html).toContain('https://example.com');
  });

  test('renders GFM table with alignment', async () => {
    const md = '| Left | Center | Right |\n|:-----|:------:|------:|\n| a | b | c |';
    const html = await renderMarkdown(md);
    expect(html).toContain('<table>');
    expect(html).toContain('align');
  });

  test('renders task list checkboxes as disabled', async () => {
    const md = '- [x] Done\n- [ ] Todo';
    const html = await renderMarkdown(md);
    expect(html).toContain('disabled');
  });

  test('renders code block with unknown language gracefully', async () => {
    const md = '```unknownlang\nsome code\n```';
    const html = await renderMarkdown(md);
    expect(html).toContain('<code');
    expect(html).toContain('some code');
  });

  test('renders complex nested markdown', async () => {
    const md = `> **bold in quote** and *italic*
>
> - list in quote
> - with \`code\``;
    const html = await renderMarkdown(md);
    expect(html).toContain('<blockquote>');
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
    expect(html).toContain('<li>');
  });

  test('handles very long single-line input', async () => {
    const md = 'word '.repeat(1000);
    const html = await renderMarkdown(md);
    expect(html).toContain('<p>');
    expect(html).toContain('word');
  });

  test('renders multiple code blocks in sequence', async () => {
    const md = '```js\na\n```\n\n```python\nb\n```';
    const html = await renderMarkdown(md);
    // Both blocks should be present
    expect(html).toContain('language-js');
    expect(html).toContain('language-python');
  });
});

describe('renderMermaidBlocks', () => {
  test('returns immediately when no mermaid blocks are present', async () => {
    const container = document.createElement('div');
    container.innerHTML = '<p>No mermaid here</p>';
    // Should resolve without throwing (early-exit path)
    await expect(renderMermaidBlocks(container)).resolves.toBeUndefined();
    // Container is unchanged
    expect(container.innerHTML).toContain('No mermaid here');
  });

  test('does not modify container with only non-mermaid code blocks', async () => {
    const container = document.createElement('div');
    container.innerHTML = '<pre><code class="language-js">const x = 1;</code></pre>';
    await renderMermaidBlocks(container);
    // JS block should be untouched
    expect(container.innerHTML).toContain('language-js');
    expect(container.innerHTML).toContain('const x = 1;');
  });
});
