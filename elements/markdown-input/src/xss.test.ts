import { describe, test, expect } from 'bun:test';
import { renderMarkdown } from './render.js';

describe('XSS protection', () => {
  test('strips script tags', async () => {
    const md = '<script>alert("xss")</script>';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('<script');
    expect(html).not.toContain('alert');
  });

  test('strips img onerror handlers', async () => {
    const md = '<img src=x onerror=alert(1)>';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('onerror');
  });

  test('strips javascript: URLs from links', async () => {
    // The sanitizer should strip dangerous href values
    const md = '[click](javascript:alert(1))';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('javascript:');
  });

  test('strips event handlers from arbitrary HTML', async () => {
    const md = '<div onmouseover="alert(1)">hover me</div>';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('onmouseover');
  });

  test('strips iframe tags', async () => {
    const md = '<iframe src="https://evil.com"></iframe>';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('<iframe');
  });

  test('strips data: URLs in images', async () => {
    const md = '![](data:text/html,<script>alert(1)</script>)';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('data:text/html');
  });

  test('allows safe content through', async () => {
    const md = '**Bold** and [safe link](https://example.com)';
    const html = await renderMarkdown(md);
    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain('https://example.com');
  });

  test('strips SVG-based XSS', async () => {
    const md = '<svg onload="alert(1)"><circle r="40"></circle></svg>';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('onload');
  });

  test('strips vbscript: URLs', async () => {
    const md = '[click](vbscript:alert(1))';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('vbscript:');
  });

  test('strips object/embed tags', async () => {
    const md = '<object data="evil.swf"></object><embed src="evil.swf">';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('<object');
    expect(html).not.toContain('<embed');
  });

  test('strips form tags', async () => {
    const md = '<form action="https://evil.com"><input type="submit"></form>';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('<form');
  });

  test('strips style tags with CSS injection', async () => {
    const md = '<style>body { display: none }</style>';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('<style');
  });

  test('strips base tag hijacking', async () => {
    const md = '<base href="https://evil.com">';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('<base');
  });

  test('strips meta refresh redirect', async () => {
    const md = '<meta http-equiv="refresh" content="0;url=https://evil.com">';
    const html = await renderMarkdown(md);
    expect(html).not.toContain('<meta');
  });

  test('preserves KaTeX math output classes', async () => {
    const md = '$x^2$';
    const html = await renderMarkdown(md);
    // KaTeX uses span.katex which requires className to be allowed
    expect(html).toContain('katex');
  });
});
