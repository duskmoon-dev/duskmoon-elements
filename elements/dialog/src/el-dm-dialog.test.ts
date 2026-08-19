import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import { ElDmDialog, register } from './index';

register();

async function nextUpdate(): Promise<void> {
  await new Promise<void>((resolve) => {
    queueMicrotask(resolve);
  });
}

function createCommandEvent(command: string): Event {
  const event = new Event('command', { bubbles: true, composed: true });
  Object.defineProperty(event, 'command', { value: command });
  return event;
}

function spyDialogOpeners(): {
  counts: { show: number; showModal: number };
  restore: () => void;
} {
  const origShow = HTMLDialogElement.prototype.show;
  const origShowModal = HTMLDialogElement.prototype.showModal;
  const counts = { show: 0, showModal: 0 };

  HTMLDialogElement.prototype.show = function show(this: HTMLDialogElement) {
    counts.show += 1;
    return origShow.call(this);
  };
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    counts.showModal += 1;
    return origShowModal.call(this);
  };

  return {
    counts,
    restore() {
      HTMLDialogElement.prototype.show = origShow;
      HTMLDialogElement.prototype.showModal = origShowModal;
    },
  };
}

describe('ElDmDialog', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function createDialog(attrs: Record<string, unknown> = {}): ElDmDialog {
    const el = document.createElement('el-dm-dialog') as ElDmDialog;
    for (const [key, val] of Object.entries(attrs)) {
      (el as unknown as Record<string, unknown>)[key] = val;
    }
    container.appendChild(el);
    return el;
  }

  function nativeDialog(el: ElDmDialog): HTMLDialogElement | null {
    return el.shadowRoot?.querySelector('dialog') ?? null;
  }

  test('is defined', () => {
    expect(customElements.get('el-dm-dialog')).toBe(ElDmDialog);
  });

  describe('rendering', () => {
    test('creates a native dialog with dialog class', () => {
      const el = createDialog();
      const dialog = nativeDialog(el);
      expect(dialog).toBeDefined();
      expect(dialog).toBeInstanceOf(HTMLDialogElement);
      expect(dialog?.classList.contains('dialog')).toBe(true);
    });

    test('renders duskmoonui dialog structure', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('.dialog-box')).toBeDefined();
      expect(el.shadowRoot?.querySelector('.dialog-header')).toBeDefined();
      expect(el.shadowRoot?.querySelector('.dialog-title')).toBeDefined();
      expect(el.shadowRoot?.querySelector('.dialog-body')).toBeDefined();
      expect(el.shadowRoot?.querySelector('.dialog-footer')).toBeDefined();
    });

    test('has header, body, and footer slots', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('slot[name="header"]')).toBeDefined();
      expect(el.shadowRoot?.querySelector('slot:not([name])')).toBeDefined();
      expect(el.shadowRoot?.querySelector('slot[name="footer"]')).toBeDefined();
    });

    test('does not render a custom backdrop overlay', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('.dialog-backdrop')).toBeNull();
      expect(el.shadowRoot?.querySelector('.dialog-wrapper')).toBeNull();
    });
  });

  describe('properties', () => {
    test('default dismissible is true', () => {
      const el = createDialog();
      expect(el.dismissible).toBe(true);
    });

    test('reflects open to attribute', async () => {
      const el = createDialog();
      el.show();
      await nextUpdate();
      expect(el.hasAttribute('open')).toBe(true);
      el.close();
      await nextUpdate();
    });

    test('reflects size to attribute', () => {
      const el = createDialog({ size: 'lg' });
      expect(el.getAttribute('size')).toBe('lg');
    });
  });

  describe('sizes', () => {
    for (const size of ['sm', 'lg', 'xl', 'full'] as const) {
      test(`applies ${size} size class`, () => {
        const el = createDialog({ size });
        const dialog = nativeDialog(el);
        const expectedClass = size === 'full' ? 'dialog-fullscreen' : `dialog-${size}`;
        expect(dialog?.classList.contains(expectedClass)).toBe(true);
      });
    }

    test('md size has no extra class', () => {
      const el = createDialog({ size: 'md' });
      const dialog = nativeDialog(el);
      expect(dialog?.classList.contains('dialog-sm')).toBe(false);
      expect(dialog?.classList.contains('dialog-lg')).toBe(false);
    });
  });

  describe('close button', () => {
    test('shows close button when dismissible', () => {
      const el = createDialog({ dismissible: true });
      expect(el.shadowRoot?.querySelector('.dialog-close')).toBeDefined();
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

    test('clicking close button closes dialog', async () => {
      const el = createDialog({ dismissible: true });
      el.show();
      await nextUpdate();
      const closeBtn = el.shadowRoot?.querySelector('.dialog-close');
      closeBtn?.dispatchEvent(new Event('click'));
      await nextUpdate();
      expect(el.open).toBe(false);
    });
  });

  describe('show/close/toggle', () => {
    test('show() sets open and calls showModal()', async () => {
      const spy = spyDialogOpeners();
      const el = createDialog();
      el.show();
      await nextUpdate();
      const dialog = nativeDialog(el);
      expect(el.open).toBe(true);
      expect(el.hasAttribute('open')).toBe(true);
      expect(dialog?.open).toBe(true);
      expect(spy.counts.showModal).toBe(1);
      expect(spy.counts.show).toBe(0);
      el.close();
      await nextUpdate();
      spy.restore();
    });

    test('showModal() is an alias for show()', async () => {
      const el = createDialog();
      el.showModal();
      await nextUpdate();
      expect(el.open).toBe(true);
      expect(nativeDialog(el)?.open).toBe(true);
      el.close();
      await nextUpdate();
    });

    test('no-backdrop uses show() instead of showModal()', async () => {
      const spy = spyDialogOpeners();
      const el = createDialog({ noBackdrop: true });
      el.show();
      await nextUpdate();
      expect(nativeDialog(el)?.open).toBe(true);
      expect(spy.counts.show).toBe(1);
      expect(spy.counts.showModal).toBe(0);
      el.close();
      await nextUpdate();
      spy.restore();
    });

    test('close() sets open to false', async () => {
      const el = createDialog();
      el.show();
      await nextUpdate();
      el.close();
      await nextUpdate();
      expect(el.open).toBe(false);
      expect(nativeDialog(el)?.open).toBe(false);
    });

    test('toggle() switches open state', async () => {
      const el = createDialog();
      el.toggle();
      await nextUpdate();
      expect(el.open).toBe(true);
      el.toggle();
      await nextUpdate();
      expect(el.open).toBe(false);
    });

    test('initially open dialog calls showModal()', () => {
      const spy = spyDialogOpeners();
      const el = createDialog({ open: true });
      expect(nativeDialog(el)?.open).toBe(true);
      expect(spy.counts.showModal).toBe(1);
      el.close();
      spy.restore();
    });
  });

  describe('events', () => {
    test('show() emits open event', async () => {
      const el = createDialog();
      let opened = false;
      el.addEventListener('open', () => {
        opened = true;
      });
      el.show();
      await nextUpdate();
      expect(opened).toBe(true);
      el.close();
      await nextUpdate();
    });

    test('close() emits close event', async () => {
      const el = createDialog();
      el.show();
      await nextUpdate();
      let closed = false;
      el.addEventListener('close', () => {
        closed = true;
      });
      el.close();
      await nextUpdate();
      expect(closed).toBe(true);
    });
  });

  describe('escape key', () => {
    test('cancel event closes dismissible dialog', async () => {
      const el = createDialog({ dismissible: true });
      el.show();
      await nextUpdate();
      const dialog = nativeDialog(el);
      const cancel = new Event('cancel', { cancelable: true });
      dialog?.dispatchEvent(cancel);
      dialog?.dispatchEvent(new Event('close'));
      await nextUpdate();
      expect(el.open).toBe(false);
    });

    test('cancel event is prevented on non-dismissible dialog', async () => {
      const el = createDialog({ dismissible: false });
      el.show();
      await nextUpdate();
      const dialog = nativeDialog(el);
      const cancel = new Event('cancel', { cancelable: true });
      dialog?.dispatchEvent(cancel);
      expect(cancel.defaultPrevented).toBe(true);
      expect(el.open).toBe(true);
      el.close();
      await nextUpdate();
    });
  });

  describe('backdrop click', () => {
    test('clicking the dialog element closes dismissible dialog', async () => {
      const el = createDialog({ dismissible: true });
      el.show();
      await nextUpdate();
      const dialog = nativeDialog(el);
      const event = new Event('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: dialog });
      Object.defineProperty(event, 'currentTarget', { value: dialog });
      dialog?.dispatchEvent(event);
      await nextUpdate();
      expect(el.open).toBe(false);
    });
  });

  describe('command invoker', () => {
    test('show-modal command forwards to the native dialog', async () => {
      const el = createDialog();
      const dialog = nativeDialog(el);
      expect(dialog).toBeDefined();

      const spy = spyDialogOpeners();
      el.dispatchEvent(createCommandEvent('show-modal'));
      await nextUpdate();

      expect(spy.counts.showModal).toBe(1);
      expect(spy.counts.show).toBe(0);
      expect(el.open).toBe(true);
      expect(dialog?.open).toBe(true);
      expect(nativeDialog(el)).toBe(dialog);
      el.close();
      await nextUpdate();
      spy.restore();
    });

    test('close command forwards to the native dialog', async () => {
      const el = createDialog();
      el.show();
      await nextUpdate();
      const dialog = nativeDialog(el);
      expect(dialog?.open).toBe(true);

      let nativeCloseCalls = 0;
      const origClose = HTMLDialogElement.prototype.close;
      HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
        nativeCloseCalls += 1;
        return origClose.call(this);
      };

      try {
        el.dispatchEvent(createCommandEvent('close'));
        await nextUpdate();
        expect(nativeCloseCalls).toBeGreaterThanOrEqual(1);
        expect(el.open).toBe(false);
        expect(nativeDialog(el)).toBe(dialog);
      } finally {
        HTMLDialogElement.prototype.close = origClose;
      }
    });

    test('request-close command asks the native dialog to close', async () => {
      const el = createDialog();
      el.show();
      await nextUpdate();
      const dialog = nativeDialog(el) as HTMLDialogElement & {
        requestClose?: () => void;
      };

      let requestCloseCalls = 0;
      dialog.requestClose = () => {
        requestCloseCalls += 1;
        dialog.close();
      };

      el.dispatchEvent(createCommandEvent('request-close'));
      await nextUpdate();
      expect(requestCloseCalls).toBe(1);
      expect(el.open).toBe(false);
    });

    test('toggle command toggles via the native dialog', async () => {
      const el = createDialog();
      const dialog = nativeDialog(el);
      el.dispatchEvent(createCommandEvent('toggle'));
      await nextUpdate();
      expect(el.open).toBe(true);
      expect(nativeDialog(el)).toBe(dialog);
      el.dispatchEvent(createCommandEvent('toggle'));
      await nextUpdate();
      expect(el.open).toBe(false);
      expect(nativeDialog(el)).toBe(dialog);
    });
  });

  describe('CSS parts', () => {
    test('exposes dialog part on the native dialog', () => {
      const el = createDialog();
      const dialog = el.shadowRoot?.querySelector('[part="dialog"]');
      expect(dialog?.tagName.toLowerCase()).toBe('dialog');
    });

    test('exposes box part', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('[part="box"]')).toBeDefined();
    });

    test('exposes header part', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('[part="header"]')).toBeDefined();
    });

    test('exposes title part', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('[part="title"]')).toBeDefined();
    });

    test('exposes body part', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('[part="body"]')).toBeDefined();
    });

    test('exposes footer part', () => {
      const el = createDialog();
      expect(el.shadowRoot?.querySelector('[part="footer"]')).toBeDefined();
    });
  });

  describe('styles', () => {
    test('includes native dialog core styles', () => {
      const el = createDialog();
      const sheets = el.shadowRoot?.adoptedStyleSheets ?? [];
      const allCSS = sheets
        .map((s) =>
          Array.from(s.cssRules)
            .map((r) => r.cssText)
            .join('\n'),
        )
        .join('\n');
      expect(allCSS).toContain('dialog.dialog');
      expect(allCSS).toContain('prefers-reduced-motion');
    });
  });
});
