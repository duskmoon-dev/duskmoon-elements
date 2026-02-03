import { expect, test, describe } from 'bun:test';
import {
  sunshineTheme,
  moonlightTheme,
  oceanTheme,
  forestTheme,
  roseTheme,
  themes,
  applyTheme,
} from './themes';
import type { ThemeName } from './themes';

describe('Theme presets', () => {
  const allThemes = [
    ['sunshine', sunshineTheme],
    ['moonlight', moonlightTheme],
    ['ocean', oceanTheme],
    ['forest', forestTheme],
    ['rose', roseTheme],
  ] as const;

  describe.each(allThemes)('%s theme', (_name, theme) => {
    test('defines primary colors', () => {
      expect(theme).toContain('--color-primary:');
      expect(theme).toContain('--color-primary-content:');
      expect(theme).toContain('--color-on-primary:');
    });

    test('defines secondary colors', () => {
      expect(theme).toContain('--color-secondary:');
      expect(theme).toContain('--color-on-secondary:');
    });

    test('defines tertiary colors', () => {
      expect(theme).toContain('--color-tertiary:');
      expect(theme).toContain('--color-on-tertiary:');
    });

    test('defines surface colors', () => {
      expect(theme).toContain('--color-surface:');
      expect(theme).toContain('--color-surface-container:');
      expect(theme).toContain('--color-surface-container-low:');
      expect(theme).toContain('--color-surface-container-high:');
      expect(theme).toContain('--color-surface-variant:');
      expect(theme).toContain('--color-on-surface:');
      expect(theme).toContain('--color-on-surface-variant:');
    });

    test('defines outline colors', () => {
      expect(theme).toContain('--color-outline:');
      expect(theme).toContain('--color-outline-variant:');
    });

    test('defines semantic colors', () => {
      expect(theme).toContain('--color-success:');
      expect(theme).toContain('--color-warning:');
      expect(theme).toContain('--color-error:');
      expect(theme).toContain('--color-info:');
    });

    test('defines shadows', () => {
      expect(theme).toContain('--shadow-sm:');
      expect(theme).toContain('--shadow-md:');
      expect(theme).toContain('--shadow-lg:');
    });

    test('defines focus ring', () => {
      expect(theme).toContain('--focus-ring:');
      expect(theme).toContain('--focus-ring-offset:');
    });

    test('uses oklch color format', () => {
      expect(theme).toContain('oklch(');
    });
  });

  describe('themes map', () => {
    test('contains all five themes', () => {
      expect(Object.keys(themes)).toEqual(['sunshine', 'moonlight', 'ocean', 'forest', 'rose']);
    });

    test('maps to correct theme objects', () => {
      expect(themes.sunshine).toBe(sunshineTheme);
      expect(themes.moonlight).toBe(moonlightTheme);
      expect(themes.ocean).toBe(oceanTheme);
      expect(themes.forest).toBe(forestTheme);
      expect(themes.rose).toBe(roseTheme);
    });
  });

  describe('ThemeName type', () => {
    test('accepts valid theme names', () => {
      const names: ThemeName[] = ['sunshine', 'moonlight', 'ocean', 'forest', 'rose'];
      expect(names).toHaveLength(5);
    });
  });

  describe('applyTheme()', () => {
    test('applies theme by name', () => {
      const el = document.createElement('div');
      applyTheme(el, 'moonlight');
      // Should have set CSS custom properties on the element
      expect(el.style.getPropertyValue('--color-primary')).toBeTruthy();
      expect(el.style.getPropertyValue('--color-surface')).toBeTruthy();
    });

    test('applies custom CSS string', () => {
      const el = document.createElement('div');
      const customTheme = '--color-primary: red; --color-surface: white;';
      applyTheme(el, customTheme);
      expect(el.style.getPropertyValue('--color-primary')).toBe('red');
      expect(el.style.getPropertyValue('--color-surface')).toBe('white');
    });

    test('handles theme string with colons in values', () => {
      const el = document.createElement('div');
      applyTheme(el, 'sunshine');
      // oklch values contain colons-like patterns but the parser should handle them
      const primary = el.style.getPropertyValue('--color-primary');
      expect(primary).toBeTruthy();
    });
  });
});
