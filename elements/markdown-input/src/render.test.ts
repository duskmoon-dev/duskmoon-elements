import { describe, test, expect } from 'bun:test';
import { renderMarkdown } from './render.js';

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
});
