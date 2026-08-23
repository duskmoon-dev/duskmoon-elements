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

  slot[name='reasoning']::slotted(el-dm-chat-reasoning),
  slot[name='tool']::slotted(el-dm-chat-tool),
  slot[name='tools']::slotted(el-dm-chat-tool) {
    width: 100%;
    max-width: none;
  }

  .chat-bubble-content.chat-bubble-streaming:has(.chat-markdown:not([hidden]))::after {
    content: none;
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
    font-style: normal;
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

const scrollStyles = css`
  :host {
    display: block;
    min-height: 0;
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

function getChatClasses(align: ChatAlign | undefined): string {
  return ['chat', ALIGN_CLASSES[align || 'start'] || 'chat-start'].join(' ');
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

function renderBubbleContent(content: string | undefined, streaming: boolean): string {
  return `
    <slot name="reasoning"></slot>
    <slot name="tool"></slot>
    <slot name="tools"></slot>
    <div
      class="chat-bubble-content ${streaming ? 'chat-bubble-streaming' : ''}"
      part="bubble-content"
    >
      ${renderMarkdownContent(content)}
    </div>
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
    timeline: { type: Number, reflect: true },
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
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.shadowRoot.removeEventListener('slotchange', this._handleSlotChange);
    this.shadowRoot.removeEventListener('click', this._handleClick);
  }

  private _handleSlotChange = (): void => {
    syncSlotContent(this.shadowRoot);
    syncMarkdownContent(this.shadowRoot, this.content, this.streaming);
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
    syncMarkdownContent(this.shadowRoot, this.content, this.streaming);
  }

  render(): string {
    const avatar = this.avatar ? escapeHtml(this.avatar) : '';
    const timeline = isChatTimeline(this.timeline) ? ` data-chat-tl="${this.timeline}"` : '';

    return `
      <div class="${getChatClasses(this.align)}" part="chat"${timeline}>
        <div class="chat-avatar ${this.avatar ? 'has-content' : ''}" part="avatar">
          ${avatar}
          <slot name="avatar"></slot>
        </div>
        ${this._renderHeader()}
        <div class="${getBubbleClasses(this.color, this.size, this.variant)}" part="bubble">
          ${renderBubbleContent(this.content, this.streaming)}
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
    syncMarkdownContent(this.shadowRoot, this.content, this.streaming);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.shadowRoot.removeEventListener('slotchange', this._handleSlotChange);
  }

  private _handleSlotChange = (): void => {
    syncMarkdownContent(this.shadowRoot, this.content, this.streaming);
  };

  protected update(): void {
    super.update();
    syncMarkdownContent(this.shadowRoot, this.content, this.streaming);
  }

  render(): string {
    return `
      <div class="${getChatClasses(this.align)}" part="chat">
        <div class="${getBubbleClasses(this.color, this.size, this.variant)}" part="bubble">
          ${renderBubbleContent(this.content, this.streaming)}
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
  private _timelineAnimations: Animation[] = [];

  constructor() {
    super();
    this.attachStyles(scrollStyles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.shadowRoot.addEventListener('slotchange', this._handleSlotChange);
    this.shadowRoot.addEventListener('click', this._handleClick);
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
    this._observer?.disconnect();
    this._motionQuery?.removeEventListener('change', this._handleMotionChange);
    this._clearTimelineAnimations();
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

  private _clearTimelineAnimations(): void {
    if (this._timelineAnimationFrame !== undefined) {
      cancelAnimationFrame(this._timelineAnimationFrame);
      this._timelineAnimationFrame = undefined;
    }
    for (const animation of this._timelineAnimations) {
      animation.cancel();
    }
    this._timelineAnimations = [];
  }

  private _syncTimelineAnimations(): void {
    this._clearTimelineAnimations();

    const buttons = Array.from(
      this.shadowRoot.querySelectorAll<HTMLButtonElement>('.chat-scroll-indicator'),
    );
    for (const button of buttons) {
      button.style.removeProperty('animation-name');
    }

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
          .getAnimations()
          .find(
            (animation) =>
              (animation as CSSAnimation).animationName === 'chat-scroll-indicator-activate',
          );
        if (!mapping || !cssAnimation || cssAnimation.timeline) continue;

        // Named CSS timelines can remain tree-scoped at nested Shadow DOM boundaries.
        // Reuse DuskMoonUI's computed keyframes on a native ViewTimeline when that happens.
        const keyframes = (cssAnimation.effect as KeyframeEffect | null)?.getKeyframes();
        if (!keyframes?.length) continue;

        cssAnimation.cancel();
        button.style.animationName = 'none';
        const animation = button.animate(keyframes, {
          duration: 1,
          fill: 'both',
          timeline: new ViewTimeline({ subject: mapping.target, axis: 'block' }),
          rangeStart: 'entry 0%',
          rangeEnd: 'exit 100%',
        });
        this._timelineAnimations.push(animation);
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

  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, 'id'];
  }

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

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    if (name === 'id' && oldValue !== newValue && this.isConnected) {
      this._syncEditorId();
    }
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

  private _syncEditorId(): void {
    const input = this._getInput();
    if (!input) return;

    if (this.id) input.id = `${this.id}-editor`;
    else input.removeAttribute('id');
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
    const editorId = this.id ? `${this.id}-editor` : '';

    return `
      <div class="chat-input" part="input">
        <el-dm-markdown-input
          class="chat-input-editor"
          part="editor"
          ${editorId ? `id="${escapeHtml(editorId)}"` : ''}
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
