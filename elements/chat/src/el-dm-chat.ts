/**
 * DuskMoon Chat Elements
 *
 * LLM-oriented chat primitives backed by @duskmoon-dev/core chat styles.
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as chatCSS } from '@duskmoon-dev/core/components/chat';
import { css as buttonCSS } from '@duskmoon-dev/core/components/button';
import { css as avatarCSS } from '@duskmoon-dev/core/components/avatar';
import { register as registerMarkdown } from '@duskmoon-dev/el-markdown';
import { register as registerMarkdownInput } from '@duskmoon-dev/el-markdown-input';
import { register as registerTooltip } from '@duskmoon-dev/el-tooltip';

export type ChatAlign = 'start' | 'end';
export type ChatBubbleColor =
  'primary' | 'secondary' | 'tertiary' | 'info' | 'success' | 'warning' | 'error';
export type ChatBubbleSize = 'xs' | 'sm' | 'md' | 'lg';
export type ChatBubbleVariant = 'tonal' | 'filled';
export type ChatTimeline =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24;
export type ChatToolStatus = 'pending' | 'running' | 'success' | 'error';
export interface ChatNavigateEventDetail {
  timeline: ChatTimeline;
  index: number;
  target: ElDmChat;
}
export interface ChatQuickActionEventDetail {
  action: string;
  label: string;
}
export type ChatComposerColor = ChatBubbleColor | 'ghost';
export interface ChatQueueItem {
  id: string;
  content: string;
  active?: boolean;
  attachment?: string;
  attachmentAlt?: string;
}
export interface ChatQueueActionEventDetail {
  item: ChatQueueItem;
  index: number;
}
export interface ChatSendEventDetail {
  value: string;
  files: File[];
}

interface MarkdownInputElement extends HTMLElement {
  value: string;
  getValue(): string;
  setValue(value: string): void;
  getFiles(): File[];
  removeFile(index: number): void;
}

interface MarkdownElement extends HTMLElement {
  content: string;
  setContent(content: string): void;
  startStreaming(): void;
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
const buttonStyles = buttonCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const avatarStyles = avatarCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');
const queueSlotStyles = Array.from(
  coreStyles.matchAll(/\.chat-input-area > \.chat-queue[^{}]*\{[^{}]*\}/g),
  ([rule]) =>
    rule.replace(/\.chat-input-area > \.chat-queue/g, ":host([slot='queue']) .chat-queue"),
).join('\n');
const timelineHostStyles = Array.from({ length: 24 }, (_, index) => {
  const timeline = index + 1;
  return `
    slot::slotted(el-dm-chat:not([align='end'])[timeline='${timeline}']) {
      view-timeline-name: --chat-${timeline};
      view-timeline-axis: block;
      scroll-margin-block-start: 0.5rem;
    }
  `;
}).join('\n');

// A part cannot select its children; trim Markdown's outer block margins inside its shadow root.
const markdownEdgeStyles = css`
  .markdown-body > :first-child {
    margin-block-start: 0;
  }

  .markdown-body > :last-child {
    margin-block-end: 0;
  }
`;

const styles = css`
  :host {
    display: block;
    min-inline-size: 0;
    font-family: inherit;
  }

  :host([hidden]) {
    display: none !important;
  }

  ${coreStyles}
  ${buttonStyles}
  ${avatarStyles}
  ${queueSlotStyles}

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

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
  }

  .chat-header.has-content,
  .chat-footer.has-content {
    display: block;
  }

  .chat-actions.has-content {
    display: flex;
  }

  .chat-actions-inner {
    display: contents;
  }

  .chat-action-tooltip {
    display: inline-flex;
  }

  .chat-tool-call.has-content,
  .chat-tool-result.has-content {
    display: block;
  }

  .chat-bubble {
    font-family: inherit;
  }

  slot[name='reasoning']::slotted(el-dm-chat-reasoning),
  slot[name='tool']::slotted(el-dm-chat-tool),
  slot[name='tools']::slotted(el-dm-chat-tool) {
    width: 100%;
    max-width: none;
  }

  .chat-bubble-content.chat-bubble-streaming:has(.chat-markdown:not([hidden]))::after,
  .chat-content.chat-streaming:has(.chat-markdown:not([hidden]))::after {
    content: none;
  }

  slot[name='work']::slotted(el-dm-chat-work),
  .chat-work-body slot::slotted(el-dm-chat-reasoning),
  .chat-work-body slot::slotted(el-dm-chat-tool) {
    width: 100%;
    max-width: none;
  }

  .chat > slot::slotted(*) {
    grid-column: 2;
    justify-self: start;
    max-width: 100%;
    margin-bottom: 0.25rem;
  }

  .chat-end > slot::slotted(*) {
    grid-column: 1;
    justify-self: end;
  }

  .chat-agent:not(:has(> .chat-avatar)) > slot::slotted(*) {
    grid-column: 1;
  }

  .chat-markdown {
    display: block;
    font: inherit;
    white-space: normal;
  }

  .chat-markdown[hidden],
  .chat-slot-content[hidden] {
    display: none;
  }

  .chat-markdown::part(content) {
    color: inherit;
    font: inherit;
  }

  .chat-typing {
    color: inherit;
  }

  .chat-input-editor {
    --md-editor-min-height: var(--dm-chat-editor-min-height, 3rem);
    --md-editor-max-height: var(--dm-chat-editor-max-height, 24rem);
    --md-border: transparent;
    --md-border-focus: transparent;
    --md-bg: transparent;
    --md-bg-toolbar: transparent;
    --md-radius: 0;
    --md-text: var(--color-on-surface);
  }

  .chat-input-editor::part(editor) {
    border: 0;
    outline: none;
    background: transparent;
    min-height: var(--dm-chat-editor-min-height, 3rem);
  }

  .chat-input-editor::part(write-area) {
    min-height: var(--dm-chat-editor-min-height, 3rem);
  }

  .chat-input-editor::part(textarea),
  .chat-input-editor::part(render-layer) {
    padding: 0;
    font: inherit;
    line-height: inherit;
  }

  .chat-input-editor::part(status-bar) {
    border: 0;
    background: transparent;
    padding: 0;
    flex-wrap: wrap;
  }

  .chat-input-editor::part(status-end) {
    min-inline-size: 0;
    max-inline-size: 100%;
    margin-inline-start: auto;
  }

  .chat-input-actions {
    min-inline-size: 0;
  }
`;

const scrollStyles = css`
  :host {
    display: block;
    min-height: 0;
    min-inline-size: 0;
    font-family: inherit;
  }

  ${coreStyles}

  ${timelineHostStyles}

  .chat-scroll {
    width: 100%;
    height: 100%;
    max-height: inherit;
  }

  .chat-scroll.chat-scroll-empty {
    grid-template-columns: minmax(0, 1fr);
    column-gap: 0;
  }

  .chat-scroll-track[hidden] {
    display: none;
  }
`;

function getChatClasses(align: ChatAlign | undefined, agent = false): string {
  return ['chat', ALIGN_CLASSES[align || 'start'] || 'chat-start', agent ? 'chat-agent' : '']
    .filter(Boolean)
    .join(' ');
}

function getBubbleClasses(
  color: ChatBubbleColor | undefined,
  size: ChatBubbleSize | undefined,
  variant: ChatBubbleVariant | undefined,
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

  return classes.join(' ');
}

function isChatTimeline(value: unknown): value is ChatTimeline {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 24;
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

function syncActionsContent(shadowRoot: ShadowRoot): void {
  const actions = shadowRoot.querySelector<HTMLElement>('.chat-actions');
  const slot = shadowRoot.querySelector<HTMLSlotElement>('slot[name="actions"]');
  if (!actions || !slot) return;

  const hasContent = Boolean(
    actions.querySelector('.chat-action') || slot.assignedElements({ flatten: true }).length,
  );
  actions.classList.toggle('has-content', hasContent);
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
  return `<el-dm-markdown
      class="chat-markdown"
      part="content"
      content="${escapeHtml(content || '')}"
    ></el-dm-markdown><div class="chat-slot-content" part="slot-content"><slot></slot></div>`;
}

function renderBubbleContent(
  content: string | undefined,
  streaming: boolean,
  id = '',
  agent = false,
): string {
  return `
    <slot name="work"></slot>
    <slot name="reasoning"></slot>
    <slot name="tool"></slot>
    <slot name="tools"></slot>
    <div
      id="${id}"
      tabindex="-1"
      class="${agent ? 'chat-content' : 'chat-bubble-content'} ${streaming ? (agent ? 'chat-streaming' : 'chat-bubble-streaming') : ''}"
      part="${agent ? 'content' : 'bubble-content'}"
    >${renderMarkdownContent(content)}</div>
  `;
}

function updateMarkdownElement(
  markdown: MarkdownElement,
  content: string,
  streaming: boolean,
): void {
  if (streaming) {
    markdown.startStreaming();
    markdown.setContent(content);
  } else {
    markdown.content = content;
  }
  markdown.setAttribute('content', content);
}

function syncMarkdownContent(
  shadowRoot: ShadowRoot,
  content: string | undefined,
  streaming: boolean,
): void {
  const markdown = shadowRoot.querySelector<MarkdownElement>('el-dm-markdown');
  const slot = shadowRoot.querySelector<HTMLSlotElement>('.chat-slot-content slot');
  const slotContent = shadowRoot.querySelector<HTMLElement>('.chat-slot-content');

  if (!markdown || !slot || !slotContent) return;
  if (markdown.shadowRoot && !markdown.shadowRoot.adoptedStyleSheets.includes(markdownEdgeStyles)) {
    markdown.shadowRoot.adoptedStyleSheets = [
      ...markdown.shadowRoot.adoptedStyleSheets,
      markdownEdgeStyles,
    ];
  }

  if (content) {
    updateMarkdownElement(markdown, content, streaming);
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
    updateMarkdownElement(markdown, textContent, streaming);
    markdown.hidden = false;
    slotContent.hidden = true;
    return;
  }

  markdown.hidden = true;
  slotContent.hidden = false;
}

let chatContentSequence = 0;

class ChatCollapse {
  readonly id = `el-dm-chat-content-${++chatContentSequence}`;
  private resize?: ResizeObserver;
  private mutation?: MutationObserver;

  constructor(private host: BaseElement & { collapsible: boolean; expanded: boolean }) {}

  disconnect(): void {
    this.resize?.disconnect();
    this.mutation?.disconnect();
  }

  connect(restoreToggleFocus = false): void {
    this.disconnect();
    const content = this.host.shadowRoot.querySelector<HTMLElement>('.chat-bubble-content');
    const toggle = this.host.shadowRoot.querySelector<HTMLButtonElement>('.chat-bubble-toggle');
    if (!content || !toggle) return;
    toggle.setAttribute('aria-expanded', String(Boolean(this.host.expanded)));
    toggle.textContent = this.host.expanded ? 'Show less' : 'Show more';
    this.measure();
    if (restoreToggleFocus) (toggle.hidden ? content : toggle).focus();
    if (typeof ResizeObserver !== 'undefined') {
      this.resize = new ResizeObserver(this.measure);
      this.resize.observe(content);
    }
    this.mutation = new MutationObserver(this.measure);
    this.mutation.observe(content, { childList: true, characterData: true, subtree: true });
    const markdownRoot = content.querySelector('el-dm-markdown')?.shadowRoot;
    if (markdownRoot)
      this.mutation.observe(markdownRoot, { childList: true, characterData: true, subtree: true });
    this.mutation.observe(this.host, { childList: true, characterData: true, subtree: true });
  }

  measure = (): void => {
    const content = this.host.shadowRoot.querySelector<HTMLElement>('.chat-bubble-content');
    const toggle = this.host.shadowRoot.querySelector<HTMLButtonElement>('.chat-bubble-toggle');
    if (!content || !toggle) return;
    const lineHeight = Number.parseFloat(getComputedStyle(content).lineHeight);
    const limit = Number.isFinite(lineHeight) ? lineHeight * 6 : content.clientHeight;
    const overflowing = content.scrollHeight > limit + 1;
    if (!overflowing) {
      if (this.host.shadowRoot.activeElement === toggle) content.focus();
      this.host.expanded = false;
    }
    toggle.hidden = !overflowing;
  };

  click(event: Event): boolean {
    const toggle = (event.target as Element | null)?.closest('.chat-bubble-toggle');
    if (!toggle) return false;
    this.host.expanded = !this.host.expanded;
    this.connect();
    return true;
  }

  render(): string {
    return this.host.collapsible
      ? `<button class="btn btn-ghost btn-xs chat-bubble-toggle" part="toggle" type="button" aria-controls="${this.id}" aria-expanded="false" hidden>Show more</button>`
      : '';
  }
}

export class ElDmChat extends BaseElement {
  static properties = {
    agent: { type: Boolean, reflect: true },
    collapsible: { type: Boolean, reflect: true },
    expanded: { type: Boolean, reflect: true },
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
    timeline: { type: Number, reflect: true },
  };

  declare agent: boolean;
  declare collapsible: boolean;
  declare expanded: boolean;
  private readonly _collapse = new ChatCollapse(this);
  private _lastTemplate = '';
  private _avatarObserver?: MutationObserver;

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
  declare timeline: ChatTimeline;

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
    syncActionsContent(this.shadowRoot);
    this._avatarObserver = new MutationObserver(() => this.update());
    this._avatarObserver.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['slot'],
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._collapse.disconnect();
    this._avatarObserver?.disconnect();
    this.shadowRoot.removeEventListener('slotchange', this._handleSlotChange);
    this.shadowRoot.removeEventListener('click', this._handleClick);
  }

  private _handleSlotChange = (): void => {
    this._collapse.measure();
    syncSlotContent(this.shadowRoot);
    syncActionsContent(this.shadowRoot);
    syncMarkdownContent(this.shadowRoot, this.content, this.streaming);
  };

  private _handleClick = (event: Event): void => {
    if (this._collapse.click(event)) return;
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
            <button class="btn btn-ghost btn-sm btn-square chat-action" part="action" type="button" aria-label="${escapedLabel}" data-action="${escapeHtml(getActionId(label))}" data-label="${escapedLabel}">${getActionIcon(label)}</button>
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
    const restoreToggleFocus = this.shadowRoot.activeElement?.matches('.chat-bubble-toggle');
    const template = this.render();
    if (template !== this._lastTemplate) {
      super.update();
      this._lastTemplate = template;
    }
    syncSlotContent(this.shadowRoot);
    syncActionsContent(this.shadowRoot);
    syncMarkdownContent(this.shadowRoot, this.content, this.streaming);
    this._collapse.connect(restoreToggleFocus);
  }

  render(): string {
    const avatar = this.avatar ? escapeHtml(this.avatar) : '';
    const timeline = isChatTimeline(this.timeline) ? ` data-chat-tl="${this.timeline}"` : '';

    return `
      <div class="${getChatClasses(this.align, this.agent)}" part="chat"${timeline}>
        ${
          !this.agent || this.avatar || this.querySelector('[slot="avatar"]')
            ? `<div class="chat-avatar ${this.avatar ? 'has-content' : ''}" part="avatar">
          ${avatar ? `<span class="avatar avatar-sm"><span class="avatar-placeholder">${avatar}</span></span>` : ''}
          <slot name="avatar"></slot>
        </div>`
            : ''
        }
        ${this._renderHeader()}
        ${
          this.agent
            ? renderBubbleContent(this.content, this.streaming, this._collapse.id, true)
            : `
          <div class="${getBubbleClasses(this.color, this.size, this.variant)} ${this.collapsible ? 'chat-bubble-collapsible' : ''}" part="bubble">
            ${renderBubbleContent(this.content, this.streaming, this._collapse.id)}
            ${this._collapse.render()}
          </div>
        `
        }
        ${this._renderFooter()}
        ${this._renderActions()}
      </div>
    `;
  }
}

export class ElDmChatBubble extends BaseElement {
  static properties = {
    collapsible: { type: Boolean, reflect: true },
    expanded: { type: Boolean, reflect: true },
    align: { type: String, reflect: true, default: 'start' },
    color: { type: String, reflect: true },
    size: { type: String, reflect: true },
    variant: { type: String, reflect: true },
    streaming: { type: Boolean, reflect: true },
    content: { type: String, reflect: true },
  };

  declare collapsible: boolean;
  declare expanded: boolean;
  private readonly _collapse = new ChatCollapse(this);
  private _lastTemplate = '';

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
    this.shadowRoot.addEventListener('click', this._handleClick);
    syncMarkdownContent(this.shadowRoot, this.content, this.streaming);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._collapse.disconnect();
    this.shadowRoot.removeEventListener('slotchange', this._handleSlotChange);
    this.shadowRoot.removeEventListener('click', this._handleClick);
  }

  private _handleClick = (event: Event): void => {
    this._collapse.click(event);
  };

  private _handleSlotChange = (): void => {
    this._collapse.measure();
    syncMarkdownContent(this.shadowRoot, this.content, this.streaming);
  };

  protected update(): void {
    const restoreToggleFocus = this.shadowRoot.activeElement?.matches('.chat-bubble-toggle');
    const template = this.render();
    if (template !== this._lastTemplate) {
      super.update();
      this._lastTemplate = template;
    }
    syncMarkdownContent(this.shadowRoot, this.content, this.streaming);
    this._collapse.connect(restoreToggleFocus);
  }

  render(): string {
    return `
      <div class="${getChatClasses(this.align)}" part="chat">
        <div class="${getBubbleClasses(this.color, this.size, this.variant)} ${this.collapsible ? 'chat-bubble-collapsible' : ''}" part="bubble">
          ${renderBubbleContent(this.content, this.streaming, this._collapse.id)}
          ${this._collapse.render()}
        </div>
      </div>
    `;
  }
}

interface ChatScrollTarget {
  timeline: ChatTimeline;
  index: number;
  target: ElDmChat;
}

let chatScrollSequence = 0;

export class ElDmChatScroll extends BaseElement {
  static properties = {
    label: { type: String, reflect: true, default: 'Conversation' },
    indicatorLabel: {
      type: String,
      reflect: true,
      attribute: 'indicator-label',
      default: 'Assistant replies',
    },
  };

  declare label: string;
  declare indicatorLabel: string;

  private readonly _generatedIdPrefix = `el-dm-chat-scroll-${++chatScrollSequence}`;
  private _targets = new Map<ChatTimeline, ChatScrollTarget>();
  private _targetSignature = '';
  private _observer?: MutationObserver;
  private _motionQuery?: MediaQueryList;
  private _timelineAnimationFrame?: number;

  constructor() {
    super();
    this.attachStyles(scrollStyles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot.addEventListener('slotchange', this._handleSlotChange);
    this.shadowRoot.addEventListener('click', this._handleClick);
    this.shadowRoot.addEventListener('pointerover', this._handleIndicatorStateChange);
    this.shadowRoot.addEventListener('pointerout', this._handleIndicatorStateChange);
    this.shadowRoot.addEventListener('focusin', this._handleIndicatorStateChange);
    this.shadowRoot.addEventListener('focusout', this._handleIndicatorStateChange);
    this._observer = new MutationObserver(this._syncIndicators);
    this._observer.observe(this, {
      attributes: true,
      attributeFilter: ['align', 'id', 'timeline'],
      childList: true,
      subtree: true,
    });
    this._motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this._motionQuery.addEventListener('change', this._handleMotionChange);
    this._syncIndicators();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.shadowRoot.removeEventListener('slotchange', this._handleSlotChange);
    this.shadowRoot.removeEventListener('click', this._handleClick);
    this.shadowRoot.removeEventListener('pointerover', this._handleIndicatorStateChange);
    this.shadowRoot.removeEventListener('pointerout', this._handleIndicatorStateChange);
    this.shadowRoot.removeEventListener('focusin', this._handleIndicatorStateChange);
    this.shadowRoot.removeEventListener('focusout', this._handleIndicatorStateChange);
    this._observer?.disconnect();
    this._motionQuery?.removeEventListener('change', this._handleMotionChange);
    this._cancelTimelineFrame();
  }

  protected update(): void {
    super.update();
    this._targetSignature = '';
    this._syncIndicators();
  }

  private _handleSlotChange = (): void => {
    this._syncIndicators();
  };

  private _handleMotionChange = (): void => {
    this._syncTimelineAnimations();
  };

  private _handleIndicatorStateChange = (event: Event): void => {
    if ((event.target as Element | null)?.closest('.chat-scroll-indicator')) {
      this._syncTimelineAnimations();
    }
  };

  private _getTargets(): ChatScrollTarget[] {
    const slot = this.shadowRoot.querySelector<HTMLSlotElement>('.chat-scroll-body slot');
    if (!slot) return [];

    const candidates = slot
      .assignedElements({ flatten: true })
      .filter((element): element is ElDmChat => element instanceof ElDmChat)
      .filter((message) => message.align !== 'end' && isChatTimeline(message.timeline))
      .map((target) => ({ timeline: target.timeline, target }));
    const lastTargetByTimeline = new Map(
      candidates.map(({ timeline, target }) => [timeline, target] as const),
    );

    return candidates
      .filter(({ timeline, target }) => lastTargetByTimeline.get(timeline) === target)
      .map(({ timeline, target }, index) => ({ timeline, target, index }));
  }

  private _syncIndicators = (): void => {
    const scroller = this.shadowRoot.querySelector<HTMLElement>('.chat-scroll');
    const track = this.shadowRoot.querySelector<HTMLElement>('.chat-scroll-track');
    if (!scroller || !track) return;

    const targets = this._getTargets();
    for (const { timeline, target } of targets) {
      if (!target.id) {
        target.id = `${this._generatedIdPrefix}-reply-${timeline}`;
      }
    }

    const signature = [
      this.indicatorLabel || 'Assistant replies',
      ...targets.map(({ timeline, target }) => `${timeline}:${target.id}`),
    ].join('|');
    this._targets = new Map(targets.map((target) => [target.timeline, target]));
    scroller.classList.toggle('chat-scroll-empty', targets.length === 0);
    track.hidden = targets.length === 0;

    if (signature === this._targetSignature && track.childElementCount === targets.length) return;

    this._targetSignature = signature;
    track.innerHTML = targets
      .map(({ timeline, target, index }) => {
        const targetId = escapeHtml(target.id);
        const label = escapeHtml(`${this.indicatorLabel || 'Assistant replies'}: ${index + 1}`);
        return `<button type="button" class="chat-scroll-indicator" part="indicator" data-chat-tl="${timeline}" data-chat-target="${targetId}" aria-controls="${targetId}" aria-label="${label}"></button>`;
      })
      .join('');
    this._syncTimelineAnimations();
  };

  private _cancelTimelineFrame(): void {
    if (this._timelineAnimationFrame !== undefined) {
      cancelAnimationFrame(this._timelineAnimationFrame);
      this._timelineAnimationFrame = undefined;
    }
  }

  private _syncTimelineAnimations(): void {
    this._cancelTimelineFrame();

    const buttons = Array.from(
      this.shadowRoot.querySelectorAll<HTMLButtonElement>('.chat-scroll-indicator'),
    );
    const prefersReducedMotion =
      this._motionQuery?.matches ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || typeof ViewTimeline === 'undefined') return;

    this._timelineAnimationFrame = requestAnimationFrame(() => {
      this._timelineAnimationFrame = undefined;
      if (this._motionQuery?.matches) return;

      for (const button of buttons) {
        const timeline = Number(button.dataset.chatTl);
        if (!isChatTimeline(timeline)) continue;

        const mapping = this._targets.get(timeline);
        const cssAnimation = button
          .getAnimations({ subtree: true })
          .find(
            (animation) =>
              (animation as CSSAnimation).animationName === 'chat-scroll-indicator-activate',
          );
        if (!mapping || !cssAnimation || cssAnimation.timeline) continue;

        // Named CSS timelines can remain tree-scoped at nested Shadow DOM boundaries.
        // Keep Core's pseudo-element effect and CSS hover/focus overrides intact.
        cssAnimation.timeline = new ViewTimeline({ subject: mapping.target, axis: 'block' });
      }
    });
  }

  private _handleClick = (event: Event): void => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>(
      '.chat-scroll-indicator',
    );
    if (!button) return;

    const timeline = Number(button.dataset.chatTl);
    if (!isChatTimeline(timeline)) return;

    const mapping = this._targets.get(timeline);
    const scroller = this.shadowRoot.querySelector<HTMLElement>('.chat-scroll');
    if (!mapping || !scroller || mapping.target.id !== button.dataset.chatTarget) return;

    event.preventDefault();
    const shouldNavigate = this.emit<ChatNavigateEventDetail>(
      'navigate',
      {
        timeline,
        index: mapping.index,
        target: mapping.target,
      },
      { cancelable: true },
    );
    if (!shouldNavigate) return;

    const top =
      scroller.scrollTop +
      mapping.target.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top;
    scroller.scrollTo({ top });
  };

  render(): string {
    const label = escapeHtml(this.label || 'Conversation');
    const indicatorLabel = escapeHtml(this.indicatorLabel || 'Assistant replies');

    return `
      <div class="chat-scroll" part="scroll" role="region" aria-label="${label}" tabindex="0">
        <nav class="chat-scroll-track" part="track" aria-label="${indicatorLabel}"></nav>
        <div class="chat-scroll-body" part="body">
          <slot></slot>
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
          <div class="chat-reasoning-tools" part="tools">
            <slot name="tool"></slot>
            <slot name="tools"></slot>
          </div>
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

export class ElDmChatWork extends BaseElement {
  static properties = {
    summary: { type: String, reflect: true, default: 'Work' },
    open: { type: Boolean, reflect: true },
  };

  declare summary: string;
  declare open: boolean;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  protected update(): void {
    if (!this.shadowRoot.querySelector('details')) {
      super.update();
      this.shadowRoot.querySelector('details')!.addEventListener('toggle', () => {
        this.open = this.shadowRoot.querySelector('details')!.open;
      });
    }
    this.shadowRoot.querySelector('details')!.open = Boolean(this.open);
    this.shadowRoot.querySelector('slot[name="summary"]')!.textContent = this.summary || 'Work';
  }

  render(): string {
    return `<details class="chat-work" part="work">
      <summary class="chat-work-summary" part="summary"><slot name="summary"></slot></summary>
      <div class="chat-work-body" part="body"><slot></slot></div>
    </details>`;
  }
}

function safeAttachment(value: string): string {
  try {
    const url = new URL(value, document.baseURI);
    return ['http:', 'https:', 'blob:'].includes(url.protocol) || /^data:image\//i.test(value)
      ? value
      : '';
  } catch {
    return '';
  }
}

export class ElDmChatQueue extends BaseElement {
  static properties = {
    items: { type: Array, default: [] },
    label: { type: String, reflect: true, default: 'Queued messages' },
  };

  declare items: ChatQueueItem[];
  declare label: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot.addEventListener('click', this._handleClick);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.shadowRoot.removeEventListener('click', this._handleClick);
  }

  private _handleClick = (event: Event): void => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>(
      'button[data-action]',
    );
    if (!button) return;
    const index = Number(button.dataset.index);
    const item = this.items?.[index];
    if (item) this.emit<ChatQueueActionEventDetail>(button.dataset.action!, { item, index });
  };

  protected update(): void {
    const active = this.shadowRoot.activeElement as HTMLButtonElement | null;
    const action = active?.dataset.action;
    const oldIndex = Number(active?.dataset.index);
    const id = active?.closest('li')?.getAttribute('data-id');
    super.update();
    if (action && this.items?.length) {
      const retained = this.items.findIndex((item) => item.id === id);
      const index = retained >= 0 ? retained : Math.min(oldIndex, this.items.length - 1);
      this.shadowRoot
        .querySelector<HTMLButtonElement>(`button[data-action="${action}"][data-index="${index}"]`)
        ?.focus();
    }
  }

  render(): string {
    const items = Array.isArray(this.items) ? this.items : [];
    return `<section class="chat-queue" part="queue" aria-label="${escapeHtml(this.label || 'Queued messages')}" ${items.length ? '' : 'hidden'}>
      <div class="chat-queue-header sr-only"><h3 class="chat-queue-title">${escapeHtml(this.label || 'Queued messages')}</h3><span class="chat-queue-count">${items.length} Queued</span></div>
      <ol class="chat-queue-list" part="list" role="list" tabindex="0" aria-label="${escapeHtml(this.label || 'Queued messages')}">
        ${items
          .map((item, index) => {
            const attachment = item.attachment ? safeAttachment(item.attachment) : '';
            return `<li class="chat-queue-item ${item.active ? 'chat-queue-item-active' : ''}" part="item" data-id="${escapeHtml(item.id)}">
            <svg class="chat-queue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m8 6 4 4-4 4M12 10H5m10-4h4m-4 6h4m-4 6h4"/></svg>
            <span class="chat-queue-number sr-only">${index + 1}.</span>
            ${attachment ? `<img class="chat-queue-attachment" src="${escapeHtml(attachment)}" alt="${escapeHtml(item.attachmentAlt || '')}">` : ''}
            <div class="chat-queue-content" title="${escapeHtml(item.content)}">${escapeHtml(item.content)}</div>
            <div class="chat-actions chat-queue-actions has-content">
              <button class="btn btn-ghost btn-sm chat-queue-steer" type="button" data-action="steer" data-index="${index}" aria-label="Steer waiting message ${index + 1}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 4 5 5-5 5M20 9h-9a6 6 0 0 0-6 6v4"/></svg>Steer</button>
              <button class="btn btn-ghost btn-sm btn-square chat-queue-remove" type="button" data-action="remove" data-index="${index}" aria-label="Remove waiting message ${index + 1}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/></svg></button>
            </div>
          </li>`;
          })
          .join('')}
      </ol>
    </section>`;
  }
}

export class ElDmChatInput extends BaseElement {
  static properties = {
    color: { type: String, reflect: true },
    busy: { type: Boolean, reflect: true },
    name: { type: String, reflect: true, default: '' },
    value: { type: String },
    placeholder: {
      type: String,
      reflect: true,
      default: 'Message the agent…',
    },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    sendLabel: { type: String, reflect: true, attribute: 'send-label', default: 'Send' },
    clearOnSend: { type: Boolean, reflect: true, attribute: 'clear-on-send' },
  };

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, 'id', 'auto-grow'];
  }

  declare color: ChatComposerColor;
  declare busy: boolean;
  private _lastValue: string | undefined;

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
    this.shadowRoot.addEventListener('keydown', this._handleKeyDown, true);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.shadowRoot.removeEventListener('click', this._handleClick);
    this.shadowRoot.removeEventListener('keydown', this._handleKeyDown, true);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (name === 'id' && oldValue !== newValue && this.isConnected) {
      this._syncEditorId();
    }
    if (name === 'auto-grow' && oldValue !== newValue) {
      const input = this._getInput();
      input?.toggleAttribute('auto-grow', newValue !== null);
      input?.setAttribute('resize', newValue !== null ? 'none' : 'vertical');
    }
  }

  focus(options?: FocusOptions): void {
    this._getInput()?.focus(options);
  }

  getValue(): string {
    return this._getInput()?.getValue() ?? this.value ?? '';
  }

  setValue(value: string): void {
    this.value = value;
    this._lastValue = value;
    this._getInput()?.setValue(value);
  }

  getFiles(): File[] {
    return this._getInput()?.getFiles() ?? [];
  }

  clearFiles(): void {
    const input = this._getInput();
    if (!input) return;

    for (let index = input.getFiles().length - 1; index >= 0; index--) {
      input.removeFile(index);
    }
  }

  private _getInput(): MarkdownInputElement | null {
    return this.shadowRoot.querySelector<MarkdownInputElement>('el-dm-markdown-input');
  }

  private _syncEditorId(): void {
    const input = this._getInput();
    if (!input) return;

    if (this.id) input.id = `${this.id}-editor`;
    else input.removeAttribute('id');
  }

  private _handleClick = (event: Event): void => {
    const button = (event.target as Element | null)?.closest<HTMLButtonElement>('.chat-send');
    const steer = (event.target as Element | null)?.closest<HTMLButtonElement>('.chat-steer');
    if (steer && !steer.disabled) this._send('steer');
    else if (button && !button.disabled) this._send();
  };

  private _handleKeyDown = (event: Event): void => {
    const keyboardEvent = event as KeyboardEvent;
    if (
      keyboardEvent.defaultPrevented ||
      keyboardEvent.isComposing ||
      keyboardEvent.keyCode === 229 ||
      keyboardEvent.key !== 'Enter' ||
      keyboardEvent.shiftKey ||
      this.disabled ||
      this.readonly
    )
      return;
    // Let an active markdown suggestion consume Enter before admitting the draft.
    const textarea = keyboardEvent
      .composedPath()
      .find((node) => node instanceof HTMLElement && node.tagName === 'TEXTAREA') as
      HTMLTextAreaElement | undefined;
    if (!textarea || textarea.getAttribute('aria-expanded') === 'true') return;
    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    this._send(this.busy && (keyboardEvent.ctrlKey || keyboardEvent.metaKey) ? 'steer' : 'send');
  };

  private _send(action: 'send' | 'steer' = 'send'): void {
    if (this.disabled || this.readonly || (action === 'steer' && !this.busy)) return;
    const value = this.getValue();
    const files = this.getFiles();
    if (!value.trim() && files.length === 0) return;
    if (!this.emit<ChatSendEventDetail>(action, { value, files })) return;

    if (this.clearOnSend) {
      this.setValue('');
      this.clearFiles();
    }
  }

  protected update(): void {
    if (!this._getInput()) super.update();
    const input = this._getInput();
    if (!input) return;
    this._syncEditorId();
    for (const [name, value] of [
      ['name', this.name || ''],
      ['placeholder', this.placeholder || 'Message the agent…'],
    ]) {
      if (input.getAttribute(name!) !== value) input.setAttribute(name!, value!);
    }
    input.toggleAttribute('disabled', Boolean(this.disabled));
    input.toggleAttribute('readonly', Boolean(this.readonly));
    input.toggleAttribute('auto-grow', this.hasAttribute('auto-grow'));
    input.setAttribute('resize', this.hasAttribute('auto-grow') ? 'none' : 'vertical');
    if (this.value !== this._lastValue) {
      input.setValue(this.value || '');
      this._lastValue = this.value;
    }
    const composer = this.shadowRoot.querySelector<HTMLElement>('.chat-composer')!;
    composer.className = `chat-composer ${this.color && [...Object.keys(BUBBLE_COLOR_CLASSES), 'ghost'].includes(this.color) ? `chat-composer-${this.color}` : ''}`;
    const send = this.shadowRoot.querySelector<HTMLButtonElement>('.chat-send')!;
    send.disabled = Boolean(this.disabled || this.readonly);
    send.querySelector('span')!.textContent = this.busy ? 'Queue' : this.sendLabel || 'Send';
    this.shadowRoot.querySelector<HTMLButtonElement>('.chat-steer')!.disabled = Boolean(
      !this.busy || this.disabled || this.readonly,
    );
  }

  render(): string {
    return `<div class="chat-input-area chat-input" part="input">
      <slot name="queue"></slot>
      <div class="chat-composer" part="composer">
        <el-dm-markdown-input class="chat-composer-input chat-input-editor" part="editor"
          ${this.id ? `id="${escapeHtml(this.id)}-editor"` : ''}
          name="${escapeHtml(this.name || '')}"
          value="${escapeHtml(this.value || '')}"
          placeholder="${escapeHtml(this.placeholder || 'Message the agent…')}"
          resize="${this.hasAttribute('auto-grow') ? 'none' : 'vertical'}"
          ${this.hasAttribute('auto-grow') ? 'auto-grow' : ''}
          ${this.disabled ? 'disabled' : ''} ${this.readonly ? 'readonly' : ''} no-preview>
          <div class="chat-composer-actions chat-input-actions" part="actions" slot="bottom-end">
            <button class="btn btn-ghost chat-send" part="send" type="button" aria-keyshortcuts="Enter"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/></svg><span>Send</span> <kbd class="chat-composer-hint">Enter</kbd></button>
            <button class="btn btn-ghost chat-steer" part="steer" type="button" aria-keyshortcuts="Control+Enter Meta+Enter" disabled><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 4 5 5-5 5M20 9h-9a6 6 0 0 0-6 6v4"/></svg>Steer <kbd class="chat-composer-hint">Ctrl/⌘+Enter</kbd></button>
          </div>
        </el-dm-markdown-input>
      </div>
    </div>`;
  }
}
