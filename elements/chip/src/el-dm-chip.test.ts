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

  function dispatchSlottedClick(
    el: ElDmChip,
    slottedContent: HTMLElement,
    controlSelector: string,
    slotSelector = 'slot:not([name])',
  ): MouseEvent {
    const click = new window.MouseEvent('click', {
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    const slot = el.shadowRoot?.querySelector(slotSelector);
    const control = el.shadowRoot?.querySelector(controlSelector);
    if (!slot || !control) throw new Error('Expected slotted chip control');

    // happy-dom does not route light-DOM events through assigned shadow slots.
    // Model Chromium's composed path so the delegation contract stays covered.
    Object.defineProperty(click, 'composedPath', {
      value: () => [slottedContent, slot, control, el.shadowRoot, el, document, window],
    });
    slot.dispatchEvent(click);
    return click;
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

    test('does not make display chips interactive', () => {
      const el = createChip();
      const chip = el.shadowRoot?.querySelector('.chip');
      expect(chip?.tagName).toBe('SPAN');
      expect(chip?.hasAttribute('role')).toBe(false);
      expect(chip?.hasAttribute('tabindex')).toBe(false);
    });

    test('has icon and default slots', () => {
      const el = createChip();
      expect(el.shadowRoot?.querySelector('slot[name="icon"]')).toBeDefined();
      expect(el.shadowRoot?.querySelector('slot:not([name])')).toBeDefined();
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

    test('reflects semantic mode properties', () => {
      const el = createChip({
        href: '/filters/active',
        target: '_blank',
        rel: 'noopener',
        clickable: true,
        selectable: true,
        deleteLabel: 'Remove filter',
      });

      expect(el.getAttribute('href')).toBe('/filters/active');
      expect(el.getAttribute('target')).toBe('_blank');
      expect(el.getAttribute('rel')).toBe('noopener');
      expect(el.hasAttribute('clickable')).toBe(true);
      expect(el.hasAttribute('selectable')).toBe(true);
      expect(el.getAttribute('delete-label')).toBe('Remove filter');
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
      const deleteButton = el.shadowRoot?.querySelector('.chip-delete');

      expect(deleteButton).toBeDefined();
      expect(deleteButton?.getAttribute('aria-label')).toBe('Remove chip');
    });

    test('does not show delete button by default', () => {
      const el = createChip();
      expect(el.shadowRoot?.querySelector('.chip-delete')).toBeNull();
    });

    test('exposes delete part when deletable', () => {
      const el = createChip({ deletable: true });
      expect(el.shadowRoot?.querySelector('[part="delete"]')).toBeDefined();
    });

    test('delete button contains SVG icon', () => {
      const el = createChip({ deletable: true });
      const deleteBtn = el.shadowRoot?.querySelector('.chip-delete');
      expect(deleteBtn?.querySelector('svg')).toBeDefined();
    });
  });

  // ──────────────── Click Events ────────────────
  describe('click events', () => {
    test('keeps the native click and emits dm-click once for an action chip', () => {
      const el = createChip({ clickable: true });
      let clicks = 0;
      let dmClicks = 0;
      el.addEventListener('click', () => {
        clicks += 1;
      });
      el.addEventListener('dm-click', (event) => {
        dmClicks += 1;
        expect(event.bubbles).toBe(true);
        expect(event.composed).toBe(true);
        expect(event.cancelable).toBe(true);
      });

      el.shadowRoot?.querySelector<HTMLButtonElement>('button.chip')?.click();

      expect(clicks).toBe(1);
      expect(dmClicks).toBe(1);
    });

    test('does not emit click events when an action chip is disabled', () => {
      const el = createChip({ clickable: true, disabled: true });
      let clicks = 0;
      let dmClicks = 0;
      el.addEventListener('click', () => {
        clicks += 1;
      });
      el.addEventListener('dm-click', () => {
        dmClicks += 1;
      });

      const button = el.shadowRoot?.querySelector<HTMLButtonElement>('button.chip');
      expect(button?.disabled).toBe(true);
      button?.click();

      expect(clicks).toBe(0);
      expect(dmClicks).toBe(0);
    });
  });

  // ──────────────── Delete Events ────────────────
  describe('delete events', () => {
    test('emits dm-delete and the legacy delete alias once', () => {
      const el = createChip({ deletable: true });
      let dmDeleted = 0;
      let deleted = 0;
      let clicked = 0;
      el.addEventListener('dm-delete', (event) => {
        dmDeleted += 1;
        expect(event.bubbles).toBe(true);
        expect(event.composed).toBe(true);
        expect(event.cancelable).toBe(true);
      });
      el.addEventListener('delete', () => {
        deleted += 1;
      });
      el.addEventListener('click', () => {
        clicked += 1;
      });

      el.shadowRoot?.querySelector<HTMLButtonElement>('.chip-delete')?.click();

      expect(dmDeleted).toBe(1);
      expect(deleted).toBe(1);
      expect(clicked).toBe(0);
    });

    test('does not emit delete event when disabled', () => {
      const el = createChip({ deletable: true, disabled: true });
      let dmDeleted = 0;
      let deleted = 0;
      el.addEventListener('dm-delete', () => {
        dmDeleted += 1;
      });
      el.addEventListener('delete', () => {
        deleted += 1;
      });

      const deleteButton = el.shadowRoot?.querySelector<HTMLButtonElement>('.chip-delete');
      expect(deleteButton?.disabled).toBe(true);
      deleteButton?.click();

      expect(dmDeleted).toBe(0);
      expect(deleted).toBe(0);
    });
  });

  // ──────────────── Disabled State ────────────────
  describe('disabled state', () => {
    test('reflects disabled attribute', () => {
      const el = createChip({ disabled: true });
      expect(el.hasAttribute('disabled')).toBe(true);
    });

    test('renders a disabled link without a focusable anchor', () => {
      const el = createChip({ href: '/filters', disabled: true });
      const chip = el.shadowRoot?.querySelector('.chip');

      expect(chip?.tagName).toBe('SPAN');
      expect(chip?.getAttribute('aria-disabled')).toBe('true');
      expect(el.shadowRoot?.querySelector('a')).toBeNull();
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

  // Accessibility regression coverage for https://github.com/duskmoon-dev/duskmoon-elements/issues/74
  describe('semantic modes', () => {
    test('renders href as a native anchor', () => {
      const el = createChip({ href: '/filters/active', target: '_blank', rel: 'noopener' });
      const link = el.shadowRoot?.querySelector('a.chip');

      expect(link?.getAttribute('href')).toBe('/filters/active');
      expect(link?.getAttribute('target')).toBe('_blank');
      expect(link?.getAttribute('rel')).toBe('noopener');
      expect(link?.classList.contains('chip-clickable')).toBe(true);
      expect(link?.querySelector('a, button')).toBeNull();
    });

    test('emits dm-click when a link is activated', () => {
      const el = createChip({ href: '#filters' });
      let dmClicks = 0;
      el.addEventListener('dm-click', () => {
        dmClicks += 1;
      });

      el.shadowRoot?.querySelector<HTMLAnchorElement>('a.chip')?.click();

      expect(dmClicks).toBe(1);
    });

    test('handles a cancelable link click from slotted label content', () => {
      const el = createChip({ href: '#filters' });
      const label = document.createElement('span');
      label.textContent = 'Filters';
      el.appendChild(label);
      let dmClicks = 0;
      el.addEventListener('dm-click', (event) => {
        dmClicks += 1;
        event.preventDefault();
      });
      const click = dispatchSlottedClick(el, label, 'a.chip');

      expect(dmClicks).toBe(1);
      expect(click.defaultPrevented).toBe(true);
    });

    test('escapes link attributes without injecting markup', () => {
      const hostile = '"><img src=x onerror=alert(1)>';
      const el = createChip({ href: hostile, target: hostile, rel: hostile });
      const link = el.shadowRoot?.querySelector('a.chip');

      expect(link?.getAttribute('href')).toBe(hostile);
      expect(link?.getAttribute('target')).toBe(hostile);
      expect(link?.getAttribute('rel')).toBe(hostile);
      expect(el.shadowRoot?.querySelector('img')).toBeNull();
    });

    test('renders clickable as a native action button', () => {
      const el = createChip({ clickable: true });
      const button = el.shadowRoot?.querySelector('button.chip');

      expect(button?.getAttribute('type')).toBe('button');
      expect(button?.hasAttribute('aria-pressed')).toBe(false);
      expect(button?.querySelector('a, button')).toBeNull();
    });

    test('emits dm-click from slotted clickable content', () => {
      const el = createChip({ clickable: true });
      const label = document.createElement('span');
      label.textContent = 'Run action';
      el.appendChild(label);
      let dmClicks = 0;
      el.addEventListener('dm-click', () => {
        dmClicks += 1;
      });

      dispatchSlottedClick(el, label, 'button.chip');

      expect(dmClicks).toBe(1);
    });

    test('toggles a selectable button and emits one dm-change event', async () => {
      const el = createChip({ selectable: true });
      const button = el.shadowRoot?.querySelector('button.chip');
      let changes = 0;
      let detail: { selected: boolean } | undefined;
      el.addEventListener('dm-change', (event) => {
        changes += 1;
        detail = (event as CustomEvent<{ selected: boolean }>).detail;
        expect(event.bubbles).toBe(true);
        expect(event.composed).toBe(true);
      });

      expect(button?.getAttribute('type')).toBe('button');
      expect(button?.getAttribute('aria-pressed')).toBe('false');

      (button as HTMLButtonElement | null)?.focus();
      (button as HTMLButtonElement | null)?.click();
      await Promise.resolve();

      expect(el.selected).toBe(true);
      const updatedButton = el.shadowRoot?.querySelector('button.chip');
      expect(updatedButton?.getAttribute('aria-pressed')).toBe('true');
      expect(el.shadowRoot?.activeElement).toBe(updatedButton);
      expect(detail).toEqual({ selected: true });
      expect(changes).toBe(1);
    });

    test('does not toggle or emit from a disabled selectable button', () => {
      const el = createChip({ selectable: true, disabled: true });
      let changes = 0;
      el.addEventListener('dm-change', () => {
        changes += 1;
      });

      const button = el.shadowRoot?.querySelector<HTMLButtonElement>('button.chip');
      expect(button?.disabled).toBe(true);
      button?.click();

      expect(el.hasAttribute('selected')).toBe(false);
      expect(changes).toBe(0);
    });

    test('toggles selection from slotted icon content', async () => {
      const el = createChip({ selectable: true });
      const icon = document.createElement('span');
      icon.slot = 'icon';
      icon.textContent = '✓';
      el.appendChild(icon);
      let changes = 0;
      el.addEventListener('dm-change', () => {
        changes += 1;
      });

      dispatchSlottedClick(el, icon, 'button.chip', 'slot[name="icon"]');
      await Promise.resolve();

      expect(el.selected).toBe(true);
      expect(changes).toBe(1);
    });

    test('renders deletable with a native custom-labeled delete button', () => {
      const hostileLabel = 'Remove "<img src=x>';
      const el = createChip({ deletable: true, deleteLabel: hostileLabel });
      const chip = el.shadowRoot?.querySelector('.chip');
      const button = el.shadowRoot?.querySelector('button.chip-delete');

      expect(chip?.tagName).toBe('SPAN');
      expect(chip?.hasAttribute('role')).toBe(false);
      expect(button?.getAttribute('type')).toBe('button');
      expect(button?.getAttribute('aria-label')).toBe(hostileLabel);
      expect(button?.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
      expect(el.shadowRoot?.querySelector('img')).toBeNull();
    });

    test('uses deletable before link, selectable, and clickable modes', () => {
      const el = createChip({
        deletable: true,
        href: '/filters',
        selectable: true,
        clickable: true,
      });

      expect(el.shadowRoot?.querySelector('.chip')?.tagName).toBe('SPAN');
      expect(el.shadowRoot?.querySelector('a')).toBeNull();
      expect(el.shadowRoot?.querySelector('button.chip')).toBeNull();
      expect(el.shadowRoot?.querySelectorAll('button')).toHaveLength(1);
    });

    test('does not activate lower-precedence modes from a deletable label click', () => {
      const el = createChip({
        deletable: true,
        href: '#filters',
        selectable: true,
        clickable: true,
      });
      let dmClicks = 0;
      let changes = 0;
      el.addEventListener('dm-click', () => {
        dmClicks += 1;
      });
      el.addEventListener('dm-change', () => {
        changes += 1;
      });

      el.shadowRoot?.querySelector<HTMLElement>('.chip')?.click();

      expect(dmClicks).toBe(0);
      expect(changes).toBe(0);
      expect(el.hasAttribute('selected')).toBe(false);
    });

    test('uses link before selectable and clickable modes', () => {
      const el = createChip({ href: '/filters', selectable: true, clickable: true });

      expect(el.shadowRoot?.querySelector('a.chip')).toBeDefined();
      expect(el.shadowRoot?.querySelector('button')).toBeNull();
    });

    test('preserves an explicit host role without duplicating it in shadow DOM', () => {
      const el = document.createElement('el-dm-chip') as ElDmChip;
      el.setAttribute('role', 'option');
      el.setAttribute('aria-selected', 'false');
      container.appendChild(el);

      expect(el.getAttribute('role')).toBe('option');
      expect(el.getAttribute('aria-selected')).toBe('false');
      expect(el.shadowRoot?.querySelector('[role]')).toBeNull();
    });

    test('does not duplicate dm-click listeners across rerenders', async () => {
      const el = createChip({ clickable: true });
      let clicks = 0;
      el.addEventListener('dm-click', () => {
        clicks += 1;
      });

      el.color = 'primary';
      await Promise.resolve();
      el.color = 'success';
      await Promise.resolve();
      el.shadowRoot?.querySelector<HTMLButtonElement>('button.chip')?.click();

      expect(clicks).toBe(1);
    });
  });
});
