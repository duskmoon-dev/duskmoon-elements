/**
 * DuskMoon Chat Elements
 *
 * LLM-oriented chat primitives backed by @duskmoon-dev/core chat styles.
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as chatCSS } from '@duskmoon-dev/core/components/chat';
import { register as registerMarkdown } from '@duskmoon-dev/el-markdown';
import { register as registerMarkdownInput } from '@duskmoon-dev/el-markdown-input';
import { register as registerTooltip } from '@duskmoon-dev/el-tooltip';

export type ChatAlign = 'start' | 'end';
export type ChatBubbleColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';
export type ChatBubbleSize = 'xs' | 'sm' | 'md' | 'lg';
export type ChatBubbleVariant = 'tonal' | 'filled';
export type ChatToolStatus = 'pending' | 'running' | 'success' | 'error';
export interface ChatQuickActionEventDetail {
  action: string;
  label: string;
}
export interface ChatSendEventDetail {
  value: string;
}

interface MarkdownInputElement extends HTMLElement {
  value: string;
  getValue(): string;
  setValue(value: string): void;
}

interface MarkdownElement extends HTMLElement {
  content: string;
}

const ALIGN_CLASSES: Record<string, string> = {
  start: 'chat-start',
  end: 'chat-end',
};

const BUBBLE_COLOR_CLASSES: Record<string, string> = {
  primary: 'chat-bubble-primary',
  secondary: 'chat-bubble-secondary',
  tertiary: 'chat-bubble-tertiary',
  info: 'chat-bubble-info',
  success: 'chat-bubble-success',
  warning: 'chat-bubble-warning',
  error: 'chat-bubble-error',
};

const BUBBLE_SIZE_CLASSES: Record<string, string> = {
  xs: 'chat-bubble-xs',
  sm: 'chat-bubble-sm',
  md: 'chat-bubble-md',
  lg: 'chat-bubble-lg',
};

const TOOL_STATUS_CLASSES: Record<string, string> = {
  pending: 'chat-tool-pending',
  running: 'chat-tool-running',
  success: 'chat-tool-success',
  error: 'chat-tool-error',
};

const coreStyles = chatCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
    font-family: inherit;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}

  :host([variant='filled'][color='primary']) {
    color: var(--color-primary-content);
  }

  :host([variant='filled'][color='secondary']) {
    color: var(--color-secondary-content);
  }

  :host([variant='filled'][color='tertiary']) {
    color: var(--color-tertiary-content);
  }

  :host([variant='filled'][color='info']) {
    color: var(--color-info-content);
  }

  :host([variant='filled'][color='success']) {
    color: var(--color-success-content);
  }

  :host([variant='filled'][color='warning']) {
    color: var(--color-warning-content);
  }

  :host([variant='filled'][color='error']) {
    color: var(--color-error-content);
  }

  .chat-avatar,
  .chat-header,
  .chat-footer,
  .chat-actions,
  .chat-tool-call,
  .chat-tool-result {
    display: none;
  }

  .chat-avatar.has-content {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 999px;
    background-color: var(--color-surface-container-high);
    color: var(--color-on-surface);
    font-size: 0.75rem;
    font-weight: 700;
    overflow: hidden;
    text-transform: uppercase;
  }

  .chat-header.has-content,
  .chat-footer.has-content,
  .chat-actions.has-content {
    display: block;
  }

  .chat-header,
  .chat-footer {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .chat-status {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }

  .chat-status::before {
    content: '';
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 999px;
    background-color: currentColor;
    opacity: 0.75;
  }

  .chat-actions {
    margin-top: 0.25rem;
  }

  .chat-actions-inner {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .chat-action-tooltip {
    display: inline-flex;
  }

  .chat-action {
    appearance: none;
    border: 1px solid var(--color-outline-variant);
    border-radius: 999px;
    background-color: var(--color-surface-container-low);
    color: var(--color-on-surface);
    cursor: pointer;
    display: inline-grid;
    place-items: center;
    font: inherit;
    font-size: 0.875rem;
    line-height: 1;
    width: 1.875rem;
    height: 1.875rem;
    padding: 0;
  }

  .chat-action:hover {
    background-color: var(--color-surface-container);
    border-color: var(--color-outline);
  }

  .chat-action:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-primary) 25%, transparent);
  }

  .chat-tool-call.has-content,
  .chat-tool-result.has-content {
    display: block;
  }

  .chat-bubble {
    font-family: inherit;
  }

  .chat-reasoning {
    padding-inline: 1rem;
  }

  .chat-reasoning > summary {
    margin-inline: -1rem;
    padding-inline: 1rem;
  }

  .chat-reasoning-body {
    color: var(--color-on-surface-variant);
    font-style: italic;
  }

  .chat-reasoning-tools {
    display: grid;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
  }

  .chat-reasoning-body ::slotted(el-dm-chat-tool),
  .chat-reasoning-tools ::slotted(el-dm-chat-tool) {
    width: 100%;
    font-style: normal;
    color: var(--color-on-surface);
  }

  .chat-reasoning-body ::slotted(el-dm-chat-tool) {
    margin-top: 0.5rem;
  }

  .chat-markdown {
    display: block;
  }

  .chat-markdown[hidden],
  .chat-slot-content[hidden] {
    display: none;
  }

  .chat-markdown::part(content) {
    color: inherit;
  }

  .chat-markdown::part(content) > :first-child {
    margin-top: 0;
  }

  .chat-markdown::part(content) > :last-child {
    margin-bottom: 0;
  }

  .chat-typing {
    color: inherit;
  }

  .chat-input {
    display: block;
  }

  .chat-input-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .chat-input-editor {
    display: block;
    width: 100%;
    min-height: 12rem;
    --md-radius: 6px;
  }

  .chat-send {
    appearance: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid var(--color-outline-variant);
    border-radius: 3px;
    background-color: var(--color-surface-container-low);
    color: var(--color-on-surface);
    cursor: pointer;
    font: inherit;
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1;
    min-height: 2rem;
    padding: 0.5rem 0.875rem;
  }

  .chat-send:hover {
    background-color: var(--color-surface-container);
    border-color: var(--color-outline);
  }

  .chat-send:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px color-mix(in oklch, var(--color-primary) 25%, transparent);
  }

  .chat-send:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

function getChatClasses(align: ChatAlign | undefined): string {
  return ['chat', ALIGN_CLASSES[align || 'start'] || 'chat-start'].join(' ');
}

function getBubbleClasses(
  color: ChatBubbleColor | undefined,
  size: ChatBubbleSize | undefined,
  variant: ChatBubbleVariant | undefined,
  streaming: boolean,
): string {
  const classes = ['chat-bubble'];

  if (color && BUBBLE_COLOR_CLASSES[color]) {
    classes.push(BUBBLE_COLOR_CLASSES[color]);
  }

  if (size && BUBBLE_SIZE_CLASSES[size]) {
    classes.push(BUBBLE_SIZE_CLASSES[size]);
  }

  if (variant === 'filled') {
    classes.push('chat-bubble-filled');
  }

  if (streaming) {
    classes.push('chat-bubble-streaming');
  }

  return classes.join(' ');
}

function syncSlotContent(shadowRoot: ShadowRoot): void {
  shadowRoot.querySelectorAll('slot').forEach((slot) => {
    const wrapper = slot.parentElement;
    if (!wrapper) return;

    const hasAssignedContent = slot
      .assignedNodes({ flatten: true })
      .some((node) => node.nodeType !== 3 || node.textContent?.trim());
    const hasFallbackContent = Array.from(wrapper.childNodes).some(
      (node) => node !== slot && (node.nodeType !== 3 || node.textContent?.trim()),
    );

    wrapper.classList.toggle('has-content', Boolean(hasAssignedContent || hasFallbackContent));
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getQuickActions(actions: string | undefined): string[] {
  if (!actions) return [];
  return actions
    .split(',')
    .map((action) => action.trim())
    .filter(Boolean);
}

function getActionId(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getActionIcon(label: string): string {
  const icons: Record<string, string> = {
    copy: '&#x2398;',
    regenerate: '&#x21bb;',
    retry: '&#x21bb;',
    edit: '&#x270e;',
    stop: '&#x25a0;',
    delete: '&#x2715;',
    remove: '&#x2715;',
    share: '&#x2197;',
    download: '&#x2b07;',
  };

  return icons[getActionId(label)] || '&#x22ef;';
}

function renderMarkdownContent(content: string | undefined): string {
  return `
    <el-dm-markdown
      class="chat-markdown"
      part="content"
      content="${escapeHtml(content || '')}"
    ></el-dm-markdown>
    <div class="chat-slot-content" part="slot-content">
      <slot></slot>
    </div>
  `;
}

function syncMarkdownContent(shadowRoot: ShadowRoot, content: string | undefined): void {
  const markdown = shadowRoot.querySelector<MarkdownElement>('el-dm-markdown');
  const slot = shadowRoot.querySelector<HTMLSlotElement>('.chat-slot-content slot');
  const slotContent = shadowRoot.querySelector<HTMLElement>('.chat-slot-content');

  if (!markdown || !slot || !slotContent) return;

  if (content) {
    markdown.content = content;
    markdown.setAttribute('content', content);
    markdown.hidden = false;
    slotContent.hidden = true;
    return;
  }

  const assignedNodes = slot.assignedNodes({ flatten: true }).filter((node) => {
    return node.nodeType !== 3 || Boolean(node.textContent?.trim());
  });
  const hasElementContent = assignedNodes.some((node) => node.nodeType === 1);
  const textContent = assignedNodes
    .map((node) => node.textContent || '')
    .join('')
    .trim();

  if (textContent && !hasElementContent) {
    markdown.content = textContent;
    markdown.setAttribute('content', textContent);
    markdown.hidden = false;
    slotContent.hidden = true;
    return;
  }

  markdown.hidden = true;
  slotContent.hidden = false;
}

export class ElDmChat extends BaseElement {
  static properties = {
    align: { type: String, reflect: true, default: 'start' },
    color: { type: String, reflect: true },
    size: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    streaming: { type: Boolean, reflect: true },
    avatar: { type: String, reflect: true },
    author: { type: String, reflect: true },
    time: { type: String, reflect: true },
    status: { type: String, reflect: true },
    actions: { type: String, reflect: true },
    content: { type: String, reflect: true },
  };

  declare align: ChatAlign;
  declare color: ChatBubbleColor;
  declare size: ChatBubbleSize;
  declare variant: ChatBubbleVariant;
  declare streaming: boolean;
  declare avatar: string;
  declare author: string;
  declare time: string;
  declare status: string;
  declare actions: string;
  declare content: string;

  constructor() {
    super();
    registerMarkdown();
    registerTooltip();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot.addEventListener('slotchange', this._handleSlotChange);
    this.shadowRoot.addEventListener('click', this._handleClick);
    syncSlotContent(this.shadowRoot);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.shadowRoot.removeEventListener('slotchange', this._handleSlotChange);
    this.shadowRoot.removeEventListener('click', this._handleClick);
  }

  private _handleSlotChange = (): void => {
    syncSlotContent(this.shadowRoot);
    syncMarkdownContent(this.shadowRoot, this.content);
  };

  private _handleClick = (event: Event): void => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('.chat-action');
    if (!button) return;

    this.emit<ChatQuickActionEventDetail>('quick-action', {
      action: button.dataset.action || '',
      label: button.dataset.label || '',
    });
  };

  private _renderHeader(): string {
    const author = this.author ? `<span class="chat-author">${escapeHtml(this.author)}</span>` : '';
    return `
      <div class="chat-header ${this.author ? 'has-content' : ''}" part="header">
        ${author}
        <slot name="header"></slot>
      </div>
    `;
  }

  private _renderFooter(): string {
    const time = this.time ? `<span class="chat-time">${escapeHtml(this.time)}</span>` : '';
    const status = this.status
      ? `<span class="chat-status" part="status">${escapeHtml(this.status)}</span>`
      : '';

    return `
      <div class="chat-footer ${this.time || this.status ? 'has-content' : ''}" part="footer">
        ${time}
        ${status}
        <slot name="footer"></slot>
      </div>
    `;
  }

  private _renderActions(): string {
    const actions = getQuickActions(this.actions);
    const actionButtons = actions
      .map((label) => {
        const escapedLabel = escapeHtml(label);
        return `
          <el-dm-tooltip class="chat-action-tooltip" content="${escapedLabel}" position="top">
            <button class="chat-action" part="action" type="button" aria-label="${escapedLabel}" data-action="${escapeHtml(getActionId(label))}" data-label="${escapedLabel}">${getActionIcon(label)}</button>
          </el-dm-tooltip>
        `;
      })
      .join('');

    return `
      <div class="chat-actions ${actions.length > 0 ? 'has-content' : ''}" part="actions">
        <div class="chat-actions-inner">
          ${actionButtons}
          <slot name="actions"></slot>
        </div>
      </div>
    `;
  }

  protected update(): void {
    super.update();
    syncSlotContent(this.shadowRoot);
    syncMarkdownContent(this.shadowRoot, this.content);
  }

  render(): string {
    const avatar = this.avatar ? escapeHtml(this.avatar) : '';

    return `
      <div class="${getChatClasses(this.align)}" part="chat">
        <div class="chat-avatar ${this.avatar ? 'has-content' : ''}" part="avatar">
          ${avatar}
          <slot name="avatar"></slot>
        </div>
        ${this._renderHeader()}
        <div class="${getBubbleClasses(this.color, this.size, this.variant, this.streaming)}" part="bubble">
          ${renderMarkdownContent(this.content)}
        </div>
        ${this._renderFooter()}
        ${this._renderActions()}
      </div>
    `;
  }
}

export class ElDmChatBubble extends BaseElement {
  static properties = {
    align: { type: String, reflect: true, default: 'start' },
    color: { type: String, reflect: true },
    size: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    streaming: { type: Boolean, reflect: true },
    content: { type: String, reflect: true },
  };

  declare align: ChatAlign;
  declare color: ChatBubbleColor;
  declare size: ChatBubbleSize;
  declare variant: ChatBubbleVariant;
  declare streaming: boolean;
  declare content: string;

  constructor() {
    super();
    registerMarkdown();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot.addEventListener('slotchange', this._handleSlotChange);
    syncMarkdownContent(this.shadowRoot, this.content);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.shadowRoot.removeEventListener('slotchange', this._handleSlotChange);
  }

  private _handleSlotChange = (): void => {
    syncMarkdownContent(this.shadowRoot, this.content);
  };

  protected update(): void {
    super.update();
    syncMarkdownContent(this.shadowRoot, this.content);
  }

  render(): string {
    return `
      <div class="${getChatClasses(this.align)}" part="chat">
        <div class="${getBubbleClasses(this.color, this.size, this.variant, this.streaming)}" part="bubble">
          ${renderMarkdownContent(this.content)}
        </div>
      </div>
    `;
  }
}

export class ElDmChatReasoning extends BaseElement {
  static properties = {
    summary: { type: String, reflect: true, default: 'Reasoning' },
    open: { type: Boolean, reflect: true },
  };

  declare summary: string;
  declare open: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    return `
      <details class="chat-reasoning" part="reasoning" ${this.open ? 'open' : ''}>
        <summary part="summary">
          <slot name="summary">${this.summary || 'Reasoning'}</slot>
        </summary>
        <div class="chat-reasoning-body" part="body">
          <slot></slot>
        </div>
        <div class="chat-reasoning-tools" part="tools">
          <slot name="tool"></slot>
          <slot name="tools"></slot>
        </div>
      </details>
    `;
  }
}

export class ElDmChatTool extends BaseElement {
  static properties = {
    name: { type: String, reflect: true },
    status: { type: String, reflect: true, default: 'pending' },
    open: { type: Boolean, reflect: true },
  };

  declare name: string;
  declare status: ChatToolStatus;
  declare open: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot.addEventListener('slotchange', this._handleSlotChange);
    syncSlotContent(this.shadowRoot);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.shadowRoot.removeEventListener('slotchange', this._handleSlotChange);
  }

  private _handleSlotChange = (): void => {
    syncSlotContent(this.shadowRoot);
  };

  private _getToolClasses(): string {
    const classes = ['chat-tool'];
    classes.push(TOOL_STATUS_CLASSES[this.status] || 'chat-tool-pending');
    return classes.join(' ');
  }

  render(): string {
    const status = this.status || 'pending';

    return `
      <details class="${this._getToolClasses()}" part="tool" ${this.open ? 'open' : ''}>
        <summary class="chat-tool-header" part="header">
          <slot name="name">${this.name || 'tool'}</slot>
          <span class="chat-tool-status" part="status">${status}</span>
        </summary>
        <div class="chat-tool-call" part="call">
          <slot name="call"></slot>
        </div>
        <div class="chat-tool-result" part="result">
          <slot name="result"></slot>
        </div>
        <slot></slot>
      </details>
    `;
  }
}

export class ElDmChatTyping extends BaseElement {
  constructor() {
    super();
    this.attachStyles(styles);
  }

  render(): string {
    return `
      <span class="chat-typing" part="typing" aria-label="Typing">
        <span></span>
      </span>
    `;
  }
}

export class ElDmChatInput extends BaseElement {
  static properties = {
    name: { type: String, reflect: true, default: '' },
    value: { type: String },
    placeholder: {
      type: String,
      reflect: true,
      default: 'Send a message... (Ctrl/Cmd+Enter to send)',
    },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    sendLabel: { type: String, reflect: true, attribute: 'send-label', default: 'Send' },
    clearOnSend: { type: Boolean, reflect: true, attribute: 'clear-on-send' },
  };

  declare name: string;
  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare readonly: boolean;
  declare sendLabel: string;
  declare clearOnSend: boolean;

  constructor() {
    super();
    registerMarkdownInput();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot.addEventListener('click', this._handleClick);
    this.shadowRoot.addEventListener('keydown', this._handleKeyDown);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.shadowRoot.removeEventListener('click', this._handleClick);
    this.shadowRoot.removeEventListener('keydown', this._handleKeyDown);
  }

  getValue(): string {
    return this._getInput()?.getValue() ?? this.value ?? '';
  }

  setValue(value: string): void {
    this.value = value;
    this._getInput()?.setValue(value);
  }

  private _getInput(): MarkdownInputElement | null {
    return this.shadowRoot.querySelector<MarkdownInputElement>('el-dm-markdown-input');
  }

  private _handleClick = (event: Event): void => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('.chat-send');
    if (!button || button.disabled) return;

    this._send();
  };

  private _handleKeyDown = (event: Event): void => {
    const keyboardEvent = event as KeyboardEvent;
    if (
      keyboardEvent.key !== 'Enter' ||
      (!keyboardEvent.ctrlKey && !keyboardEvent.metaKey) ||
      keyboardEvent.shiftKey
    ) {
      return;
    }
    if (this.disabled || this.readonly) return;

    keyboardEvent.preventDefault();
    this._send();
  };

  private _send(): void {
    const value = this.getValue();
    this.emit<ChatSendEventDetail>('send', { value });

    if (this.clearOnSend) {
      this.setValue('');
    }
  }

  render(): string {
    return `
      <div class="chat-input" part="input">
        <el-dm-markdown-input
          class="chat-input-editor"
          part="editor"
          name="${escapeHtml(this.name || '')}"
          value="${escapeHtml(this.value || '')}"
          placeholder="${escapeHtml(this.placeholder || 'Send a message... (Ctrl/Cmd+Enter to send)')}"
          resize="vertical"
          no-preview
          ${this.disabled ? 'disabled' : ''}
          ${this.readonly ? 'readonly' : ''}
        >
          <div class="chat-input-actions" part="actions" slot="bottom-end">
            <button
              class="chat-send"
              part="send"
              type="button"
              ${this.disabled || this.readonly ? 'disabled' : ''}
            >
              <span aria-hidden="true">&#9658;</span>
              ${escapeHtml(this.sendLabel || 'Send')}
            </button>
          </div>
        </el-dm-markdown-input>
      </div>
    `;
  }
}
