import { expect, test, describe, beforeEach, afterEach } from 'bun:test';
import {
  ElDmChat,
  ElDmChatBubble,
  ElDmChatInput,
  ElDmChatReasoning,
  ElDmChatTool,
  ElDmChatTyping,
  register,
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

describe('chat elements', () => {
  let container: HTMLDivElement;

  function getAdoptedCSS(el: HTMLElement): string {
    return (el.shadowRoot?.adoptedStyleSheets ?? [])
      .map((sheet) =>
        Array.from(sheet.cssRules)
          .map((rule) => rule.cssText)
          .join('\n'),
      )
      .join('\n');
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  test('registers all chat elements', () => {
    expect(customElements.get('el-dm-chat')).toBe(ElDmChat);
    expect(customElements.get('el-dm-chat-bubble')).toBe(ElDmChatBubble);
    expect(customElements.get('el-dm-chat-input')).toBe(ElDmChatInput);
    expect(customElements.get('el-dm-chat-reasoning')).toBe(ElDmChatReasoning);
    expect(customElements.get('el-dm-chat-tool')).toBe(ElDmChatTool);
    expect(customElements.get('el-dm-chat-typing')).toBe(ElDmChatTyping);
  });

  test('renders chat message with alignment and bubble classes', () => {
    const el = document.createElement('el-dm-chat') as ElDmChat;
    el.align = 'end';
    el.color = 'primary';
    el.variant = 'filled';
    el.size = 'lg';
    el.streaming = true;
    el.textContent = 'Hello';
    container.appendChild(el);

    const chat = el.shadowRoot?.querySelector('.chat');
    const bubble = el.shadowRoot?.querySelector('.chat-bubble');

    expect(chat?.classList.contains('chat-end')).toBe(true);
    expect(bubble?.classList.contains('chat-bubble-primary')).toBe(true);
    expect(bubble?.classList.contains('chat-bubble-filled')).toBe(true);
    expect(bubble?.classList.contains('chat-bubble-lg')).toBe(true);
    expect(bubble?.classList.contains('chat-bubble-streaming')).toBe(true);
  });

  test('sets host text color for filled colored bubbles', () => {
    const el = document.createElement('el-dm-chat') as ElDmChat;
    el.color = 'primary';
    el.variant = 'filled';
    container.appendChild(el);

    const css = getAdoptedCSS(el);

    expect(css).toContain("variant='filled'");
    expect(css).toContain("color='primary'");
    expect(css).toContain('--color-primary-content');
    expect(css).toContain("color='success'");
    expect(css).toContain('--color-success-content');
  });

  test('renders avatar, status, and quick actions', async () => {
    const el = document.createElement('el-dm-chat') as ElDmChat;
    el.avatar = 'AI';
    el.author = 'Assistant';
    el.time = '12:04';
    el.status = 'sent';
    el.actions = 'Copy, Retry';
    container.appendChild(el);

    const avatar = el.shadowRoot?.querySelector('.chat-avatar');
    const header = el.shadowRoot?.querySelector('.chat-header');
    const footer = el.shadowRoot?.querySelector('.chat-footer');
    const actions = el.shadowRoot?.querySelectorAll('.chat-action');

    expect(avatar?.classList.contains('has-content')).toBe(true);
    expect(avatar?.textContent?.trim()).toBe('AI');
    expect(header?.textContent?.trim()).toBe('Assistant');
    expect(footer?.textContent).toContain('12:04');
    expect(footer?.textContent).toContain('sent');
    expect(actions?.length).toBe(2);
    expect(actions?.[0]?.getAttribute('aria-label')).toBe('Copy');
    expect(actions?.[0]?.textContent?.trim()).not.toBe('Copy');
    expect(actions?.[0]?.closest('el-dm-tooltip')?.getAttribute('content')).toBe('Copy');
    expect(customElements.get('el-dm-tooltip')).toBeDefined();

    const event = new Promise<CustomEvent>((resolve) => {
      el.addEventListener('quick-action', (quickActionEvent) =>
        resolve(quickActionEvent as CustomEvent),
      );
    });

    actions?.[0]?.dispatchEvent(new Event('click', { bubbles: true, composed: true }));

    const quickActionEvent = await event;
    expect(quickActionEvent.detail).toEqual({ action: 'copy', label: 'Copy' });
  });

  test('renders standalone bubble', () => {
    const el = document.createElement('el-dm-chat-bubble') as ElDmChatBubble;
    el.color = 'success';
    container.appendChild(el);

    const bubble = el.shadowRoot?.querySelector('.chat-bubble');
    expect(bubble?.classList.contains('chat-bubble-success')).toBe(true);
  });

  test('renders markdown content with markdown element', () => {
    const el = document.createElement('el-dm-chat') as ElDmChat;
    el.content = '**Hello** markdown';
    container.appendChild(el);

    const markdown = el.shadowRoot?.querySelector('el-dm-markdown');

    expect(markdown).toBeDefined();
    expect(markdown?.getAttribute('content')).toBe('**Hello** markdown');
  });

  test('renders text slot content through markdown element', () => {
    const el = document.createElement('el-dm-chat-bubble') as ElDmChatBubble;
    el.textContent = '**Slotted** markdown';
    container.appendChild(el);

    const markdown = el.shadowRoot?.querySelector('el-dm-markdown');
    const slotContent = el.shadowRoot?.querySelector<HTMLElement>('.chat-slot-content');

    expect(markdown?.hidden).toBe(false);
    expect(markdown?.getAttribute('content')).toBe('**Slotted** markdown');
    expect(slotContent?.hidden).toBe(true);
  });

  test('keeps element slot content slotted', () => {
    const el = document.createElement('el-dm-chat') as ElDmChat;
    const typing = document.createElement('el-dm-chat-typing');
    el.appendChild(typing);
    container.appendChild(el);

    const markdown = el.shadowRoot?.querySelector('el-dm-markdown');
    const slotContent = el.shadowRoot?.querySelector<HTMLElement>('.chat-slot-content');

    expect(markdown?.hidden).toBe(true);
    expect(slotContent?.hidden).toBe(false);
  });

  test('renders reasoning details', () => {
    const el = document.createElement('el-dm-chat-reasoning') as ElDmChatReasoning;
    el.summary = 'Thinking';
    el.open = true;
    container.appendChild(el);

    const details = el.shadowRoot?.querySelector('details');
    const summary = el.shadowRoot?.querySelector('summary');

    expect(details?.classList.contains('chat-reasoning')).toBe(true);
    expect(details?.hasAttribute('open')).toBe(true);
    expect(details?.getAttribute('part')).toBe('reasoning');
    expect(summary?.textContent?.trim()).toBe('Thinking');
  });

  test('supports tool calls inside reasoning', () => {
    const el = document.createElement('el-dm-chat-reasoning') as ElDmChatReasoning;
    const tool = document.createElement('el-dm-chat-tool') as ElDmChatTool;
    tool.setAttribute('slot', 'tools');
    tool.name = 'search';
    tool.status = 'success';
    el.appendChild(tool);
    container.appendChild(el);

    const tools = el.shadowRoot?.querySelector('.chat-reasoning-tools');
    const slot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="tools"]');

    expect(tools?.getAttribute('part')).toBe('tools');
    expect(slot?.assignedElements()).toEqual([tool]);
  });

  test('renders tool call status', () => {
    const el = document.createElement('el-dm-chat-tool') as ElDmChatTool;
    el.name = 'search';
    el.status = 'running';
    container.appendChild(el);

    const tool = el.shadowRoot?.querySelector('details');
    const status = el.shadowRoot?.querySelector('.chat-tool-status');

    expect(tool?.classList.contains('chat-tool-running')).toBe(true);
    expect(status?.textContent).toBe('running');
  });

  test('renders typing indicator', () => {
    const el = document.createElement('el-dm-chat-typing') as ElDmChatTyping;
    container.appendChild(el);

    expect(el.shadowRoot?.querySelector('.chat-typing')).toBeDefined();
  });

  test('renders markdown chat input and emits send event', async () => {
    const el = document.createElement('el-dm-chat-input') as ElDmChatInput;
    el.placeholder = 'Message';
    el.clearOnSend = true;
    container.appendChild(el);

    el.setValue('Hello **world**');

    const input = el.shadowRoot?.querySelector('el-dm-markdown-input');
    const button = el.shadowRoot?.querySelector('.chat-send');

    expect(input).toBeDefined();
    expect(input?.getAttribute('placeholder')).toBe('Message');
    expect(button?.closest('[slot="bottom-end"]')).toBeDefined();

    const event = new Promise<CustomEvent>((resolve) => {
      el.addEventListener('send', (sendEvent) => resolve(sendEvent as CustomEvent));
    });

    button?.dispatchEvent(new Event('click', { bubbles: true, composed: true }));

    const sendEvent = await event;
    expect(sendEvent.detail).toEqual({ value: 'Hello **world**' });
    expect(el.getValue()).toBe('');
  });

  test('sends from markdown chat input on ctrl enter', async () => {
    const el = document.createElement('el-dm-chat-input') as ElDmChatInput;
    container.appendChild(el);

    el.setValue('Keyboard send');

    const event = new Promise<CustomEvent>((resolve) => {
      el.addEventListener('send', (sendEvent) => resolve(sendEvent as CustomEvent));
    });

    el.shadowRoot?.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        bubbles: true,
        composed: true,
      }),
    );

    const sendEvent = await event;
    expect(sendEvent.detail).toEqual({ value: 'Keyboard send' });
  });

  test('sends from markdown chat input on cmd enter', async () => {
    const el = document.createElement('el-dm-chat-input') as ElDmChatInput;
    container.appendChild(el);

    el.setValue('Mac keyboard send');

    const event = new Promise<CustomEvent>((resolve) => {
      el.addEventListener('send', (sendEvent) => resolve(sendEvent as CustomEvent));
    });

    el.shadowRoot?.dispatchEvent(
      new window.KeyboardEvent('keydown', {
        key: 'Enter',
        metaKey: true,
        bubbles: true,
        composed: true,
      }),
    );

    const sendEvent = await event;
    expect(sendEvent.detail).toEqual({ value: 'Mac keyboard send' });
  });
});
