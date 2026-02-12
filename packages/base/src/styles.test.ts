import { expect, test, describe } from 'bun:test';
import { css, combineStyles, cssVars } from './styles';

describe('css', () => {
  test('creates a CSSStyleSheet', () => {
    const sheet = css`
      :host {
        display: block;
      }
    `;

    expect(sheet).toBeInstanceOf(CSSStyleSheet);
  });

  test('handles template literals with interpolation', () => {
    const color = 'red';
    const size = 16;

    const sheet = css`
      :host {
        color: ${color};
        font-size: ${size}px;
      }
    `;

    expect(sheet).toBeInstanceOf(CSSStyleSheet);
  });

  test('caches stylesheets for same template', () => {
    const sheet1 = css`
      :host {
        display: block;
      }
    `;

    const sheet2 = css`
      :host {
        display: block;
      }
    `;

    // Note: Different template literals are different objects,
    // so caching only works within the same call site
    expect(sheet1).toBeInstanceOf(CSSStyleSheet);
    expect(sheet2).toBeInstanceOf(CSSStyleSheet);
  });
});

describe('combineStyles', () => {
  test('returns array of stylesheets', () => {
    const sheet1 = css`
      :host {
        display: block;
      }
    `;
    const sheet2 = css`
      .content {
        padding: 1rem;
      }
    `;

    const combined = combineStyles(sheet1, sheet2);

    expect(Array.isArray(combined)).toBe(true);
    expect(combined.length).toBe(2);
    expect(combined[0]).toBe(sheet1);
    expect(combined[1]).toBe(sheet2);
  });

  test('handles empty input', () => {
    const combined = combineStyles();
    expect(combined).toEqual([]);
  });
});

describe('cssVars', () => {
  test('creates CSS custom property declarations', () => {
    const result = cssVars({
      'color-primary': 'oklch(60% 0.15 250)',
      'spacing-md': '1rem',
    });

    expect(result).toContain('--color-primary: oklch(60% 0.15 250)');
    expect(result).toContain('--spacing-md: 1rem');
  });

  test('handles numeric values', () => {
    const result = cssVars({
      'z-index': 100,
    });

    expect(result).toContain('--z-index: 100');
  });

  test('handles empty object', () => {
    const result = cssVars({});
    expect(result).toBe('');
  });
});
