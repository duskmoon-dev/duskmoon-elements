import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmAlert, register } from './index';

register();

describe('ElDmAlert', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createAlert(attrs: Record<string, unknown> = {}): ElDmAlert {
    const el = document.createElement('el-dm-alert') as ElDmAlert;
    for (const [key, val] of Object.entries(attrs)) {
      (el as unknown as Record<string, unknown>)[key] = val;
    }
    container.appendChild(el);
    return el;
  }

  // ──────────────── Registration ────────────────
  test('is defined', () => {
    expect(customElements.get('el-dm-alert')).toBe(ElDmAlert);
  });

  // ──────────────── Rendering ────────────────
  describe('rendering', () => {
    test('creates a shadow root with alert role', () => {
      const el = createAlert();
      const alert = el.shadowRoot?.querySelector('[role="alert"]');
      expect(alert).toBeDefined();
    });

    test('renders icon, content, and actions sections', () => {
      const el = createAlert();
      expect(el.shadowRoot?.querySelector('.alert-icon')).toBeDefined();
      expect(el.shadowRoot?.querySelector('.alert-content')).toBeDefined();
      expect(el.shadowRoot?.querySelector('.alert-description')).toBeDefined();
      expect(el.shadowRoot?.querySelector('.alert-actions')).toBeDefined();
    });

    test('has icon, default, and actions slots', () => {
      const el = createAlert();
      expect(el.shadowRoot?.querySelector('slot[name="icon"]')).toBeDefined();
      expect(
        el.shadowRoot?.querySelector('slot:not([name])'),
      ).toBeDefined();
      expect(
        el.shadowRoot?.querySelector('slot[name="actions"]'),
      ).toBeDefined();
    });

    test('exposes alert part', () => {
      const el = createAlert();
      expect(el.shadowRoot?.querySelector('[part="alert"]')).toBeDefined();
    });
  });

  // ──────────────── Properties & Defaults ────────────────
  describe('properties', () => {
    test('default type is info', () => {
      const el = createAlert();
      expect(el.type).toBe('info');
    });

    test('reflects type to attribute', () => {
      const el = createAlert({ type: 'error' });
      expect(el.getAttribute('type')).toBe('error');
    });

    test('reflects variant to attribute', () => {
      const el = createAlert({ variant: 'outlined' });
      expect(el.getAttribute('variant')).toBe('outlined');
    });

    test('reflects dismissible to attribute', () => {
      const el = createAlert({ dismissible: true });
      expect(el.hasAttribute('dismissible')).toBe(true);
    });

    test('reflects compact to attribute', () => {
      const el = createAlert({ compact: true });
      expect(el.hasAttribute('compact')).toBe(true);
    });

    test('reflects title to attribute', () => {
      const el = createAlert({ title: 'Warning!' });
      expect(el.getAttribute('title')).toBe('Warning!');
    });
  });

  // ──────────────── Type Classes ────────────────
  describe('types', () => {
    for (const type of ['info', 'success', 'warning', 'error'] as const) {
      test(`applies ${type} type class`, () => {
        const el = createAlert({ type });
        const alert = el.shadowRoot?.querySelector('.alert');
        expect(alert?.classList.contains(`alert-${type}`)).toBe(true);
      });
    }
  });

  // ──────────────── Variant Classes ────────────────
  describe('variants', () => {
    test('applies filled variant class', () => {
      const el = createAlert({ variant: 'filled' });
      const alert = el.shadowRoot?.querySelector('.alert');
      expect(alert?.classList.contains('alert-filled')).toBe(true);
    });

    test('applies outlined variant class', () => {
      const el = createAlert({ variant: 'outlined' });
      const alert = el.shadowRoot?.querySelector('.alert');
      expect(alert?.classList.contains('alert-outlined')).toBe(true);
    });
  });

  // ──────────────── Compact ────────────────
  test('applies compact class', () => {
    const el = createAlert({ compact: true });
    const alert = el.shadowRoot?.querySelector('.alert');
    expect(alert?.classList.contains('alert-compact')).toBe(true);
  });

  test('does not apply compact class by default', () => {
    const el = createAlert();
    const alert = el.shadowRoot?.querySelector('.alert');
    expect(alert?.classList.contains('alert-compact')).toBe(false);
  });

  // ──────────────── Title ────────────────
  describe('title', () => {
    test('renders title when provided', () => {
      const el = createAlert({ title: 'Alert Title' });
      const title = el.shadowRoot?.querySelector('.alert-title');
      expect(title).toBeDefined();
      expect(title?.textContent).toContain('Alert Title');
    });

    test('does not render title when not provided', () => {
      const el = createAlert();
      const title = el.shadowRoot?.querySelector('.alert-title');
      expect(title).toBeNull();
    });
  });

  // ──────────────── Default Icons ────────────────
  describe('default icons', () => {
    const expectedIcons: Record<string, string> = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✕',
    };

    for (const [type, icon] of Object.entries(expectedIcons)) {
      test(`renders ${icon} icon for ${type} type`, () => {
        const el = createAlert({ type });
        const iconEl = el.shadowRoot?.querySelector('.alert-icon');
        expect(iconEl?.textContent).toContain(icon);
      });
    }
  });

  // ──────────────── Dismissible ────────────────
  describe('dismissible', () => {
    test('shows close button when dismissible', () => {
      const el = createAlert({ dismissible: true });
      const closeBtn = el.shadowRoot?.querySelector('.alert-close');
      expect(closeBtn).toBeDefined();
    });

    test('does not show close button when not dismissible', () => {
      const el = createAlert();
      const closeBtn = el.shadowRoot?.querySelector('.alert-close');
      expect(closeBtn).toBeNull();
    });

    test('adds dismissible class when dismissible', () => {
      const el = createAlert({ dismissible: true });
      const alert = el.shadowRoot?.querySelector('.alert');
      expect(alert?.classList.contains('alert-dismissible')).toBe(true);
    });

    test('close button has aria-label', () => {
      const el = createAlert({ dismissible: true });
      const closeBtn = el.shadowRoot?.querySelector('.alert-close');
      expect(closeBtn?.getAttribute('aria-label')).toBe('Dismiss');
    });

    test('clicking close emits dismiss event', () => {
      const el = createAlert({ dismissible: true });
      let dismissed = false;
      el.addEventListener('dismiss', () => {
        dismissed = true;
      });
      const closeBtn = el.shadowRoot?.querySelector('.alert-close');
      closeBtn?.dispatchEvent(new Event('click'));
      expect(dismissed).toBe(true);
    });

    test('clicking close removes element from DOM', () => {
      const el = createAlert({ dismissible: true });
      expect(container.contains(el)).toBe(true);
      const closeBtn = el.shadowRoot?.querySelector('.alert-close');
      closeBtn?.dispatchEvent(new Event('click'));
      expect(container.contains(el)).toBe(false);
    });
  });

  // ──────────────── CSS Parts ────────────────
  describe('CSS parts', () => {
    test('exposes icon part', () => {
      const el = createAlert();
      expect(el.shadowRoot?.querySelector('[part="icon"]')).toBeDefined();
    });

    test('exposes content part', () => {
      const el = createAlert();
      expect(el.shadowRoot?.querySelector('[part="content"]')).toBeDefined();
    });

    test('exposes close part when dismissible', () => {
      const el = createAlert({ dismissible: true });
      expect(el.shadowRoot?.querySelector('[part="close"]')).toBeDefined();
    });
  });
});
