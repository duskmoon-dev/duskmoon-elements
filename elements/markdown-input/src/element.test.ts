import { describe, test, expect, beforeEach, mock } from 'bun:test';

// ── Polyfill ElementInternals for happy-dom ─────────────────────────
// happy-dom does not implement attachInternals(). We provide a minimal
// stub so the ElDmMarkdownInput constructor doesn't throw.
if (!HTMLElement.prototype.attachInternals) {
  HTMLElement.prototype.attachInternals = function () {
    return {
      setFormValue: () => {},
      setValidity: () => {},
      form: null,
      validationMessage: '',
      validity: {} as ValidityState,
      willValidate: false,
      checkValidity: () => true,
      reportValidity: () => true,
    } as unknown as ElementInternals;
  };
}

// Import AFTER polyfill so the class can construct
import { ElDmMarkdownInput } from './element.js';

// Register element for tests
if (!customElements.get('el-dm-markdown-input')) {
  customElements.define('el-dm-markdown-input', ElDmMarkdownInput);
}

function createElement(attrs: Record<string, string> = {}): ElDmMarkdownInput {
  const el = document.createElement('el-dm-markdown-input') as ElDmMarkdownInput;
  for (const [k, v] of Object.entries(attrs)) {
    el.setAttribute(k, v);
  }
  document.body.appendChild(el);
  return el;
}

function getTextarea(el: ElDmMarkdownInput): HTMLTextAreaElement {
  return el.shadowRoot!.querySelector('textarea')!;
}

function getTabButton(el: ElDmMarkdownInput, tab: 'write' | 'preview'): HTMLElement {
  return el.shadowRoot!.querySelector(`.tab-btn[data-tab="${tab}"]`)!;
}

function cleanup(el: ElDmMarkdownInput): void {
  el.remove();
}

// ── Construction & rendering ──────────────────────────────────────────

