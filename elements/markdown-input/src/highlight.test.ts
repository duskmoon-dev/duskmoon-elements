import { describe, test, expect, afterEach } from 'bun:test';
import { highlightMarkdown, applyPrismTheme } from './highlight.js';

// In the test environment Prism is not loaded, so highlightMarkdown always
// uses the fallback path (HTML-escape + append NBSP). This verifies the
// graceful-degradation branch.

describe('highlightMarkdown (fallback — no Prism)', () => {
  test('appends non-breaking space to prevent backdrop collapse', () => {
    const result = highlightMarkdown('hello');
    expect(result.endsWith('\u00a0')).toBe(true);
  });

  test('appends NBSP even on empty string', () => {
    const result = highlightMarkdown('');
    expect(result).toBe('\u00a0');
  });

  test('escapes < and > characters', () => {
    const result = highlightMarkdown('<strong>bold</strong>');
    expect(result).toContain('&lt;strong&gt;');
    expect(result).not.toContain('<strong>');
  });

  test('escapes & before other characters (no double-escaping)', () => {
    const result = highlightMarkdown('&amp;');
    // & → &amp; then amp; stays → &amp;amp;
    expect(result).toContain('&amp;amp;');
    expect(result).not.toContain('&&');
  });

  test('escapes ampersand alone', () => {
    const result = highlightMarkdown('Tom & Jerry');
    expect(result).toContain('Tom &amp; Jerry');
  });

  test('preserves newlines (not stripped)', () => {
    const result = highlightMarkdown('line 1\nline 2');
    expect(result).toContain('line 1\nline 2');
  });

  test('handles markdown syntax characters', () => {
    const result = highlightMarkdown('# Heading\n**bold** `code`');
    expect(result).toContain('# Heading');
    expect(result).toContain('**bold**');
    expect(result).toContain('`code`');
  });

  test('escapes > characters', () => {
    const result = highlightMarkdown('a > b');
    expect(result).toContain('a &gt; b');
  });
});

// ── Prism mock tests ────────────────────────────────────────────────────

describe('highlightMarkdown (with mock Prism)', () => {
  afterEach(() => {
    delete (window as Record<string, unknown>).Prism;
  });

  test('uses Prism.highlight when available', () => {
    (window as Record<string, unknown>).Prism = {
      languages: { markdown: {} },
      highlight: (_text: string, _grammar: unknown, _lang: string) =>
        '<span class="token heading"># Hello</span>',
    };
    const result = highlightMarkdown('# Hello');
    expect(result).toContain('<span class="token heading">');
    expect(result.endsWith('\u00a0')).toBe(true);
  });

  test('falls back to escaped text when Prism.highlight throws', () => {
    (window as Record<string, unknown>).Prism = {
      languages: { markdown: {} },
      highlight: () => {
        throw new Error('grammar error');
      },
    };
    const result = highlightMarkdown('<script>');
    expect(result).toContain('&lt;script&gt;');
    expect(result).not.toContain('<script>');
    expect(result.endsWith('\u00a0')).toBe(true);
  });

  test('uses fallback when Prism exists but has no markdown language', () => {
    (window as Record<string, unknown>).Prism = {
      languages: {},
    };
    const result = highlightMarkdown('test');
    expect(result).toBe('test\u00a0');
  });
});

// ── applyPrismTheme tests ───────────────────────────────────────────────

describe('applyPrismTheme', () => {
  function makeShadowRoot(): ShadowRoot {
    const host = document.createElement('div');
    return host.attachShadow({ mode: 'open' });
  }

  test('creates a style element with light theme import', () => {
    const sr = makeShadowRoot();
    applyPrismTheme(sr, false);
    const style = sr.getElementById('prism-theme') as HTMLStyleElement;
    expect(style).toBeTruthy();
    expect(style.textContent).toContain('prism-coy');
    expect(style.textContent).toMatch(/^@import url\("/);
  });

  test('creates a style element with dark theme import', () => {
    const sr = makeShadowRoot();
    applyPrismTheme(sr, true);
    const style = sr.getElementById('prism-theme') as HTMLStyleElement;
    expect(style).toBeTruthy();
    expect(style.textContent).toContain('prism-tomorrow');
  });

  test('reuses existing style element on toggle', () => {
    const sr = makeShadowRoot();
    applyPrismTheme(sr, false);
    applyPrismTheme(sr, true);
    // Should still be exactly 1 style element
    const styles = sr.querySelectorAll('#prism-theme');
    expect(styles.length).toBe(1);
    expect((styles[0] as HTMLStyleElement).textContent).toContain('prism-tomorrow');
  });

  test('does not update textContent when theme is unchanged', () => {
    const sr = makeShadowRoot();
    applyPrismTheme(sr, false);
    const style = sr.getElementById('prism-theme') as HTMLStyleElement;
    const original = style.textContent;
    applyPrismTheme(sr, false);
    // Should be referentially the same (no unnecessary DOM write)
    expect(style.textContent).toBe(original);
  });
});
