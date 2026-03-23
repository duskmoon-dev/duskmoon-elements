import { describe, test, expect } from 'bun:test';
import { countWords, countColour, renderStatusCount } from './status-bar.js';

describe('countWords', () => {
  test('counts words in a simple sentence', () => {
    expect(countWords('hello world foo')).toBe(3);
  });

  test('returns 0 for empty string', () => {
    expect(countWords('')).toBe(0);
  });

  test('returns 0 for whitespace-only string', () => {
    expect(countWords('   \n\t  ')).toBe(0);
  });

  test('handles leading and trailing whitespace', () => {
    expect(countWords('  one two  ')).toBe(2);
  });

  test('handles multiple spaces between words', () => {
    expect(countWords('a   b    c')).toBe(3);
  });

  test('handles newlines as word separators', () => {
    expect(countWords('line one\nline two')).toBe(4);
  });

  test('counts single word', () => {
    expect(countWords('markdown')).toBe(1);
  });

  test('counts markdown syntax as words', () => {
    // Each token separated by whitespace counts as a word
    expect(countWords('**bold** and _italic_')).toBe(3);
  });
});

describe('countColour', () => {
  test('returns normal when no maxWords', () => {
    expect(countColour(100, null)).toBe('normal');
  });

  test('returns normal when well under cap', () => {
    expect(countColour(50, 100)).toBe('normal');
  });

  test('returns warning at 90%', () => {
    expect(countColour(90, 100)).toBe('warning');
  });

  test('returns warning between 90% and 99%', () => {
    expect(countColour(95, 100)).toBe('warning');
  });

  test('returns error at exactly 100%', () => {
    expect(countColour(100, 100)).toBe('error');
  });

  test('returns error when over cap', () => {
    expect(countColour(150, 100)).toBe('error');
  });

  test('returns normal at 89%', () => {
    expect(countColour(89, 100)).toBe('normal');
  });

  test('returns normal when maxWords is 0 (treated as uncapped)', () => {
    expect(countColour(50, 0)).toBe('normal');
  });

  test('returns warning at exactly 90% with small cap', () => {
    expect(countColour(9, 10)).toBe('warning');
  });

  test('returns normal at 0 words regardless of cap', () => {
    expect(countColour(0, 100)).toBe('normal');
  });
});

describe('renderStatusCount', () => {
  test('renders uncapped count without class', () => {
    const html = renderStatusCount(10, 50, null);
    expect(html).toContain('10 words');
    expect(html).toContain('50 chars');
    expect(html).not.toContain('warning');
    expect(html).not.toContain('error');
  });

  test('renders capped count at normal level', () => {
    const html = renderStatusCount(50, 200, 100);
    expect(html).toContain('50 / 100 words');
    expect(html).toContain('200 chars');
    expect(html).not.toContain('class=');
  });

  test('renders capped count with warning class', () => {
    const html = renderStatusCount(92, 300, 100);
    expect(html).toContain('class="warning"');
    expect(html).toContain('92 / 100 words');
  });

  test('renders capped count with error class', () => {
    const html = renderStatusCount(105, 400, 100);
    expect(html).toContain('class="error"');
    expect(html).toContain('105 / 100 words');
  });

  test('renders 0 words correctly', () => {
    const html = renderStatusCount(0, 0, null);
    expect(html).toContain('0 words');
    expect(html).toContain('0 chars');
  });

  test('omits class attribute at normal level', () => {
    const html = renderStatusCount(10, 40, 100);
    // No class attribute on span at normal level
    expect(html).not.toMatch(/class=/);
  });

  test('renders uncapped count when maxWords is undefined', () => {
    const html = renderStatusCount(5, 20, undefined);
    expect(html).toContain('5 words');
    expect(html).toContain('20 chars');
    // Uncapped format: no "X / Y words" pattern
    expect(html).not.toMatch(/\d+ \/ \d+ words/);
  });

  test('renders uncapped count when maxWords is 0', () => {
    // maxWords=0 is falsy, so renderStatusCount treats it as uncapped
    const html = renderStatusCount(10, 50, 0 as unknown as null);
    expect(html).toContain('10 words');
    expect(html).not.toMatch(/\d+ \/ \d+ words/);
  });
});
