import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmChip, register } from './index';

register();

describe('ElDmChip', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createChip(attrs: Record<string, unknown> = {}): ElDmChip {
    const el = document.createElement('el-dm-chip') as ElDmChip;
    for (const [key, val] of Object.entries(attrs)) {
      (el as unknown as Record<string, unknown>)[key] = val;
    }
    container.appendChild(el);
    return el;
  }

  // ──────────────── Registration ────────────────
  test('is defined', () => {
    expect(customElements.get('el-dm-chip')).toBe(ElDmChip);
  });

  // ──────────────── Rendering ────────────────
  describe('rendering', () => {
    test('creates a shadow root with chip', () => {
      const el = createChip();
      expect(el.shadowRoot?.querySelector('.chip')).toBeDefined();
    });

    test('has button role', () => {
      const el = createChip();
      const chip = el.shadowRoot?.querySelector('.chip');
      expect(chip?.getAttribute('role')).toBe('button');
    });

    test('has tabindex 0', () => {
      const el = createChip();
      const chip = el.shadowRoot?.querySelector('.chip');
      expect(chip?.getAttribute('tabindex')).toBe('0');
    });

    test('has icon and default slots', () => {
      const el = createChip();
      expect(el.shadowRoot?.querySelector('slot[name="icon"]')).toBeDefined();
      expect(
        el.shadowRoot?.querySelector('slot:not([name])'),
      ).toBeDefined();
    });

    test('exposes chip part', () => {
      const el = createChip();
      expect(el.shadowRoot?.querySelector('[part="chip"]')).toBeDefined();
    });

    test('exposes icon part', () => {
      const el = createChip();
      expect(el.shadowRoot?.querySelector('[part="icon"]')).toBeDefined();
    });
  });

  // ──────────────── Properties & Defaults ────────────────
  describe('properties', () => {
    test('default variant is filled', () => {
      const el = createChip();
      expect(el.variant).toBe('filled');
    });

    test('reflects variant to attribute', () => {
      const el = createChip({ variant: 'outlined' });
      expect(el.getAttribute('variant')).toBe('outlined');
    });

    test('reflects color to attribute', () => {
      const el = createChip({ color: 'error' });
      expect(el.getAttribute('color')).toBe('error');
    });

    test('reflects size to attribute', () => {
      const el = createChip({ size: 'sm' });
      expect(el.getAttribute('size')).toBe('sm');
    });

    test('reflects disabled to attribute', () => {
      const el = createChip({ disabled: true });
      expect(el.hasAttribute('disabled')).toBe(true);
    });

    test('reflects selected to attribute', () => {
      const el = createChip({ selected: true });
      expect(el.hasAttribute('selected')).toBe(true);
    });

    test('reflects deletable to attribute', () => {
      const el = createChip({ deletable: true });
      expect(el.hasAttribute('deletable')).toBe(true);
    });
  });

  // ──────────────── Variant Classes ────────────────
  describe('variants', () => {
    test('filled variant has no extra class', () => {
      const el = createChip({ variant: 'filled' });
      const chip = el.shadowRoot?.querySelector('.chip');
      expect(chip?.classList.contains('chip-outlined')).toBe(false);
      expect(chip?.classList.contains('chip-soft')).toBe(false);
    });

    test('applies outlined variant class', () => {
      const el = createChip({ variant: 'outlined' });
      const chip = el.shadowRoot?.querySelector('.chip');
      expect(chip?.classList.contains('chip-outlined')).toBe(true);
    });

    test('applies soft variant class', () => {
      const el = createChip({ variant: 'soft' });
      const chip = el.shadowRoot?.querySelector('.chip');
      expect(chip?.classList.contains('chip-soft')).toBe(true);
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
        const el = createChip({ color });
        const chip = el.shadowRoot?.querySelector('.chip');
        expect(chip?.classList.contains(`chip-${color}`)).toBe(true);
      });
    }
  });

  // ──────────────── Size Classes ────────────────
  describe('sizes', () => {
    test('applies sm size class', () => {
      const el = createChip({ size: 'sm' });
      const chip = el.shadowRoot?.querySelector('.chip');
      expect(chip?.classList.contains('chip-sm')).toBe(true);
    });

    test('applies lg size class', () => {
      const el = createChip({ size: 'lg' });
      const chip = el.shadowRoot?.querySelector('.chip');
      expect(chip?.classList.contains('chip-lg')).toBe(true);
    });

    test('md size has no extra class', () => {
      const el = createChip({ size: 'md' });
      const chip = el.shadowRoot?.querySelector('.chip');
      expect(chip?.classList.contains('chip-sm')).toBe(false);
      expect(chip?.classList.contains('chip-lg')).toBe(false);
    });
  });

  // ──────────────── Selected ────────────────
  describe('selected', () => {
    test('applies selected class', () => {
      const el = createChip({ selected: true });
      const chip = el.shadowRoot?.querySelector('.chip');
      expect(chip?.classList.contains('chip-selected')).toBe(true);
    });

    test('does not apply selected class by default', () => {
      const el = createChip();
      const chip = el.shadowRoot?.querySelector('.chip');
      expect(chip?.classList.contains('chip-selected')).toBe(false);
    });
  });

  // ──────────────── Deletable ────────────────
  describe('deletable', () => {
    test('shows delete button when deletable', () => {
      const el = createChip({ deletable: true });
      expect(
        el.shadowRoot?.querySelector('.chip-delete'),
      ).toBeDefined();
    });

    test('does not show delete button by default', () => {
      const el = createChip();
      expect(el.shadowRoot?.querySelector('.chip-delete')).toBeNull();
    });

    test('exposes delete part when deletable', () => {
      const el = createChip({ deletable: true });
      expect(
        el.shadowRoot?.querySelector('[part="delete"]'),
      ).toBeDefined();
    });

    test('delete button contains SVG icon', () => {
      const el = createChip({ deletable: true });
      const deleteBtn = el.shadowRoot?.querySelector('.chip-delete');
      expect(deleteBtn?.querySelector('svg')).toBeDefined();
    });
  });

  // ──────────────── Click Events ────────────────
  describe('click events', () => {
    test('emits click event on chip click', () => {
      const el = createChip();
      let clicked = false;
      el.addEventListener('click', () => {
        clicked = true;
      });
      const chip = el.shadowRoot?.querySelector('.chip');
      chip?.dispatchEvent(new Event('click'));
      expect(clicked).toBe(true);
    });

    test('does not emit click event when disabled', () => {
      const el = createChip({ disabled: true });
      let clicked = false;
      el.addEventListener('click', () => {
        clicked = true;
      });
      const chip = el.shadowRoot?.querySelector('.chip');
      chip?.dispatchEvent(new Event('click'));
      expect(clicked).toBe(false);
    });
  });

  // ──────────────── Delete Events ────────────────
  describe('delete events', () => {
    test('emits delete event on delete button click', () => {
      const el = createChip({ deletable: true });
      let deleted = false;
      el.addEventListener('delete', () => {
        deleted = true;
      });
      const deleteBtn = el.shadowRoot?.querySelector('.chip-delete');
      deleteBtn?.dispatchEvent(new Event('click', { bubbles: true }));
      expect(deleted).toBe(true);
    });

    test('does not emit delete event when disabled', () => {
      const el = createChip({ deletable: true, disabled: true });
      let deleted = false;
      el.addEventListener('delete', () => {
        deleted = true;
      });
      const deleteBtn = el.shadowRoot?.querySelector('.chip-delete');
      deleteBtn?.dispatchEvent(new Event('click', { bubbles: true }));
      expect(deleted).toBe(false);
    });
  });

  // ──────────────── Disabled State ────────────────
  describe('disabled state', () => {
    test('reflects disabled attribute', () => {
      const el = createChip({ disabled: true });
      expect(el.hasAttribute('disabled')).toBe(true);
    });

    test('blocks click events', () => {
      const el = createChip({ disabled: true });
      let clicked = false;
      el.addEventListener('click', () => {
        clicked = true;
      });
      el.shadowRoot
        ?.querySelector('.chip')
        ?.dispatchEvent(new Event('click'));
      expect(clicked).toBe(false);
    });
  });

  // ──────────────── Combined Classes ────────────────
  test('combines variant, color, size, and selected correctly', () => {
    const el = createChip({
      variant: 'outlined',
      color: 'success',
      size: 'lg',
      selected: true,
    });
    const chip = el.shadowRoot?.querySelector('.chip');
    expect(chip?.classList.contains('chip-outlined')).toBe(true);
    expect(chip?.classList.contains('chip-success')).toBe(true);
    expect(chip?.classList.contains('chip-lg')).toBe(true);
    expect(chip?.classList.contains('chip-selected')).toBe(true);
  });
});
