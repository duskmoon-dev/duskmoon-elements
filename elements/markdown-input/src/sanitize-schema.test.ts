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

  test('includes KaTeX MathML tag names', () => {
    const tags = sanitizeSchema.tagNames;
    expect(tags).toBeDefined();
    expect(tags).toContain('math');
    expect(tags).toContain('semantics');
    expect(tags).toContain('mrow');
    expect(tags).toContain('mfrac');
    expect(tags).toContain('msup');
    expect(tags).toContain('msub');
    expect(tags).toContain('annotation');
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
});
