import { describe, test, expect } from 'bun:test';
import { sanitizeSchema } from './sanitize-schema.js';

describe('sanitizeSchema', () => {
  test('extends default schema with KaTeX span attributes', () => {
    const spanAttrs = sanitizeSchema.attributes?.['span'];
    expect(spanAttrs).toBeDefined();
    expect(spanAttrs).toContain('className');
    expect(spanAttrs).toContain('style');
  });

  test('allows code className for mermaid', () => {
    const codeAttrs = sanitizeSchema.attributes?.['code'];
    expect(codeAttrs).toBeDefined();
    expect(codeAttrs).toContain('className');
  });

  test('allows task list checkbox input attributes', () => {
    const inputAttrs = sanitizeSchema.attributes?.['input'];
    expect(inputAttrs).toBeDefined();
    expect(inputAttrs).toContain('type');
    expect(inputAttrs).toContain('checked');
    expect(inputAttrs).toContain('disabled');
  });

  test('includes all KaTeX MathML tag names', () => {
    const tags = sanitizeSchema.tagNames;
    expect(tags).toBeDefined();
    // All 16 MathML tags from the PRD schema
    for (const tag of [
      'math',
      'semantics',
      'mrow',
      'mi',
      'mo',
      'mn',
      'msup',
      'msub',
      'mfrac',
      'mover',
      'munder',
      'msqrt',
      'mtable',
      'mtr',
      'mtd',
      'annotation',
    ]) {
      expect(tags).toContain(tag);
    }
  });

  test('preserves default schema tagNames', () => {
    const tags = sanitizeSchema.tagNames;
    // Default GitHub schema includes common HTML tags
    expect(tags).toContain('p');
    expect(tags).toContain('a');
    expect(tags).toContain('strong');
    expect(tags).toContain('em');
    expect(tags).toContain('code');
    expect(tags).toContain('pre');
  });

  test('does not include script tag', () => {
    const tags = sanitizeSchema.tagNames;
    expect(tags).not.toContain('script');
  });

  test('does not allow style attribute on non-span elements', () => {
    // Only span should have style — verify div and p do not
    const divAttrs = sanitizeSchema.attributes?.['div'];
    const pAttrs = sanitizeSchema.attributes?.['p'];
    if (Array.isArray(divAttrs)) expect(divAttrs).not.toContain('style');
    if (Array.isArray(pAttrs)) expect(pAttrs).not.toContain('style');
  });

  test('does not include iframe or object tags', () => {
    const tags = sanitizeSchema.tagNames;
    expect(tags).not.toContain('iframe');
    expect(tags).not.toContain('object');
    expect(tags).not.toContain('embed');
  });
});
