/**
 * DuskMoon Bottom Navigation Element
 *
 * A mobile-first bottom navigation bar component with nav items and icons.
 * Fixed position at the bottom of the viewport for easy thumb access.
 *
 * @element el-dm-bottom-navigation
 *
 * @attr {Array} items - Array of navigation items with { value, label, icon? } structure
 * @attr {string} value - Currently selected item value
 * @attr {string} color - Color theme: primary, secondary, or custom color
 *
 * @slot - Default slot for custom nav items (el-dm-bottom-navigation-item)
 *
 * @csspart container - The navigation container
 * @csspart item - Individual navigation item
 * @csspart icon - Item icon container
 * @csspart label - Item label
 *
 * @fires change - Fired when selection changes, detail: { value, item }
 */

import { BaseElement, css } from '@duskmoon-dev/el-base';

/**
 * Navigation item structure
 */
export interface BottomNavigationItem {
  /** Unique identifier for the item */
  value: string;
  /** Display label */
  label: string;
  /** Icon HTML or SVG string */
  icon?: string;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Optional href for link behavior */
  href?: string;
}

const styles = css`
  :host {
    --bottom-nav-height: 56px;
    --bottom-nav-bg: var(--color-surface, #ffffff);
    --bottom-nav-border: var(--color-border, #e5e7eb);
    --bottom-nav-text: var(--color-text-secondary, #6b7280);
    --bottom-nav-text-active: var(--color-primary, #3b82f6);
    --bottom-nav-icon-size: 24px;
    --bottom-nav-label-size: 0.75rem;
    --bottom-nav-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1);

    display: block;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  :host([hidden]) {
    display: none !important;
  }

  :host([position='static']) {
    position: static;
  }

  :host([position='sticky']) {
    position: sticky;
  }

  .bottom-nav {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: var(--bottom-nav-height);
    background: var(--bottom-nav-bg);
    border-top: 1px solid var(--bottom-nav-border);
    box-shadow: var(--bottom-nav-shadow);
    padding: 0;
    margin: 0;
    /* Safe area for iOS devices */
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 6px 12px;
    min-width: 0;
    max-width: 168px;
    height: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--bottom-nav-text);
    text-decoration: none;
    transition:
      color 0.2s ease,
      transform 0.1s ease;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }

  .nav-item:focus {
    outline: none;
  }

  .nav-item:focus-visible {
    outline: 2px solid var(--bottom-nav-text-active);
    outline-offset: -2px;
    border-radius: 4px;
  }

  .nav-item:active:not([disabled]) {
    transform: scale(0.95);
  }

  .nav-item[aria-selected='true'],
  .nav-item.active {
    color: var(--bottom-nav-text-active);
  }

  .nav-item[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  .nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--bottom-nav-icon-size);
    height: var(--bottom-nav-icon-size);
    flex-shrink: 0;
  }

  .nav-icon ::slotted(*),
  .nav-icon svg,
  .nav-icon img {
    width: 100%;
    height: 100%;
  }

  .nav-label {
    font-size: var(--bottom-nav-label-size);
    font-weight: 500;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  /* Hide labels on very small screens */
  @media (max-width: 320px) {
    .nav-label {
      display: none;
    }

    .nav-icon {
      width: 28px;
      height: 28px;
    }
  }

  /* Color variants */
  :host([color='secondary']) {
    --bottom-nav-text-active: var(--color-secondary, #8b5cf6);
  }

  :host([color='success']) {
    --bottom-nav-text-active: var(--color-success, #22c55e);
  }

  :host([color='warning']) {
    --bottom-nav-text-active: var(--color-warning, #f59e0b);
  }

  :host([color='error']) {
    --bottom-nav-text-active: var(--color-error, #ef4444);
  }

  /* Badge indicator for items */
  .nav-item-badge {
    position: absolute;
    top: 4px;
    right: calc(50% - 18px);
    min-width: 8px;
    height: 8px;
    background: var(--color-error, #ef4444);
    border-radius: 50%;
  }

  .nav-item-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    justify-content: center;
    max-width: 168px;
  }

  /* Slot for custom items */
  ::slotted(el-dm-bottom-navigation-item) {
    flex: 1;
  }
`;

export class ElDmBottomNavigation extends BaseElement {
  static properties = {
    items: { type: Array, reflect: false, default: [] },
    value: { type: String, reflect: true },
    color: { type: String, reflect: true, default: 'primary' },
    position: { type: String, reflect: true, default: 'fixed' },
  };

  /** Array of navigation items */
  declare items: BottomNavigationItem[];

  /** Currently selected item value */
  declare value: string;

  /** Color theme */
  declare color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | string;

  /** Position of the navigation bar */
  declare position: 'fixed' | 'static' | 'sticky';

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._handleClick.bind(this));
    this.addEventListener('keydown', this._handleKeydown.bind(this));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this._handleClick.bind(this));
    this.removeEventListener('keydown', this._handleKeydown.bind(this));
  }

  /**
   * Handle click events on nav items
   */
  private _handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const navItem = target.closest('[data-value]') as HTMLElement | null;

    if (!navItem || navItem.hasAttribute('disabled')) {
      return;
    }

    const value = navItem.dataset.value;
    if (value && value !== this.value) {
      const item = this.items.find((i) => i.value === value);
      this.value = value;
      this.emit('change', { value, item });
    }
  }

  /**
   * Handle keyboard navigation
   */
  private _handleKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (!target.classList.contains('nav-item')) return;

    const items = Array.from(this.shadowRoot.querySelectorAll('.nav-item:not([disabled])'));
    const currentIndex = items.indexOf(target);

    let nextIndex = -1;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        nextIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        target.click();
        return;
    }

    if (nextIndex >= 0 && items[nextIndex]) {
      (items[nextIndex] as HTMLElement).focus();
    }
  }

  /**
   * Render a single navigation item
   */
  private _renderItem(item: BottomNavigationItem): string {
    const isSelected = item.value === this.value;
    const Tag = item.href ? 'a' : 'button';
    const hrefAttr = item.href ? `href="${item.href}"` : '';
    const disabledAttr = item.disabled ? 'disabled' : '';
    const typeAttr = Tag === 'button' ? 'type="button"' : '';

    return `
      <div class="nav-item-wrapper">
        <${Tag}
          class="nav-item"
          part="item"
          role="tab"
          tabindex="${item.disabled ? '-1' : '0'}"
          aria-selected="${isSelected}"
          data-value="${item.value}"
          ${hrefAttr}
          ${disabledAttr}
          ${typeAttr}
        >
          ${
            item.icon
              ? `
            <span class="nav-icon" part="icon">
              ${item.icon}
            </span>
          `
              : ''
          }
          <span class="nav-label" part="label">${item.label}</span>
        </${Tag}>
      </div>
    `;
  }

  render(): string {
    const hasItems = this.items && this.items.length > 0;

    return `
      <nav class="bottom-nav" part="container" role="tablist" aria-label="Bottom navigation">
        ${hasItems ? this.items.map((item) => this._renderItem(item)).join('') : '<slot></slot>'}
      </nav>
    `;
  }
}
