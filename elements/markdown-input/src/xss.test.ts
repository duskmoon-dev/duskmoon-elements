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
});
