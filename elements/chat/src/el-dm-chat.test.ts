import { expect, test, describe, beforeEach, afterEach, mock } from 'bun:test';
import {
  ElDmChat,
  ElDmChatBubble,
  ElDmChatInput,
  ElDmChatReasoning,
  ElDmChatScroll,
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
    expect(customElements.get('el-dm-chat-scroll')).toBe(ElDmChatScroll);
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
    const content = el.shadowRoot?.querySelector('.chat-bubble-content');

    expect(chat?.classList.contains('chat-end')).toBe(true);
    expect(bubble?.classList.contains('chat-bubble-primary')).toBe(true);
    expect(bubble?.classList.contains('chat-bubble-filled')).toBe(true);
    expect(bubble?.classList.contains('chat-bubble-lg')).toBe(true);
    expect(bubble?.classList.contains('chat-bubble-streaming')).toBe(false);
    expect(content?.classList.contains('chat-bubble-streaming')).toBe(true);
  });

  test('uses the DuskMoonUI 1.18 chat selectors', () => {
    const el = document.createElement('el-dm-chat-scroll') as ElDmChatScroll;
    container.appendChild(el);

    const adoptedCSS = getAdoptedCSS(el);

    expect(adoptedCSS).toContain('.chat-scroll');
    expect(adoptedCSS).toContain('.chat-scroll-indicator');
    expect(adoptedCSS).toContain('.chat-bubble-content');
  });

  test('maps a valid timeline to the internal message row', () => {
    const el = document.createElement('el-dm-chat') as ElDmChat;
    el.timeline = 3;
    container.appendChild(el);

    const chat = el.shadowRoot?.querySelector('.chat');

    expect(el.getAttribute('timeline')).toBe('3');
    expect(chat?.getAttribute('data-chat-tl')).toBe('3');
  });

  test('omits invalid timelines from the internal message row', () => {
    const el = document.createElement('el-dm-chat') as ElDmChat;
    el.timeline = 25 as never;
    container.appendChild(el);

    expect(el.shadowRoot?.querySelector('.chat')?.hasAttribute('data-chat-tl')).toBe(false);
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

  test('nests reasoning and tools before final streaming content', () => {
    for (const tag of ['el-dm-chat', 'el-dm-chat-bubble'] as const) {
      const el = document.createElement(tag) as ElDmChat | ElDmChatBubble;
      const reasoning = document.createElement('el-dm-chat-reasoning');
      const tool = document.createElement('el-dm-chat-tool');

      reasoning.slot = 'reasoning';
      tool.slot = 'tools';
      el.content = 'Final **answer**';
      el.streaming = true;
      el.append(reasoning, tool);
      container.appendChild(el);

      const bubble = el.shadowRoot?.querySelector('.chat-bubble');
      const content = el.shadowRoot?.querySelector('.chat-bubble-content');
      const reasoningSlot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="reasoning"]');
      const toolsSlot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="tools"]');
      const markdown = content?.querySelector('el-dm-markdown');

      expect(reasoningSlot?.assignedElements()).toEqual([reasoning]);
      expect(toolsSlot?.assignedElements()).toEqual([tool]);
      expect(content?.getAttribute('part')).toBe('bubble-content');
      expect(content?.classList.contains('chat-bubble-streaming')).toBe(true);
      expect(bubble?.classList.contains('chat-bubble-streaming')).toBe(false);
      expect(markdown?.hasAttribute('streaming')).toBe(true);
    }
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
    expect(tools?.closest('.chat-reasoning-body')).toBeDefined();
    expect(slot?.assignedElements()).toEqual([tool]);
  });

  test('renders scroll indicators for timeline-mapped assistant messages', async () => {
    const el = document.createElement('el-dm-chat-scroll') as ElDmChatScroll;
    const assistant = document.createElement('el-dm-chat') as ElDmChat;
    const user = document.createElement('el-dm-chat') as ElDmChat;
    const invalid = document.createElement('el-dm-chat') as ElDmChat;

    assistant.timeline = 2;
    assistant.author = 'Assistant';
    user.align = 'end';
    user.timeline = 3;
    invalid.timeline = 25 as never;
    el.append(assistant, user, invalid);
    container.appendChild(el);
    await Promise.resolve();

    const scroller = el.shadowRoot?.querySelector('.chat-scroll');
    const track = el.shadowRoot?.querySelector('.chat-scroll-track');
    const body = el.shadowRoot?.querySelector('.chat-scroll-body');
    const buttons = el.shadowRoot?.querySelectorAll<HTMLButtonElement>('.chat-scroll-indicator');
    const slot = body?.querySelector<HTMLSlotElement>('slot');

    expect(scroller?.getAttribute('part')).toBe('scroll');
    expect(track?.getAttribute('part')).toBe('track');
    expect(body?.getAttribute('part')).toBe('body');
    expect(slot?.assignedElements()).toEqual([assistant, user, invalid]);
    expect(buttons?.length).toBe(1);
    expect(buttons?.[0]?.type).toBe('button');
    expect(buttons?.[0]?.getAttribute('part')).toBe('indicator');
    expect(buttons?.[0]?.getAttribute('data-chat-tl')).toBe('2');
    expect(buttons?.[0]?.getAttribute('data-chat-target')).toBe(assistant.id);
    expect(buttons?.[0]?.getAttribute('aria-controls')).toBe(assistant.id);
    expect(buttons?.[0]?.getAttribute('aria-label')).toContain('1');

    assistant.id = 'renamed-assistant-reply';
    await Promise.resolve();

    const updatedButton = el.shadowRoot?.querySelector<HTMLButtonElement>('.chat-scroll-indicator');
    expect(updatedButton?.dataset.chatTarget).toBe('renamed-assistant-reply');
    expect(updatedButton?.getAttribute('aria-controls')).toBe('renamed-assistant-reply');
  });

  test('keeps indicator navigation inside the transcript panel', async () => {
    const el = document.createElement('el-dm-chat-scroll') as ElDmChatScroll;
    const assistant = document.createElement('el-dm-chat') as ElDmChat;
    assistant.timeline = 1;
    el.appendChild(assistant);
    container.appendChild(el);
    await Promise.resolve();

    const scroller = el.shadowRoot?.querySelector<HTMLElement>('.chat-scroll');
    const button = el.shadowRoot?.querySelector<HTMLButtonElement>('.chat-scroll-indicator');
    const scrollTo = mock(() => {});

    if (!scroller || !button) throw new Error('Expected chat scroll controls');

    scroller.scrollTop = 40;
    scroller.scrollTo = scrollTo;
    scroller.getBoundingClientRect = () => ({ top: 100 }) as DOMRect;
    assistant.getBoundingClientRect = () => ({ top: 340 }) as DOMRect;

    const click = new window.MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      composed: true,
    });
    button.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenCalledWith({ top: 280 });
  });

  test('allows indicator navigation to be canceled', async () => {
    const el = document.createElement('el-dm-chat-scroll') as ElDmChatScroll;
    const assistant = document.createElement('el-dm-chat') as ElDmChat;
    assistant.timeline = 4;
    el.appendChild(assistant);
    container.appendChild(el);
    await Promise.resolve();

    const scroller = el.shadowRoot?.querySelector<HTMLElement>('.chat-scroll');
    const button = el.shadowRoot?.querySelector<HTMLButtonElement>('.chat-scroll-indicator');
    const scrollTo = mock(() => {});
    let detail: CustomEvent['detail'];

    if (!scroller || !button) throw new Error('Expected chat scroll controls');
    scroller.scrollTo = scrollTo;
    el.addEventListener('navigate', (event) => {
      detail = (event as CustomEvent).detail;
      event.preventDefault();
    });

    button.click();

    expect(detail).toEqual({ timeline: 4, index: 0, target: assistant });
    expect(scrollTo).not.toHaveBeenCalled();
  });

  test('uses the last assistant when timeline values are duplicated', async () => {
    const el = document.createElement('el-dm-chat-scroll') as ElDmChatScroll;
    const first = document.createElement('el-dm-chat') as ElDmChat;
    const last = document.createElement('el-dm-chat') as ElDmChat;
    first.timeline = 1;
    last.timeline = 1;
    el.append(first, last);
    container.appendChild(el);
    await Promise.resolve();

    const buttons = el.shadowRoot?.querySelectorAll<HTMLButtonElement>('.chat-scroll-indicator');

    expect(buttons?.length).toBe(1);
    expect(buttons?.[0]?.dataset.chatTarget).toBe(last.id);
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

  test('forwards chat input id and name to the markdown textarea', () => {
    const el = document.createElement('el-dm-chat-input') as ElDmChatInput;
    el.name = 'content';
    container.appendChild(el);

    const input = el.shadowRoot?.querySelector('el-dm-markdown-input');
    const textarea = input?.shadowRoot?.querySelector('textarea');

    expect(textarea?.hasAttribute('id')).toBe(false);
    expect(textarea?.getAttribute('name')).toBe('content');

    el.id = 'message-input';
    expect(textarea?.id).toBe('message-input-editor');

    el.id = 'renamed-input';
    expect(textarea?.id).toBe('renamed-input-editor');

    el.removeAttribute('id');
    expect(textarea?.hasAttribute('id')).toBe(false);
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
