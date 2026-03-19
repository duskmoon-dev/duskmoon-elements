import { describe, test, expect } from 'bun:test';
import { highlightMarkdown } from './highlight.js';

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
});
