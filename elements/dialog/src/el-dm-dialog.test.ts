import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmDialog, register } from './index';

register();

// Helper to create keyboard events in happy-dom
function createKeyboardEvent(key: string): KeyboardEvent {
  const event = new Event('keydown', { bubbles: true }) as KeyboardEvent;
  Object.defineProperty(event, 'key', { value: key, writable: false });
  Object.defineProperty(event, 'preventDefault', {
    value: () => {},
    writable: false,
  });
  return event;
}

describe('ElDmDialog', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up any open dialogs that set body overflow
    document.body.style.overflow = '';
    container.remove();
  });

  function createDialog(attrs: Record<string, unknown> = {}): ElDmDialog {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'noBackdrop') {
        (el as unknown as Record<string, unknown>).noBackdrop = val;
      } else {
        (el as unknown as Record<string, unknown>)[key] = val;
      }
    }
    container.appendChild(el);
    return el;
  }

  // ──────────────── Registration ────────────────
  test('is defined', () => {
    expect(customElements.get('el-dm-dialog')).toBe(ElDmDialog);
  });

  // ──────────────── Rendering ────────────────
  describe('rendering', () => {
    test('creates a shadow root with dialog role', () => {
      const el = createDialog();
      const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
      expect(dialog).toBeDefined();
    });

    test('has aria-modal attribute', () => {
      const el = createDialog();
      const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
      expect(dialog?.getAttribute('aria-modal')).toBe('true');
    });

    test('has header, body, and footer slots', () => {
      const el = createDialog();
      expect(
        el.shadowRoot?.querySelector('slot[name="header"]'),
      ).toBeDefined();
      expect(
        el.shadowRoot?.querySelector('slot:not([name])'),
      ).toBeDefined();
      expect(
        el.shadowRoot?.querySelector('slot[name="footer"]'),
      ).toBeDefined();
    });

    test('renders wrapper element', () => {
      const el = createDialog();
      expect(
        el.shadowRoot?.querySelector('.dialog-wrapper'),
      ).toBeDefined();
    });
  });

  // ──────────────── Properties & Defaults ────────────────
  describe('properties', () => {
    test('default dismissible is true', () => {
      const el = createDialog();
      expect(el.dismissible).toBe(true);
    });

    test('reflects open to attribute', () => {
      const el = createDialog();
      el.show();
      expect(el.hasAttribute('open')).toBe(true);
      el.close();
    });

    test('reflects size to attribute', () => {
      const el = createDialog({ size: 'lg' });
      expect(el.getAttribute('size')).toBe('lg');
    });
  });

  // ──────────────── Size Classes ────────────────
  describe('sizes', () => {
    for (const size of ['sm', 'lg', 'xl', 'full'] as const) {
      test(`applies ${size} size class`, () => {
        const el = createDialog({ size });
        const dialog = el.shadowRoot?.querySelector('.dialog');
        const expectedClass =
          size === 'full' ? 'dialog-fullscreen' : `dialog-${size}`;
        expect(dialog?.classList.contains(expectedClass)).toBe(true);
      });
    }

    test('md size has no extra class', () => {
      const el = createDialog({ size: 'md' });
      const dialog = el.shadowRoot?.querySelector('.dialog');
      expect(dialog?.classList.contains('dialog-sm')).toBe(false);
      expect(dialog?.classList.contains('dialog-lg')).toBe(false);
    });
  });

  // ──────────────── Backdrop ────────────────
  describe('backdrop', () => {
    test('shows backdrop by default', () => {
      const el = createDialog();
      expect(
        el.shadowRoot?.querySelector('.dialog-backdrop'),
      ).toBeDefined();
    });

    test('hides backdrop when no-backdrop is set', () => {
      const el = createDialog({ noBackdrop: true });
      expect(
        el.shadowRoot?.querySelector('.dialog-backdrop'),
      ).toBeNull();
    });
  });

  // ──────────────── Close Button ────────────────
  describe('close button', () => {
    test('shows close button when dismissible', () => {
      const el = createDialog({ dismissible: true });
      expect(
        el.shadowRoot?.querySelector('.dialog-close'),
      ).toBeDefined();
    });

    test('does not show close button when not dismissible', () => {
      const el = createDialog({ dismissible: false });
      expect(el.shadowRoot?.querySelector('.dialog-close')).toBeNull();
    });

    test('close button has aria-label', () => {
      const el = createDialog({ dismissible: true });
      const closeBtn = el.shadowRoot?.querySelector('.dialog-close');
      expect(closeBtn?.getAttribute('aria-label')).toBe('Close');
    });

    test('clicking close button closes dialog', () => {
      const el = createDialog({ dismissible: true });
      el.show();
      const closeBtn = el.shadowRoot?.querySelector('.dialog-close');
      closeBtn?.dispatchEvent(new Event('click'));
      expect(el.open).toBe(false);
    });
  });

  // ──────────────── Show/Close/Toggle ────────────────
  describe('show/close/toggle', () => {
    test('show() sets open to true', () => {
      const el = createDialog();
      el.show();
      expect(el.open).toBe(true);
      expect(el.hasAttribute('open')).toBe(true);
      el.close();
    });

    test('close() sets open to false', () => {
      const el = createDialog();
      el.show();
      el.close();
      expect(el.open).toBe(false);
    });

    test('toggle() switches open state', () => {
      const el = createDialog();
      el.toggle();
      expect(el.open).toBe(true);
      el.toggle();
      expect(el.open).toBe(false);
    });

    test('wrapper has open class when initially open', () => {
      const el = createDialog({ open: true });
      const wrapper = el.shadowRoot?.querySelector('.dialog-wrapper');
      expect(wrapper?.classList.contains('open')).toBe(true);
      el.close();
    });

    test('close() sets open property to false', () => {
      const el = createDialog({ open: true });
      el.close();
      expect(el.open).toBe(false);
    });
  });

  // ──────────────── Events ────────────────
  describe('events', () => {
    test('show() emits open event', () => {
      const el = createDialog();
      let opened = false;
      el.addEventListener('open', () => {
        opened = true;
      });
      el.show();
      expect(opened).toBe(true);
      el.close();
    });

    test('close() emits close event', () => {
      const el = createDialog();
      el.show();
      let closed = false;
      el.addEventListener('close', () => {
        closed = true;
      });
      el.close();
      expect(closed).toBe(true);
    });
  });

  // ──────────────── Body Overflow ────────────────
  describe('body overflow', () => {
    test('show() sets body overflow to hidden', () => {
      const el = createDialog();
      el.show();
      expect(document.body.style.overflow).toBe('hidden');
      el.close();
    });

    test('close() restores body overflow', () => {
      const el = createDialog();
      el.show();
      el.close();
      expect(document.body.style.overflow).toBe('');
    });
  });

  // ──────────────── Escape Key ────────────────
  describe('escape key', () => {
    test('Escape closes dismissible dialog', () => {
      const el = createDialog({ dismissible: true });
      el.show();
      document.dispatchEvent(createKeyboardEvent('Escape'));
      expect(el.open).toBe(false);
    });

    test('Escape does not close non-dismissible dialog', () => {
      const el = createDialog({ dismissible: false });
      el.show();
      document.dispatchEvent(createKeyboardEvent('Escape'));
      expect(el.open).toBe(true);
      el.close(); // cleanup
    });
  });

  // ──────────────── Backdrop Click ────────────────
  describe('backdrop click', () => {
    test('clicking backdrop closes dismissible dialog', () => {
      const el = createDialog({ dismissible: true });
      el.show();
      const backdrop = el.shadowRoot?.querySelector('.dialog-backdrop');
      // Simulate click where target === currentTarget (click on backdrop itself)
      const event = new Event('click');
      Object.defineProperty(event, 'target', { value: backdrop });
      Object.defineProperty(event, 'currentTarget', { value: backdrop });
      backdrop?.dispatchEvent(event);
      expect(el.open).toBe(false);
    });
  });

  // ──────────────── CSS Parts ────────────────
  describe('CSS parts', () => {
    test('exposes wrapper part', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('[part="wrapper"]')).toBeDefined();
    });

    test('exposes dialog part', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('[part="dialog"]')).toBeDefined();
    });

    test('exposes header part', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('[part="header"]')).toBeDefined();
    });

    test('exposes body part', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('[part="body"]')).toBeDefined();
    });

    test('exposes footer part', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('[part="footer"]')).toBeDefined();
    });

    test('exposes backdrop part', () => {
      const el = createDialog();
      expect(
        el.shadowRoot?.querySelector('[part="backdrop"]'),
      ).toBeDefined();
    });
  });

  // ──────────────── Disconnected Callback ────────────────
  describe('cleanup', () => {
    test('disconnectedCallback restores body overflow', () => {
      const el = createDialog();
      el.show();
      expect(document.body.style.overflow).toBe('hidden');
      el.remove();
      expect(document.body.style.overflow).toBe('');
    });
  });
});
