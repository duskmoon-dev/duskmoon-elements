import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmProgress, register } from './index';

register();

describe('ElDmProgress', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createProgress(
    attrs: Record<string, unknown> = {},
  ): ElDmProgress {
    const el = document.createElement('el-dm-progress') as ElDmProgress;
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'showValue') {
        (el as unknown as Record<string, unknown>).showValue = val;
      } else {
        (el as unknown as Record<string, unknown>)[key] = val;
      }
    }
    container.appendChild(el);
    return el;
  }

  // ──────────────── Registration ────────────────
  test('is defined', () => {
    expect(customElements.get('el-dm-progress')).toBe(ElDmProgress);
  });

  // ──────────────── Rendering ────────────────
  describe('rendering', () => {
    test('creates a shadow root with progressbar role', () => {
      const el = createProgress();
      expect(
        el.shadowRoot?.querySelector('[role="progressbar"]'),
      ).toBeDefined();
    });

    test('renders progress bar', () => {
      const el = createProgress();
      expect(el.shadowRoot?.querySelector('.progress-bar')).toBeDefined();
    });

    test('exposes progress part', () => {
      const el = createProgress();
      expect(
        el.shadowRoot?.querySelector('[part="progress"]'),
      ).toBeDefined();
    });

    test('exposes bar part', () => {
      const el = createProgress();
      expect(el.shadowRoot?.querySelector('[part="bar"]')).toBeDefined();
    });
  });

  // ──────────────── ARIA Attributes ────────────────
  describe('ARIA', () => {
    test('sets aria-valuenow', () => {
      const el = createProgress({ value: 50 });
      const progress = el.shadowRoot?.querySelector('[role="progressbar"]');
      expect(progress?.getAttribute('aria-valuenow')).toBe('50');
    });

    test('sets aria-valuemin to 0', () => {
      const el = createProgress();
      const progress = el.shadowRoot?.querySelector('[role="progressbar"]');
      expect(progress?.getAttribute('aria-valuemin')).toBe('0');
    });

    test('sets aria-valuemax', () => {
      const el = createProgress({ max: 200 });
      const progress = el.shadowRoot?.querySelector('[role="progressbar"]');
      expect(progress?.getAttribute('aria-valuemax')).toBe('200');
    });

    test('default aria-valuemax is 100', () => {
      const el = createProgress();
      const progress = el.shadowRoot?.querySelector('[role="progressbar"]');
      expect(progress?.getAttribute('aria-valuemax')).toBe('100');
    });
  });

  // ──────────────── Properties & Defaults ────────────────
  describe('properties', () => {
    test('default value is 0', () => {
      const el = createProgress();
      expect(el.value).toBe(0);
    });

    test('default max is 100', () => {
      const el = createProgress();
      expect(el.max).toBe(100);
    });

    test('default color is primary', () => {
      const el = createProgress();
      expect(el.color).toBe('primary');
    });

    test('reflects value to attribute', () => {
      const el = createProgress({ value: 42 });
      expect(el.getAttribute('value')).toBe('42');
    });

    test('reflects max to attribute', () => {
      const el = createProgress({ max: 200 });
      expect(el.getAttribute('max')).toBe('200');
    });

    test('reflects color to attribute', () => {
      const el = createProgress({ color: 'success' });
      expect(el.getAttribute('color')).toBe('success');
    });

    test('reflects indeterminate to attribute', () => {
      const el = createProgress({ indeterminate: true });
      expect(el.hasAttribute('indeterminate')).toBe(true);
    });

    test('reflects striped to attribute', () => {
      const el = createProgress({ striped: true });
      expect(el.hasAttribute('striped')).toBe(true);
    });

    test('reflects animated to attribute', () => {
      const el = createProgress({ animated: true });
      expect(el.hasAttribute('animated')).toBe(true);
    });
  });

  // ──────────────── Bar Width Percentage ────────────────
  describe('percentage calculation', () => {
    test('0% at value 0', () => {
      const el = createProgress({ value: 0 });
      const bar = el.shadowRoot?.querySelector(
        '.progress-bar',
      ) as HTMLElement;
      expect(bar.style.width).toBe('0%');
    });

    test('100% at max value', () => {
      const el = createProgress({ value: 100 });
      const bar = el.shadowRoot?.querySelector(
        '.progress-bar',
      ) as HTMLElement;
      expect(bar.style.width).toBe('100%');
    });

    test('75% at value 75', () => {
      const el = createProgress({ value: 75 });
      const bar = el.shadowRoot?.querySelector(
        '.progress-bar',
      ) as HTMLElement;
      expect(bar.style.width).toBe('75%');
    });

    test('handles custom max', () => {
      const el = createProgress({ value: 50, max: 200 });
      const bar = el.shadowRoot?.querySelector(
        '.progress-bar',
      ) as HTMLElement;
      expect(bar.style.width).toBe('25%');
    });

    test('clamps value above max to 100%', () => {
      const el = createProgress({ value: 150, max: 100 });
      const bar = el.shadowRoot?.querySelector(
        '.progress-bar',
      ) as HTMLElement;
      expect(bar.style.width).toBe('100%');
    });

    test('clamps negative value to 0%', () => {
      const el = createProgress({ value: -10 });
      const bar = el.shadowRoot?.querySelector(
        '.progress-bar',
      ) as HTMLElement;
      expect(bar.style.width).toBe('0%');
    });
  });

  // ──────────────── Color Classes ────────────────
  describe('colors', () => {
    const colors = [
      'primary',
      'secondary',
      'tertiary',
      'success',
      'warning',
      'error',
      'info',
    ] as const;

    for (const color of colors) {
      test(`applies ${color} color class`, () => {
        const el = createProgress({ color });
        const progress = el.shadowRoot?.querySelector('.progress');
        expect(progress?.classList.contains(`progress-${color}`)).toBe(true);
      });
    }
  });

  // ──────────────── Size Classes ────────────────
  describe('sizes', () => {
    test('applies sm size class', () => {
      const el = createProgress({ size: 'sm' });
      const progress = el.shadowRoot?.querySelector('.progress');
      expect(progress?.classList.contains('progress-sm')).toBe(true);
    });

    test('applies lg size class', () => {
      const el = createProgress({ size: 'lg' });
      const progress = el.shadowRoot?.querySelector('.progress');
      expect(progress?.classList.contains('progress-lg')).toBe(true);
    });

    test('md size has no extra class', () => {
      const el = createProgress({ size: 'md' });
      const progress = el.shadowRoot?.querySelector('.progress');
      expect(progress?.classList.contains('progress-sm')).toBe(false);
      expect(progress?.classList.contains('progress-lg')).toBe(false);
    });
  });

  // ──────────────── Indeterminate ────────────────
  describe('indeterminate', () => {
    test('applies indeterminate class', () => {
      const el = createProgress({ indeterminate: true });
      const progress = el.shadowRoot?.querySelector('.progress');
      expect(progress?.classList.contains('progress-indeterminate')).toBe(
        true,
      );
    });

    test('uses 50% width for indeterminate bar', () => {
      const el = createProgress({ indeterminate: true, value: 75 });
      const bar = el.shadowRoot?.querySelector(
        '.progress-bar',
      ) as HTMLElement;
      expect(bar.style.width).toBe('50%');
    });

    test('does not show value label when indeterminate', () => {
      const el = createProgress({
        indeterminate: true,
        showValue: true,
        value: 50,
      });
      expect(
        el.shadowRoot?.querySelector('.progress-value'),
      ).toBeNull();
    });
  });

  // ──────────────── Striped & Animated ────────────────
  describe('striped', () => {
    test('applies striped class', () => {
      const el = createProgress({ striped: true });
      const progress = el.shadowRoot?.querySelector('.progress');
      expect(progress?.classList.contains('progress-striped')).toBe(true);
    });

    test('applies animated class only when also striped', () => {
      const el = createProgress({ animated: true, striped: true });
      const progress = el.shadowRoot?.querySelector('.progress');
      expect(progress?.classList.contains('progress-animated')).toBe(true);
    });

    test('does not apply animated class without striped', () => {
      const el = createProgress({ animated: true });
      const progress = el.shadowRoot?.querySelector('.progress');
      expect(progress?.classList.contains('progress-animated')).toBe(false);
    });
  });

  // ──────────────── Show Value ────────────────
  describe('show-value', () => {
    test('shows value label when show-value is set', () => {
      const el = createProgress({ value: 42, showValue: true });
      const value = el.shadowRoot?.querySelector('.progress-value');
      expect(value).toBeDefined();
      expect(value?.textContent).toContain('42%');
    });

    test('does not show value label by default', () => {
      const el = createProgress({ value: 42 });
      expect(
        el.shadowRoot?.querySelector('.progress-value'),
      ).toBeNull();
    });

    test('rounds percentage in value label', () => {
      const el = createProgress({ value: 33, max: 100, showValue: true });
      const value = el.shadowRoot?.querySelector('.progress-value');
      expect(value?.textContent).toContain('33%');
    });

    test('exposes value part when shown', () => {
      const el = createProgress({ value: 50, showValue: true });
      expect(el.shadowRoot?.querySelector('[part="value"]')).toBeDefined();
    });
  });
});
