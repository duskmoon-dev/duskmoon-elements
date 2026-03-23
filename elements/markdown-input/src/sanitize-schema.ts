/**
 * Extended sanitization schema for rehype-sanitize.
 *
 * Builds on the default GitHub schema to allow:
 * - KaTeX output (span className/style, math MathML elements)
 * - Mermaid placeholders (code className)
 * - Task list checkboxes (input type/checked/disabled)
 */
import { defaultSchema } from 'rehype-sanitize';
import type { Schema } from 'hast-util-sanitize';

function deepMergeSchemas(base: Schema, extension: Partial<Schema>): Schema {
  const result: Schema = { ...base };

  if (extension.attributes) {
    result.attributes = { ...base.attributes };
    for (const [tag, attrs] of Object.entries(extension.attributes)) {
      const existing = result.attributes[tag];
      if (Array.isArray(existing)) {
        result.attributes[tag] = [...existing, ...(attrs as string[])];
      } else {
        result.attributes[tag] = attrs;
      }
    }
  }

  if (extension.tagNames) {
    result.tagNames = [...(base.tagNames ?? []), ...extension.tagNames];
  }

  return result;
}

export const sanitizeSchema: Schema = deepMergeSchemas(defaultSchema, {
  attributes: {
    // KaTeX output — `style` is required for KaTeX's inline math sizing.
    // Trade-off: allowing `style` on `span` is a potential injection vector if
    // a compromised KaTeX version emits user-controlled content. Acceptable here
    // because KaTeX only renders math expressions (inline $...$ and display $$...$$),
    // not arbitrary user HTML. Do not widen this allowlist without review.
    span: ['className', 'style'],
    // Mermaid placeholder
    code: ['className'],
    // Task list checkboxes (rendered as disabled — no interactive toggling)
    input: ['type', 'checked', 'disabled'],
    // KaTeX MathML presentation attributes
    math: ['xmlns', 'display'],
    annotation: ['encoding'],
    mi: ['mathvariant'],
    mo: ['stretchy', 'lspace', 'rspace'],
    mpadded: ['height', 'depth', 'width', 'lspace', 'voffset'],
    mspace: ['height', 'depth', 'width'],
    mstyle: ['mathsize', 'mathcolor', 'mathbackground', 'displaystyle'],
  },
  tagNames: [
    // KaTeX MathML elements
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
    // Additional KaTeX MathML elements emitted by KaTeX 0.16.x
    'mtext',
    'mpadded',
    'mspace',
    'merror',
    'mstyle',
    'ms',
    'mphantom',
    'mmultiscripts',
    'mprescripts',
  ],
});
