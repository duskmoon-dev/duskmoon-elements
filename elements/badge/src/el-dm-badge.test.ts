import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmBadge, register } from './index';

register();

describe('ElDmBadge', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createBadge(attrs: Record<string, unknown> = {}): ElDmBadge {
    const el = document.createElement('el-dm-badge') as ElDmBadge;
    for (const [key, val] of Object.entries(attrs)) {
      (el as unknown as Record<string, unknown>)[key] = val;
    }
    container.appendChild(el);
    return el;
  }

  // ──────────────── Registration ────────────────
  test('is defined', () => {
    expect(customElements.get('el-dm-badge')).toBe(ElDmBadge);
  });

  // ──────────────── Rendering ────────────────
  describe('rendering', () => {
    test('creates a shadow root with badge', () => {
      const el = createBadge();
      expect(el.shadowRoot?.querySelector('.badge')).toBeDefined();
    });

    test('exposes badge part', () => {
      const el = createBadge();
      expect(el.shadowRoot?.querySelector('[part="badge"]')).toBeDefined();
    });

    test('badge is a span element', () => {
      const el = createBadge();
      const badge = el.shadowRoot?.querySelector('.badge');
      expect(badge?.tagName.toLowerCase()).toBe('span');
    });
  });

  // ──────────────── Properties & Defaults ────────────────
  describe('properties', () => {
    test('default variant is filled', () => {
      const el = createBadge();
      expect(el.variant).toBe('filled');
    });

    test('default color is primary', () => {
      const el = createBadge();
      expect(el.color).toBe('primary');
    });

    test('reflects variant to attribute', () => {
      const el = createBadge({ variant: 'outlined' });
      expect(el.getAttribute('variant')).toBe('outlined');
    });

    test('reflects color to attribute', () => {
      const el = createBadge({ color: 'error' });
      expect(el.getAttribute('color')).toBe('error');
    });

    test('reflects size to attribute', () => {
      const el = createBadge({ size: 'lg' });
      expect(el.getAttribute('size')).toBe('lg');
    });

    test('reflects pill to attribute', () => {
      const el = createBadge({ pill: true });
      expect(el.hasAttribute('pill')).toBe(true);
    });

    test('reflects dot to attribute', () => {
      const el = createBadge({ dot: true });
      expect(el.hasAttribute('dot')).toBe(true);
    });
  });

  // ──────────────── Variant Classes ────────────────
  describe('variants', () => {
    test('filled variant has no extra class', () => {
      const el = createBadge({ variant: 'filled' });
      const badge = el.shadowRoot?.querySelector('.badge');
      expect(badge?.classList.contains('badge-outlined')).toBe(false);
      expect(badge?.classList.contains('badge-soft')).toBe(false);
    });

    test('applies outlined variant class', () => {
      const el = createBadge({ variant: 'outlined' });
      const badge = el.shadowRoot?.querySelector('.badge');
      expect(badge?.classList.contains('badge-outlined')).toBe(true);
    });

    test('applies soft variant class', () => {
      const el = createBadge({ variant: 'soft' });
      const badge = el.shadowRoot?.querySelector('.badge');
      expect(badge?.classList.contains('badge-soft')).toBe(true);
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
        const el = createBadge({ color });
        const badge = el.shadowRoot?.querySelector('.badge');
        expect(badge?.classList.contains(`badge-${color}`)).toBe(true);
      });
    }
  });

  // ──────────────── Size Classes ────────────────
  describe('sizes', () => {
    test('applies sm size class', () => {
      const el = createBadge({ size: 'sm' });
      const badge = el.shadowRoot?.querySelector('.badge');
      expect(badge?.classList.contains('badge-sm')).toBe(true);
    });

    test('applies lg size class', () => {
      const el = createBadge({ size: 'lg' });
      const badge = el.shadowRoot?.querySelector('.badge');
      expect(badge?.classList.contains('badge-lg')).toBe(true);
    });

    test('md size has no extra class', () => {
      const el = createBadge({ size: 'md' });
      const badge = el.shadowRoot?.querySelector('.badge');
      expect(badge?.classList.contains('badge-sm')).toBe(false);
      expect(badge?.classList.contains('badge-lg')).toBe(false);
    });
  });

  // ──────────────── Pill ────────────────
  test('applies pill class', () => {
    const el = createBadge({ pill: true });
    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('badge-pill')).toBe(true);
  });

  test('does not apply pill class by default', () => {
    const el = createBadge();
    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('badge-pill')).toBe(false);
  });

  // ──────────────── Dot Mode ────────────────
  describe('dot mode', () => {
    test('applies dot class', () => {
      const el = createBadge({ dot: true });
      const badge = el.shadowRoot?.querySelector('.badge');
      expect(badge?.classList.contains('badge-dot')).toBe(true);
    });

    test('hides slot content when dot', () => {
      const el = createBadge({ dot: true });
      const slot = el.shadowRoot?.querySelector('slot');
      expect(slot).toBeNull();
    });

    test('shows slot content when not dot', () => {
      const el = createBadge();
      const slot = el.shadowRoot?.querySelector('slot');
      expect(slot).toBeDefined();
    });
  });

  // ──────────────── Combined Classes ────────────────
  test('combines multiple classes correctly', () => {
    const el = createBadge({
      variant: 'soft',
      color: 'warning',
      size: 'lg',
      pill: true,
      dot: true,
    });
    const badge = el.shadowRoot?.querySelector('.badge');
    expect(badge?.classList.contains('badge-soft')).toBe(true);
    expect(badge?.classList.contains('badge-warning')).toBe(true);
    expect(badge?.classList.contains('badge-lg')).toBe(true);
    expect(badge?.classList.contains('badge-pill')).toBe(true);
    expect(badge?.classList.contains('badge-dot')).toBe(true);
  });
});
