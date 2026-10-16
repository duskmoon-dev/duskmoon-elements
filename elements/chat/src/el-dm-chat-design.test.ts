import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';
import { css as chatCSS } from '@duskmoon-dev/core/components/chat';
import {
  ElDmChat,
  ElDmChatBubble,
  ElDmChatInput,
  register,
  type ChatQueueItem,
  type ElDmChatQueue,
  type ElDmChatWork,
} from './index';

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

register();

async function settle(): Promise<void> {
  await Promise.resolve();
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function required<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Expected ${selector}`);
  return element;
}

function styleDeclarations(sheets: CSSStyleSheet[], selector: string): string[] {
  return sheets.flatMap((sheet) =>
    Array.from(sheet.cssRules)
      .filter((rule) => (rule as CSSStyleRule).selectorText === selector)
      .map((rule) => (rule as CSSStyleRule).style.cssText),
  );
}

describe('current Core chat design', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('agent messages expose full-width final content and a preceding work slot', async () => {
    const chat = document.createElement('el-dm-chat') as ElDmChat;
    chat.agent = true;
    chat.streaming = true;
    chat.content = 'Final **answer**';
    const work = document.createElement('el-dm-chat-work');
    work.slot = 'work';
    chat.append(work);
    container.append(chat);

    const row = required(chat.shadowRoot!, '.chat');
    const content = required(chat.shadowRoot!, '.chat-content');
    const workSlot = required<HTMLSlotElement>(chat.shadowRoot!, 'slot[name="work"]');
    expect(chat.hasAttribute('agent')).toBe(true);
    expect(row.classList.contains('chat-agent')).toBe(true);
    expect(chat.shadowRoot!.querySelector('.chat-bubble')).toBeNull();
    expect(workSlot.assignedElements()).toEqual([work]);
    expect(
      workSlot.compareDocumentPosition(content) & window.Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
    expect(content.classList.contains('chat-streaming')).toBe(true);
    expect(required(content, 'el-dm-markdown').getAttribute('content')).toBe('Final **answer**');

    chat.agent = false;
    await settle();
    expect(required(chat.shadowRoot!, '.chat').classList.contains('chat-agent')).toBe(false);
    expect(chat.shadowRoot!.querySelector('.chat-bubble')).not.toBeNull();
  });

  test('work uses native disclosure, safe summary text, and reflected open state', async () => {
    expect(customElements.get('el-dm-chat-work')).toBeDefined();
    const work = document.createElement('el-dm-chat-work') as ElDmChatWork;
    work.summary = '<img src=x onerror=alert(1)> 2 steps';
    const tool = document.createElement('el-dm-chat-tool');
    work.append(tool);
    container.append(work);

    const details = required<HTMLDetailsElement>(work.shadowRoot!, 'details.chat-work');
    const summary = required(details, 'summary.chat-work-summary');
    expect(summary.textContent).toContain(work.summary);
    expect(summary.querySelector('img')).toBeNull();
    expect(details.open).toBe(false);
    expect(required<HTMLSlotElement>(details, '.chat-work-body slot').assignedElements()).toEqual([
      tool,
    ]);

    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    await settle();
    expect(work.open).toBe(true);
    expect(work.hasAttribute('open')).toBe(true);

    work.open = false;
    await settle();
    expect(required<HTMLDetailsElement>(work.shadowRoot!, 'details').open).toBe(false);
  });

  test.each(['el-dm-chat', 'el-dm-chat-bubble'] as const)(
    '%s exposes an accessible collapse control only for overflowing content',
    async (tag) => {
      const chat = document.createElement(tag) as ElDmChat | ElDmChatBubble;
      chat.collapsible = true;
      chat.content = 'A long answer';
      container.append(chat);
      const content = required<HTMLElement>(chat.shadowRoot!, '.chat-bubble-content');
      content.style.lineHeight = '10px';
      let height = 40;
      Object.defineProperties(content, {
        scrollHeight: { configurable: true, get: () => height },
        clientHeight: { configurable: true, get: () => 40 },
      });
      chat.shadowRoot!.dispatchEvent(new Event('slotchange'));
      await settle();
      expect(required<HTMLButtonElement>(chat.shadowRoot!, '.chat-bubble-toggle').hidden).toBe(
        true,
      );

      height = 200;
      chat.shadowRoot!.dispatchEvent(new Event('slotchange'));
      await settle();
      const button = required<HTMLButtonElement>(chat.shadowRoot!, '.chat-bubble-toggle');
      expect(button.hidden).toBe(false);
      expect(button.type).toBe('button');
      expect(button.getAttribute('aria-expanded')).toBe('false');
      expect(button.getAttribute('aria-controls')).toBe(content.id);
      expect(content.id).not.toBe('');
      expect(button.textContent?.trim()).not.toBe('');
      button.focus();
      expect(chat.shadowRoot!.activeElement).toBe(button);
      button.click();
      await settle();
      expect(chat.expanded).toBe(true);
      expect(chat.hasAttribute('expanded')).toBe(true);
      const expandedButton = required<HTMLButtonElement>(chat.shadowRoot!, '.chat-bubble-toggle');
      expect(expandedButton.getAttribute('aria-expanded')).toBe('true');
      expandedButton.click();
      await settle();
      expect(chat.expanded).toBe(false);
      expect(chat.hasAttribute('expanded')).toBe(false);
    },
  );

  test.each(['el-dm-chat', 'el-dm-chat-bubble'] as const)(
    '%s moves focus from a hidden collapse toggle to shortened content',
    async (tag) => {
      const chat = document.createElement(tag) as ElDmChat | ElDmChatBubble;
      chat.collapsible = true;
      chat.expanded = false;
      chat.textContent = 'A long answer that initially overflows the collapsed content';
      container.append(chat);
      const content = required<HTMLElement>(chat.shadowRoot!, '.chat-bubble-content');
      content.style.lineHeight = '10px';
      let height = 200;
      Object.defineProperties(content, {
        scrollHeight: { configurable: true, get: () => height },
        clientHeight: { configurable: true, get: () => 40 },
      });
      chat.shadowRoot!.dispatchEvent(new Event('slotchange'));
      await settle();
      const button = required<HTMLButtonElement>(chat.shadowRoot!, '.chat-bubble-toggle');
      expect(button.hidden).toBe(false);
      expect(button.getAttribute('aria-expanded')).toBe('false');
      button.focus();
      expect(chat.shadowRoot!.activeElement === button).toBe(true);

      height = 40;
      chat.textContent = 'Short answer';
      chat.shadowRoot!.dispatchEvent(new Event('slotchange'));
      await settle();
      expect(button.hidden).toBe(true);
      expect(chat.expanded).toBe(false);
      expect(chat.shadowRoot!.activeElement === content).toBe(true);
      expect(required(content, 'el-dm-markdown').getAttribute('content')).toBe('Short answer');
    },
  );

  test('queue hides when empty and renders ordered safe text with active and attachment states', async () => {
    expect(customElements.get('el-dm-chat-queue')).toBeDefined();
    const queue = document.createElement('el-dm-chat-queue') as ElDmChatQueue;
    container.append(queue);
    expect(required<HTMLElement>(queue.shadowRoot!, '.chat-queue').hidden).toBe(true);
    queue.label = 'Pending requests';
    queue.items = [
      { id: 'one', content: '<img src=x onerror=alert(1)>', active: true },
      {
        id: 'two',
        content: 'Describe attachment',
        attachment: 'https://example.com/photo.png',
        attachmentAlt: 'A mountain',
      },
    ];
    await settle();
    expect(required<HTMLElement>(queue.shadowRoot!, '.chat-queue').hidden).toBe(false);
    expect(required(queue.shadowRoot!, '.chat-queue').getAttribute('aria-label')).toBe(
      'Pending requests',
    );
    const list = required(queue.shadowRoot!, '.chat-queue-list');
    expect(['OL', 'UL']).toContain(list.tagName);
    const rows = list.querySelectorAll('.chat-queue-item');
    expect(rows).toHaveLength(2);
    expect(rows[0].classList.contains('chat-queue-item-active')).toBe(true);
    expect(required(rows[0], '.chat-queue-content').textContent).toBe(queue.items[0].content);
    expect(rows[0].querySelector('img')).toBeNull();
    expect(required<HTMLImageElement>(rows[1], '.chat-queue-attachment').alt).toBe('A mountain');
    expect(queue.shadowRoot!.textContent).toContain('Pending requests');

    queue.items = [];
    await settle();
    expect(required<HTMLElement>(queue.shadowRoot!, '.chat-queue').hidden).toBe(true);
    expect(queue.shadowRoot!.querySelectorAll('.chat-queue-item')).toHaveLength(0);
  });

  test.each(['steer', 'remove'] as const)(
    'queue %s requests are cancelable and leave application-owned items unchanged',
    async (action) => {
      const queue = document.createElement('el-dm-chat-queue') as ElDmChatQueue;
      const items: ChatQueueItem[] = [
        { id: 'first', content: 'First message' },
        { id: 'second', content: 'Second message' },
      ];
      const originalItems = items.map((item) => ({ ...item }));
      queue.items = items;
      container.append(queue);
      const listener = mock((event: Event) => event.preventDefault());
      container.addEventListener(action, listener);
      const button = queue.shadowRoot!.querySelectorAll<HTMLButtonElement>(
        `.chat-queue-${action}`,
      )[1];
      expect(button.type).toBe('button');
      expect(button.getAttribute('aria-label') || button.textContent?.trim()).toBeTruthy();
      button.click();
      expect(listener).toHaveBeenCalledTimes(1);
      const event = listener.mock.calls[0][0] as CustomEvent;
      expect(event.detail).toEqual({ item: items[1], index: 1 });
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      expect(event.cancelable).toBe(true);
      expect(event.defaultPrevented).toBe(true);
      expect(items).toEqual(originalItems);
      expect(queue.items).toEqual(originalItems);
      expect(queue.shadowRoot!.querySelectorAll('.chat-queue-item')).toHaveLength(2);
      container.removeEventListener(action, listener);
      button.click();
      expect(queue.items).toEqual(originalItems);
      expect(queue.shadowRoot!.querySelectorAll('.chat-queue-item')).toHaveLength(2);

      queue.items = [items[0]];
      await settle();
      expect(queue.shadowRoot!.querySelectorAll('.chat-queue-item')).toHaveLength(1);
      expect(queue.shadowRoot!.textContent).not.toContain('Second message');
    },
  );

  test('queue accepts declarative items without interpreting message text as HTML', () => {
    const queue = document.createElement('el-dm-chat-queue') as ElDmChatQueue;
    queue.setAttribute(
      'items',
      JSON.stringify([{ id: 'quoted"', content: '<script>bad()</script>' }]),
    );
    container.append(queue);
    expect(required(queue.shadowRoot!, '.chat-queue-content').textContent).toBe(
      '<script>bad()</script>',
    );
    expect(queue.shadowRoot!.querySelector('script')).toBeNull();
  });

  test('queue rejects executable attachment URLs and keeps keyboard focus after an application removes a row', async () => {
    const queue = document.createElement('el-dm-chat-queue') as ElDmChatQueue;
    queue.items = [
      { id: 'first', content: 'First', attachment: 'javascript:alert(1)' },
      { id: 'second', content: 'Second' },
    ];
    container.append(queue);
    expect(queue.shadowRoot!.querySelector('img')).toBeNull();
    const remove = required<HTMLButtonElement>(queue.shadowRoot!, '.chat-queue-remove');
    remove.focus();
    queue.addEventListener('remove', (event) => {
      const { index } = (event as CustomEvent).detail;
      queue.items = queue.items.filter((_, itemIndex) => itemIndex !== index);
    });
    remove.click();
    await settle();
    expect(queue.items).toEqual([{ id: 'second', content: 'Second' }]);
    expect(
      queue.shadowRoot!.activeElement === required(queue.shadowRoot!, '.chat-queue-remove'),
    ).toBe(true);
  });

  test('composer adopts current Core structure and accepts a queue above its editor', () => {
    const input = document.createElement('el-dm-chat-input') as ElDmChatInput;
    input.color = 'primary';
    const queue = document.createElement('el-dm-chat-queue');
    queue.slot = 'queue';
    input.append(queue);
    container.append(input);
    const area = required(input.shadowRoot!, '.chat-input-area');
    const composer = required(area, '.chat-composer');
    expect(composer.classList.contains('chat-composer-primary')).toBe(true);
    expect(required<HTMLSlotElement>(area, 'slot[name="queue"]').assignedElements()).toEqual([
      queue,
    ]);
    expect(
      required(composer, 'el-dm-markdown-input').classList.contains('chat-composer-input'),
    ).toBe(true);
    expect(input.shadowRoot!.querySelector('.chat-composer-actions')).not.toBeNull();
  });

  test('composer presentation updates preserve the editor, selection, draft, and attachments', async () => {
    const input = document.createElement('el-dm-chat-input') as ElDmChatInput;
    container.append(input);
    input.setValue('An unfinished draft');
    const editor = required(input.shadowRoot!, 'el-dm-markdown-input');
    const textarea = required<HTMLTextAreaElement>(editor.shadowRoot!, 'textarea');
    const file = new File(['image'], 'photo.png', { type: 'image/png' });
    const drop = new Event('drop', { bubbles: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [file] } });
    required(editor.shadowRoot!, '.write-area').dispatchEvent(drop);
    textarea.focus();
    textarea.setSelectionRange(3, 9);

    input.color = 'ghost';
    input.placeholder = 'Keep writing';
    input.sendLabel = 'Submit draft';
    input.setAttribute('auto-grow', '');
    await settle();
    expect(required(input.shadowRoot!, 'el-dm-markdown-input') === editor).toBe(true);
    expect(required(editor.shadowRoot!, 'textarea') === textarea).toBe(true);
    expect(editor.shadowRoot!.activeElement === textarea).toBe(true);
    expect(textarea.selectionStart).toBe(3);
    expect(textarea.selectionEnd).toBe(9);
    expect(input.getValue()).toBe('An unfinished draft');
    expect(input.getFiles()).toEqual([file]);
    expect(
      required(input.shadowRoot!, '.chat-composer').classList.contains('chat-composer-ghost'),
    ).toBe(true);
    expect(editor.getAttribute('placeholder')).toBe('Keep writing');
    expect(editor.hasAttribute('auto-grow')).toBe(true);
    expect(required(input.shadowRoot!, '.chat-send').textContent).toContain('Submit draft');
  });

  test('native typing survives composer presentation updates with its selection intact', async () => {
    const input = document.createElement('el-dm-chat-input') as ElDmChatInput;
    container.append(input);
    const editor = required(input.shadowRoot!, 'el-dm-markdown-input');
    const textarea = required<HTMLTextAreaElement>(editor.shadowRoot!, 'textarea');
    const draft = 'A draft typed directly into the native textarea';
    textarea.focus();
    textarea.value = draft;
    textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    textarea.setSelectionRange(2, 13, 'backward');

    input.placeholder = 'Continue your draft';
    input.color = 'secondary';
    input.busy = true;
    input.setAttribute('auto-grow', '');
    await settle();

    expect(required(input.shadowRoot!, 'el-dm-markdown-input') === editor).toBe(true);
    expect(required(editor.shadowRoot!, 'textarea') === textarea).toBe(true);
    expect(editor.shadowRoot!.activeElement === textarea).toBe(true);
    expect(textarea.value).toBe(draft);
    expect(input.getValue()).toBe(draft);
    expect(textarea.selectionStart).toBe(2);
    expect(textarea.selectionEnd).toBe(13);
    expect(textarea.selectionDirection).toBe('backward');
    expect(textarea.placeholder).toBe('Continue your draft');
    expect(required(input.shadowRoot!, '.chat-send').textContent).toContain('Queue');
  });

  test.each(['ctrlKey', 'metaKey'] as const)(
    'composer sends with %s+Enter while preserving IME and Shift+Enter input',
    (modifier) => {
      const input = document.createElement('el-dm-chat-input') as ElDmChatInput;
      container.append(input);
      input.setValue('Keyboard draft');
      const textarea = required<HTMLTextAreaElement>(
        required(input.shadowRoot!, 'el-dm-markdown-input').shadowRoot!,
        'textarea',
      );
      const send = mock(() => {});
      input.addEventListener('send', send);
      for (const options of [
        { shiftKey: true },
        { [modifier]: true, shiftKey: true },
        { [modifier]: true, isComposing: true },
        { [modifier]: true, keyCode: 229 },
      ]) {
        const key = new window.KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          composed: true,
          cancelable: true,
          ...options,
        });
        textarea.dispatchEvent(key);
        expect(key.defaultPrevented).toBe(false);
      }
      expect(send).not.toHaveBeenCalled();
      const key = new window.KeyboardEvent('keydown', {
        key: 'Enter',
        [modifier]: true,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      textarea.dispatchEvent(key);
      expect(key.defaultPrevented).toBe(true);
      expect(send).toHaveBeenCalledTimes(1);
      expect((send.mock.calls[0] as unknown as [CustomEvent])[0].detail).toEqual({
        value: 'Keyboard draft',
        files: [],
      });
    },
  );

  test('a canceled composer send retains the draft and files even with clear-on-send', () => {
    const input = document.createElement('el-dm-chat-input') as ElDmChatInput;
    input.clearOnSend = true;
    container.append(input);
    input.setValue('Keep until accepted');
    const editor = required(input.shadowRoot!, 'el-dm-markdown-input');
    const file = new File(['image'], 'photo.png', { type: 'image/png' });
    const drop = new Event('drop', { bubbles: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [file] } });
    required(editor.shadowRoot!, '.write-area').dispatchEvent(drop);
    let send: CustomEvent | undefined;
    input.addEventListener('send', (event) => {
      send = event as CustomEvent;
      event.preventDefault();
    });
    required<HTMLButtonElement>(input.shadowRoot!, '.chat-send').click();
    expect(send?.cancelable).toBe(true);
    expect(send?.defaultPrevented).toBe(true);
    expect(input.getValue()).toBe('Keep until accepted');
    expect(input.getFiles()).toEqual([file]);
  });

  test('busy composer queues ordinary Enter and steers Ctrl/Cmd+Enter without replacing its draft', async () => {
    const input = document.createElement('el-dm-chat-input') as ElDmChatInput;
    container.append(input);
    input.setValue('Follow-up instruction');
    const editor = required(input.shadowRoot!, 'el-dm-markdown-input');
    const textarea = required<HTMLTextAreaElement>(editor.shadowRoot!, 'textarea');
    expect(required(input.shadowRoot!, '.chat-send').textContent).toContain('Send');
    expect(required<HTMLButtonElement>(input.shadowRoot!, '.chat-steer').disabled).toBe(true);
    const sends = mock(() => {});
    const steers = mock((event: Event) => event.preventDefault());
    input.addEventListener('send', sends);
    input.addEventListener('steer', steers);

    input.busy = true;
    await settle();
    expect(required(input.shadowRoot!, 'el-dm-markdown-input') === editor).toBe(true);
    expect(required(input.shadowRoot!, '.chat-send').textContent).toContain('Queue');
    expect(required<HTMLButtonElement>(input.shadowRoot!, '.chat-steer').disabled).toBe(false);
    textarea.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    expect(sends).toHaveBeenCalledTimes(1);
    input.clearOnSend = true;
    for (const modifier of ['ctrlKey', 'metaKey']) {
      textarea.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Enter',
          [modifier]: true,
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
    }
    expect(steers).toHaveBeenCalledTimes(2);
    const steer = steers.mock.calls[0][0] as CustomEvent;
    expect(steer.detail).toEqual({ value: 'Follow-up instruction', files: [] });
    expect(steer.cancelable).toBe(true);
    expect(steer.composed).toBe(true);
    expect(steer.bubbles).toBe(true);
    expect(steer.defaultPrevented).toBe(true);
    expect(input.getValue()).toBe('Follow-up instruction');
    input.removeEventListener('steer', steers);
    required<HTMLButtonElement>(input.shadowRoot!, '.chat-steer').click();
    expect(input.getValue()).toBe('');
  });

  test('composer rejects blank drafts, permits file-only messages, and respects readonly and disabled', async () => {
    const input = document.createElement('el-dm-chat-input') as ElDmChatInput;
    container.append(input);
    const send = mock(() => {});
    input.addEventListener('send', send);
    input.setValue('   ');
    required<HTMLButtonElement>(input.shadowRoot!, '.chat-send').click();
    expect(send).not.toHaveBeenCalled();
    const editor = required(input.shadowRoot!, 'el-dm-markdown-input');
    const file = new File(['image'], 'photo.png', { type: 'image/png' });
    const drop = new Event('drop', { bubbles: true });
    Object.defineProperty(drop, 'dataTransfer', { value: { files: [file] } });
    required(editor.shadowRoot!, '.write-area').dispatchEvent(drop);
    required<HTMLButtonElement>(input.shadowRoot!, '.chat-send').click();
    expect(send).toHaveBeenCalledTimes(1);
    const sent = (send.mock.calls[0] as unknown as [CustomEvent])[0];
    expect(sent.detail.files).toEqual([file]);

    for (const property of ['disabled', 'readonly'] as const) {
      input[property] = true;
      await settle();
      expect(required<HTMLButtonElement>(input.shadowRoot!, '.chat-send').disabled).toBe(true);
      required<HTMLTextAreaElement>(editor.shadowRoot!, 'textarea').dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Enter',
          ctrlKey: true,
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
      expect(send).toHaveBeenCalledTimes(1);
      input[property] = false;
      await settle();
    }
  });

  test('composer leaves Enter to an active editor autocomplete', () => {
    const input = document.createElement('el-dm-chat-input') as ElDmChatInput;
    container.append(input);
    input.setValue('@Ada');
    const textarea = required<HTMLTextAreaElement>(
      required(input.shadowRoot!, 'el-dm-markdown-input').shadowRoot!,
      'textarea',
    );
    textarea.setAttribute('aria-expanded', 'true');
    const send = mock(() => {});
    input.addEventListener('send', send);
    textarea.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    expect(send).not.toHaveBeenCalled();
  });

  test.each([
    ['.chat-send', 'send'],
    ['.chat-steer', 'steer'],
    ['.chat-queue-remove', 'remove'],
    ['.chat-queue-steer', 'steer'],
  ] as const)('composer preserves native Enter activation on %s', async (selector, action) => {
    const input = document.createElement('el-dm-chat-input') as ElDmChatInput;
    input.busy = true;
    const queue = document.createElement('el-dm-chat-queue') as ElDmChatQueue;
    queue.slot = 'queue';
    queue.items = [{ id: 'waiting', content: 'Queued instruction' }];
    input.append(queue);
    container.append(input);
    input.setValue('An unsent draft');
    await settle();
    const events: CustomEvent[] = [];
    for (const type of ['send', 'steer', 'remove']) {
      input.addEventListener(type, (event) => events.push(event as CustomEvent));
    }
    const root = selector.startsWith('.chat-queue-') ? queue.shadowRoot! : input.shadowRoot!;
    const button = required<HTMLButtonElement>(root, selector);
    button.focus();
    const key = new window.KeyboardEvent('keydown', {
      key: 'Enter',
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    button.dispatchEvent(key);
    expect(key.defaultPrevented).toBe(false);
    expect(events).toHaveLength(0);
    expect(input.getValue()).toBe('An unsent draft');

    // Synthetic keydown does not perform the browser's native button click.
    button.click();
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe(action);
    expect(events[0].detail).toEqual(
      selector.startsWith('.chat-queue-')
        ? { item: queue.items[0], index: 0 }
        : { value: 'An unsent draft', files: [] },
    );
  });

  test('new design primitives inherit Core declarations without local visual overrides', () => {
    const expected = new CSSStyleSheet();
    expected.replaceSync(chatCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, ''));
    for (const [tag, selectors] of [
      ['el-dm-chat', ['.chat-agent', '.chat-content']],
      ['el-dm-chat-work', ['.chat-work', '.chat-work-summary', '.chat-work-body']],
      ['el-dm-chat-queue', ['.chat-queue', '.chat-queue-list', '.chat-queue-item']],
      ['el-dm-chat-input', ['.chat-composer', '.chat-composer-input', '.chat-composer-actions']],
    ] as const) {
      const element = document.createElement(tag);
      container.append(element);
      expect(element.shadowRoot).not.toBeNull();
      for (const selector of selectors) {
        const declarations = styleDeclarations([expected], selector);
        expect(declarations.length).toBeGreaterThan(0);
        expect(styleDeclarations(element.shadowRoot!.adoptedStyleSheets, selector)).toEqual(
          declarations,
        );
      }
    }
  });
});
