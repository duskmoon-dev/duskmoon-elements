import { describe, expect, test } from 'bun:test';

describe('@duskmoon-dev/elements/register bundle', () => {
  test('does not inline mermaid d3 helpers into browser IIFE output', async () => {
    const result = await Bun.build({
      entrypoints: [new URL('./register.ts', import.meta.url).pathname],
      format: 'iife',
      target: 'browser',
      write: false,
    });

    expect(result.success).toBe(true);
    const output = await result.outputs[0].text();

    expect(output).not.toContain('node_modules/.bun/d3-selection');
    expect(output).not.toContain('function dispatchEvent(node');
  });
});