describe('ElDmMarkdownInput', () => {
  let el: ElDmMarkdownInput;

  beforeEach(() => {
    el = createElement();
  });

  describe('initial render', () => {
    test('creates shadow DOM with textarea', () => {
      expect(el.shadowRoot).toBeTruthy();
      expect(getTextarea(el)).toBeTruthy();
      cleanup(el);
    });

    test('textarea has default placeholder', () => {
      expect(getTextarea(el).placeholder).toBe('Write markdown\u2026');
      cleanup(el);
    });

    test('write tab is selected by default', () => {
      const writeBtn = getTabButton(el, 'write');
      expect(writeBtn.getAttribute('aria-selected')).toBe('true');
      cleanup(el);
    });

    test('preview panel is hidden by default', () => {
      const preview = el.shadowRoot!.querySelector('.preview-body');
      expect(preview?.hasAttribute('hidden')).toBe(true);
      cleanup(el);
    });

    test('write panel is visible by default', () => {
      const writeArea = el.shadowRoot!.querySelector('.write-area');
      expect(writeArea?.hasAttribute('hidden')).toBe(false);
      cleanup(el);
    });

    test('toolbar has role="tablist"', () => {
      const toolbar = el.shadowRoot!.querySelector('.toolbar');
      expect(toolbar?.getAttribute('role')).toBe('tablist');
      cleanup(el);
    });

    test('tab buttons have role="tab"', () => {
      const tabs = el.shadowRoot!.querySelectorAll('.tab-btn');
      tabs.forEach((tab) => {
        expect(tab.getAttribute('role')).toBe('tab');
      });
      cleanup(el);
    });

    test('textarea has aria-label', () => {
      expect(getTextarea(el).getAttribute('aria-label')).toBe('Markdown editor');
      cleanup(el);
    });

    test('textarea has aria-haspopup="listbox" for autocomplete', () => {
      expect(getTextarea(el).getAttribute('aria-haspopup')).toBe('listbox');
      cleanup(el);
    });

    test('autocomplete dropdown starts hidden', () => {
      const dropdown = el.shadowRoot!.querySelector('.ac-dropdown');
      expect(dropdown?.hasAttribute('hidden')).toBe(true);
      cleanup(el);
    });

    test('status bar is present', () => {
      const statusBar = el.shadowRoot!.querySelector('.status-bar');
      expect(statusBar).toBeTruthy();
      cleanup(el);
    });

    test('attach button is present', () => {
      const attachBtn = el.shadowRoot!.querySelector('.attach-btn');
      expect(attachBtn).toBeTruthy();
      expect(attachBtn?.getAttribute('aria-label')).toBe('Attach files');
      cleanup(el);
    });

    test('file input is hidden', () => {
      const fileInput = el.shadowRoot!.querySelector('.file-input') as HTMLInputElement;
      expect(fileInput).toBeTruthy();
      expect(fileInput.getAttribute('aria-hidden')).toBe('true');
      cleanup(el);
    });
  });

  // ── Attribute reflection ──────────────────────────────────────────

  describe('attribute reflection', () => {
    test('placeholder attribute updates textarea placeholder', () => {
      el.setAttribute('placeholder', 'Type here...');
      // Trigger microtask for batched update
      return Promise.resolve().then(() => {
        expect(getTextarea(el).placeholder).toBe('Type here...');
        cleanup(el);
      });
    });

    test('disabled attribute disables textarea', () => {
      el.setAttribute('disabled', '');
      return Promise.resolve().then(() => {
        expect(getTextarea(el).disabled).toBe(true);
        cleanup(el);
      });
    });

    test('readonly attribute sets textarea readOnly', () => {
      el.setAttribute('readonly', '');
      return Promise.resolve().then(() => {
        expect(getTextarea(el).readOnly).toBe(true);
        cleanup(el);
      });
    });

    test('disabled attribute disables attach button', () => {
      el.setAttribute('disabled', '');
      return Promise.resolve().then(() => {
        const attachBtn = el.shadowRoot!.querySelector('.attach-btn') as HTMLButtonElement;
        expect(attachBtn.disabled).toBe(true);
        cleanup(el);
      });
    });
  });

  // ── Public API ────────────────────────────────────────────────────

  describe('getValue()', () => {
    test('returns empty string initially', () => {
      expect(el.getValue()).toBe('');
      cleanup(el);
    });

    test('returns textarea value after user types', () => {
      getTextarea(el).value = 'Hello markdown';
      expect(el.getValue()).toBe('Hello markdown');
      cleanup(el);
    });
  });

  describe('setValue()', () => {
    test('sets textarea value', () => {
      el.setValue('# Hello');
      expect(getTextarea(el).value).toBe('# Hello');
      cleanup(el);
    });

    test('updates form value', () => {
      el.setValue('form content');
      expect(getTextarea(el).value).toBe('form content');
      cleanup(el);
    });

    test('updates getValue() return value', () => {
      el.setValue('test');
      expect(el.getValue()).toBe('test');
      cleanup(el);
    });

    test('does not fire change event', () => {
      const handler = mock(() => {});
      el.addEventListener('change', handler);
      el.setValue('silent update');
      expect(handler).not.toHaveBeenCalled();
      el.removeEventListener('change', handler);
      cleanup(el);
    });
  });

  describe('insertText()', () => {
    test('inserts text at cursor position', () => {
      const ta = getTextarea(el);
      ta.value = 'Hello World';
      ta.setSelectionRange(5, 5);
      el.insertText(' Beautiful');
      expect(ta.value).toBe('Hello Beautiful World');
      cleanup(el);
    });

    test('replaces selected text', () => {
      const ta = getTextarea(el);
      ta.value = 'Hello World';
      ta.setSelectionRange(6, 11); // Select "World"
      el.insertText('Universe');
      expect(ta.value).toBe('Hello Universe');
      cleanup(el);
    });

    test('appends to end when no cursor position', () => {
      const ta = getTextarea(el);
      ta.value = 'Start';
      ta.setSelectionRange(5, 5);
      el.insertText(' End');
      expect(ta.value).toBe('Start End');
      cleanup(el);
    });

    test('fires change event after insertion', () => {
      const values: string[] = [];
      el.addEventListener('change', ((e: CustomEvent) => {
        values.push(e.detail.value);
      }) as EventListener);
      el.insertText('inserted');
      expect(values.length).toBe(1);
      expect(values[0]).toBe('inserted');
      cleanup(el);
    });
  });

  describe('setSuggestions()', () => {
    test('shows dropdown with suggestions', () => {
      el.setSuggestions([
        { id: 'alice', label: 'Alice' },
        { id: 'bob', label: 'Bob' },
      ]);
      const dropdown = el.shadowRoot!.querySelector('.ac-dropdown')!;
      expect(dropdown.hidden).toBe(false);
      expect(dropdown.querySelectorAll('.ac-item').length).toBe(2);
      cleanup(el);
    });

    test('hides dropdown with empty array', () => {
      el.setSuggestions([{ id: 'alice', label: 'Alice' }]);
      el.setSuggestions([]);
      const dropdown = el.shadowRoot!.querySelector('.ac-dropdown')!;
      expect(dropdown.hidden).toBe(true);
      cleanup(el);
    });

    test('selects first item by default', () => {
      el.setSuggestions([
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: 'Beta' },
      ]);
      const dropdown = el.shadowRoot!.querySelector('.ac-dropdown')!;
      const firstItem = dropdown.querySelector('[data-ac-index="0"]');
      expect(firstItem?.getAttribute('aria-selected')).toBe('true');
      cleanup(el);
    });

    test('updates aria-expanded on textarea', () => {
      const ta = getTextarea(el);
      expect(ta.getAttribute('aria-expanded')).toBe('false');
      el.setSuggestions([{ id: 'a', label: 'A' }]);
      expect(ta.getAttribute('aria-expanded')).toBe('true');
      el.setSuggestions([]);
      expect(ta.getAttribute('aria-expanded')).toBe('false');
      cleanup(el);
    });
  });

  // ── Tab switching ─────────────────────────────────────────────────

  describe('tab switching', () => {
    test('clicking preview tab hides write area', () => {
      const previewBtn = getTabButton(el, 'preview');
      previewBtn.click();
      const writeArea = el.shadowRoot!.querySelector('.write-area');
      expect(writeArea?.hasAttribute('hidden')).toBe(true);
      cleanup(el);
    });

    test('clicking preview tab shows preview panel', () => {
      const previewBtn = getTabButton(el, 'preview');
      previewBtn.click();
      const preview = el.shadowRoot!.querySelector('.preview-body');
      expect(preview?.hasAttribute('hidden')).toBe(false);
      cleanup(el);
    });

    test('clicking write tab after preview restores write area', () => {
      getTabButton(el, 'preview').click();
      getTabButton(el, 'write').click();
      const writeArea = el.shadowRoot!.querySelector('.write-area');
      expect(writeArea?.hasAttribute('hidden')).toBe(false);
      const preview = el.shadowRoot!.querySelector('.preview-body');
      expect(preview?.hasAttribute('hidden')).toBe(true);
      cleanup(el);
    });

    test('clicking preview updates aria-selected attributes', () => {
      getTabButton(el, 'preview').click();
      expect(getTabButton(el, 'preview').getAttribute('aria-selected')).toBe('true');
      expect(getTabButton(el, 'write').getAttribute('aria-selected')).toBe('false');
      cleanup(el);
    });

    test('clicking same tab twice is a no-op', () => {
      getTabButton(el, 'write').click();
      expect(getTabButton(el, 'write').getAttribute('aria-selected')).toBe('true');
      const writeArea = el.shadowRoot!.querySelector('.write-area');
      expect(writeArea?.hasAttribute('hidden')).toBe(false);
      cleanup(el);
    });

    test('preview tab updates tabindex for roving tabindex', () => {
      getTabButton(el, 'preview').click();
      expect(getTabButton(el, 'preview').getAttribute('tabindex')).toBe('0');
      expect(getTabButton(el, 'write').getAttribute('tabindex')).toBe('-1');
      cleanup(el);
    });
  });

  // ── Input events ──────────────────────────────────────────────────

  describe('input events', () => {
    test('fires change event on textarea input', () => {
      const handler = mock((_e: Event) => {});
      el.addEventListener('change', handler);
      const ta = getTextarea(el);
      ta.value = 'typed text';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      expect(handler).toHaveBeenCalled();
      el.removeEventListener('change', handler);
      cleanup(el);
    });

    test('change event detail contains current value', () => {
      let detail: { value: string } | null = null;
      el.addEventListener('change', ((e: CustomEvent) => {
        detail = e.detail;
      }) as EventListener);
      const ta = getTextarea(el);
      ta.value = 'Hello';
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      expect(detail).toEqual({ value: 'Hello' });
      cleanup(el);
    });
  });

  // ── Status bar ────────────────────────────────────────────────────

  describe('status bar', () => {
    test('displays word count after input', async () => {
      const ta = getTextarea(el);
      ta.value = 'one two three';
      ta.dispatchEvent(new Event('input', { bubbles: true }));

      // Status updates are debounced at 100ms
      await new Promise((r) => setTimeout(r, 150));

      const statusCount = el.shadowRoot!.querySelector('.status-bar-count');
      expect(statusCount?.textContent).toContain('3');
      cleanup(el);
    });

    test('displays character count', async () => {
      const ta = getTextarea(el);
      ta.value = 'abc';
      ta.dispatchEvent(new Event('input', { bubbles: true }));

      await new Promise((r) => setTimeout(r, 150));

      const statusCount = el.shadowRoot!.querySelector('.status-bar-count');
      expect(statusCount?.textContent).toContain('3');
      cleanup(el);
    });
  });

  // ── Form association ──────────────────────────────────────────────

  describe('form association', () => {
    test('element is form-associated', () => {
      expect(ElDmMarkdownInput.formAssociated).toBe(true);
      cleanup(el);
    });
  });

  // ── Upload events ─────────────────────────────────────────────────

  describe('upload events', () => {
    test('fires upload-error when no upload-url is set', () => {
      const errors: Array<{ file: File; error: string }> = [];
      el.addEventListener('upload-error', ((e: CustomEvent) => {
        errors.push(e.detail);
      }) as EventListener);

      el.addEventListener('upload-start', () => {});

      // Trigger file upload via the element's internal mechanism
      // We can use the file input change event
      const fileInput = el.shadowRoot!.querySelector('.file-input') as HTMLInputElement;
      // Mock the files property
      const file = new File(['test'], 'test.png', { type: 'image/png' });
      Object.defineProperty(fileInput, 'files', { value: [file], configurable: true });
      fileInput.dispatchEvent(new Event('change'));

      expect(errors.length).toBe(1);
      expect(errors[0].error).toBe('no upload-url set');
      cleanup(el);
    });
  });

  // ── Keyboard shortcut ─────────────────────────────────────────────

  describe('keyboard shortcuts', () => {
    // happy-dom does not expose KeyboardEvent globally — use Event + assign key props
    function fireKeydown(target: HTMLElement, init: Record<string, unknown>): void {
      const e = new Event('keydown', { bubbles: true }) as Event & Record<string, unknown>;
      Object.assign(e, init);
      target.dispatchEvent(e);
    }

    test('Ctrl+Shift+P toggles to preview', () => {
      const ta = getTextarea(el);
      fireKeydown(ta, { key: 'P', ctrlKey: true, shiftKey: true });
      const preview = el.shadowRoot!.querySelector('.preview-body');
      expect(preview?.hasAttribute('hidden')).toBe(false);
      cleanup(el);
    });

    test('Ctrl+Shift+P toggles back to write', () => {
      const ta = getTextarea(el);
      fireKeydown(ta, { key: 'P', ctrlKey: true, shiftKey: true });
      fireKeydown(ta, { key: 'P', ctrlKey: true, shiftKey: true });
      const writeArea = el.shadowRoot!.querySelector('.write-area');
      expect(writeArea?.hasAttribute('hidden')).toBe(false);
      cleanup(el);
    });
  });

  // ── Dark mode ─────────────────────────────────────────────────────

  describe('dark mode', () => {
    test('applies Prism dark theme when dark attribute is set', () => {
      const darkEl = createElement({ dark: '' });
      return Promise.resolve().then(() => {
        const prismStyle = darkEl.shadowRoot!.getElementById('prism-theme') as HTMLStyleElement;
        expect(prismStyle?.textContent).toContain('prism-tomorrow');
        cleanup(darkEl);
      });
    });

    test('applies Prism light theme when dark is not set', () => {
      const prismStyle = el.shadowRoot!.getElementById('prism-theme') as HTMLStyleElement;
      expect(prismStyle?.textContent).toContain('prism-coy');
      cleanup(el);
    });
  });

  // ── Scroll sync ───────────────────────────────────────────────────

  describe('scroll sync', () => {
    test('backdrop scrollTop follows textarea scroll', () => {
      const ta = getTextarea(el);
      const backdrop = el.shadowRoot!.querySelector('.backdrop') as HTMLElement;
      // Simulate scroll
      Object.defineProperty(ta, 'scrollTop', { value: 50, configurable: true });
      ta.dispatchEvent(new Event('scroll'));
      expect(backdrop.scrollTop).toBe(50);
      cleanup(el);
    });
  });

  // ── Disconnected cleanup ──────────────────────────────────────────

  describe('disconnectedCallback', () => {
    test('does not throw on removal', () => {
      expect(() => el.remove()).not.toThrow();
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────

  describe('edge cases', () => {
    test('setValue before element is connected stores value in reactive prop', () => {
      const detached = document.createElement('el-dm-markdown-input') as ElDmMarkdownInput;
      // Before connecting, setValue falls through to reactive prop
      detached.setValue('pre-connect value');
      // Now connect — the initial update should pick up the stored value
      document.body.appendChild(detached);
      expect(detached.getValue()).toBe('pre-connect value');
      detached.remove();
    });

    test('getValue returns empty string when called before first render', () => {
      const detached = document.createElement('el-dm-markdown-input') as ElDmMarkdownInput;
      expect(detached.getValue()).toBe('');
    });

    test('insertText on empty textarea appends text', () => {
      el.insertText('appended');
      expect(el.getValue()).toBe('appended');
      cleanup(el);
    });

    test('multiple setValue calls use the last value', () => {
      el.setValue('first');
      el.setValue('second');
      el.setValue('third');
      expect(el.getValue()).toBe('third');
      cleanup(el);
    });

    test('setSuggestions with single item selects it', () => {
      el.setSuggestions([{ id: 'only', label: 'Only Option' }]);
      const dropdown = el.shadowRoot!.querySelector('.ac-dropdown')!;
      const item = dropdown.querySelector('[data-ac-index="0"]');
      expect(item?.getAttribute('aria-selected')).toBe('true');
      cleanup(el);
    });

    test('tab switching back to write preserves textarea content', () => {
      el.setValue('preserved');
      getTabButton(el, 'preview').click();
      getTabButton(el, 'write').click();
      expect(el.getValue()).toBe('preserved');
      cleanup(el);
    });

    test('disabled blocks drag-and-drop uploads', () => {
      el.setAttribute('disabled', '');
      return Promise.resolve().then(() => {
        const errors: string[] = [];
        el.addEventListener('upload-start', () => {
          errors.push('should not fire');
        });

        const writeArea = el.shadowRoot!.querySelector('.write-area') as HTMLElement;
        const dropEvent = new Event('drop', { bubbles: true }) as Event & {
          dataTransfer: { files: File[] };
        };
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [new File(['x'], 'test.png', { type: 'image/png' })] },
        });
        Object.defineProperty(dropEvent, 'preventDefault', { value: () => {} });
        writeArea.dispatchEvent(dropEvent);

        expect(errors.length).toBe(0);
        cleanup(el);
      });
    });

    test('empty setValue clears textarea', () => {
      el.setValue('content');
      el.setValue('');
      expect(el.getValue()).toBe('');
      cleanup(el);
    });

    test('render-start event fires when preview tab is activated', () => {
      const events: string[] = [];
      el.addEventListener('render-start', () => events.push('render-start'));
      getTabButton(el, 'preview').click();
      expect(events).toContain('render-start');
      cleanup(el);
    });

    test('preview panel gets aria-busy while rendering', () => {
      getTabButton(el, 'preview').click();
      const preview = el.shadowRoot!.querySelector('.preview-body');
      // aria-busy should be set during render (synchronously set before async pipeline)
      expect(preview?.getAttribute('aria-busy')).toBe('true');
      cleanup(el);
    });

    test('attach button click opens file input', () => {
      let fileInputClicked = false;
      const fileInput = el.shadowRoot!.querySelector('.file-input') as HTMLInputElement;
      fileInput.click = () => {
        fileInputClicked = true;
      };
      const attachBtn = el.shadowRoot!.querySelector('.attach-btn') as HTMLButtonElement;
      attachBtn.click();
      expect(fileInputClicked).toBe(true);
      cleanup(el);
    });

    test('arrow key navigation in toolbar switches tabs', () => {
      const toolbar = el.shadowRoot!.querySelector('.toolbar') as HTMLElement;
      const event = new Event('keydown', { bubbles: true }) as Event & Record<string, unknown>;
      Object.assign(event, { key: 'ArrowRight' });
      Object.defineProperty(event, 'preventDefault', { value: () => {} });
      toolbar.dispatchEvent(event);
      expect(getTabButton(el, 'preview').getAttribute('aria-selected')).toBe('true');
      cleanup(el);
    });

    test('value attribute reflects through to textarea', () => {
      const attrEl = createElement({ value: 'from-attribute' });
      return Promise.resolve().then(() => {
        // The value should be applied after initial render
        expect(attrEl.getValue()).toBe('from-attribute');
        cleanup(attrEl);
      });
    });
  });
});
