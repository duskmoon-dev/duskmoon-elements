import { describe, it, expect } from 'bun:test';
import { Locale } from '../../src/core/locale.js';

describe('Locale', () => {
  describe('getText', () => {
    it('returns default English text', () => {
      const locale = new Locale();
      expect(locale.getText('loading')).toBe('Loading...');
      expect(locale.getText('noRowsToShow')).toBe('No rows to show');
      expect(locale.getText('selectAll')).toBe('Select All');
    });

    it('returns overridden text', () => {
      const locale = new Locale();
      locale.setLocaleText({ loading: 'Chargement...' });
      expect(locale.getText('loading')).toBe('Chargement...');
      // Other keys remain default
      expect(locale.getText('noRowsToShow')).toBe('No rows to show');
    });
  });

  describe('getTextWithParams', () => {
    it('replaces placeholders', () => {
      const locale = new Locale();
      const text = locale.getTextWithParams('matchesFound', { count: 5 });
      expect(text).toBe('5 matches found');
    });

    it('replaces multiple params', () => {
      const locale = new Locale();
      locale.setLocaleText({ matchesFound: '{count} of {total} found' });
      const text = locale.getTextWithParams('matchesFound', { count: 3, total: 10 });
      expect(text).toBe('3 of 10 found');
    });
  });

  describe('setLocaleText / mergeLocaleText', () => {
    it('setLocaleText replaces all overrides', () => {
      const locale = new Locale();
      locale.setLocaleText({ loading: 'A', copy: 'B' });
      locale.setLocaleText({ loading: 'C' });
      // 'copy' override should be gone
      expect(locale.getText('copy')).toBe('Copy');
      expect(locale.getText('loading')).toBe('C');
    });

    it('mergeLocaleText adds to existing overrides', () => {
      const locale = new Locale();
      locale.setLocaleText({ loading: 'A' });
      locale.mergeLocaleText({ copy: 'B' });
      expect(locale.getText('loading')).toBe('A');
      expect(locale.getText('copy')).toBe('B');
    });

    it('resetLocaleText clears all overrides', () => {
      const locale = new Locale();
      locale.setLocaleText({ loading: 'Custom' });
      locale.resetLocaleText();
      expect(locale.getText('loading')).toBe('Loading...');
    });
  });

  describe('overrides getter', () => {
    it('returns a copy of overrides', () => {
      const locale = new Locale();
      locale.setLocaleText({ loading: 'X' });
      const overrides = locale.overrides;
      overrides.loading = 'mutated';
      expect(locale.getText('loading')).toBe('X'); // not affected
    });
  });

  describe('direction (RTL)', () => {
    it('defaults to ltr', () => {
      const locale = new Locale();
      expect(locale.direction).toBe('ltr');
      expect(locale.isRtl).toBe(false);
    });

    it('can be set to rtl', () => {
      const locale = new Locale();
      locale.direction = 'rtl';
      expect(locale.direction).toBe('rtl');
      expect(locale.isRtl).toBe(true);
    });
  });

  describe('formatNumber', () => {
    it('formats a number', () => {
      const locale = new Locale();
      const result = locale.formatNumber(1234.5);
      expect(result).toContain('1');
      expect(result).toContain('234');
    });
  });

  describe('formatDate', () => {
    it('formats a date', () => {
      const locale = new Locale();
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      const result = locale.formatDate(date);
      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats a currency value', () => {
      const locale = new Locale();
      const result = locale.formatCurrency(42.5, 'USD', 'en-US');
      expect(result).toContain('42');
      expect(result).toContain('$');
    });
  });

  describe('getAllText', () => {
    it('returns full locale with overrides applied', () => {
      const locale = new Locale();
      locale.setLocaleText({ loading: 'Custom Loading' });
      const all = locale.getAllText();
      expect(all.loading).toBe('Custom Loading');
      expect(all.noRowsToShow).toBe('No rows to show');
      // Verify all keys exist
      expect(Object.keys(all).length).toBeGreaterThan(30);
    });
  });
});
