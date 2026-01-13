/**
 * DuskMoon Accordion Element
 *
 * An expandable/collapsible panels component for organizing content.
 *
 * @element el-dm-accordion
 *
 * @attr {boolean} multiple - Allow multiple panels to be open simultaneously
 * @attr {string} value - Comma-separated list of open item IDs
 *
 * @slot - Default slot for accordion items (el-dm-accordion-item)
 *
 * @csspart container - The accordion container
 *
 * @fires change - Fired when expansion state changes
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';

const styles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  .accordion {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-outline, #e0e0e0);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  ::slotted(el-dm-accordion-item:not(:last-child)) {
    border-bottom: 1px solid var(--color-outline, #e0e0e0);
  }
`;

export class ElDmAccordion extends BaseElement {
  static properties = {
    multiple: { type: Boolean, reflect: true },
    value: { type: String, reflect: true },
  };

  /** Allow multiple panels to be open */
  declare multiple: boolean;

  /** Comma-separated list of open item IDs */
  declare value: string;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('accordion-item-toggle', this._handleItemToggle as EventListener);
    // Initialize items based on value
    this._syncItemsWithValue();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    this.removeEventListener('accordion-item-toggle', this._handleItemToggle as EventListener);
  }

  /**
   * Get array of open item IDs
   */
  getOpenItems(): string[] {
    return this.value ? this.value.split(',').filter(Boolean) : [];
  }

  /**
   * Set open items by ID
   */
  setOpenItems(ids: string[]): void {
    this.value = ids.join(',');
    this._syncItemsWithValue();
    this.emit('change', { value: this.value, openItems: ids });
  }

  /**
   * Open a specific item by ID
   */
  open(itemId: string): void {
    const openItems = this.getOpenItems();
    if (!openItems.includes(itemId)) {
      if (this.multiple) {
        this.setOpenItems([...openItems, itemId]);
      } else {
        this.setOpenItems([itemId]);
      }
    }
  }

  /**
   * Close a specific item by ID
   */
  close(itemId: string): void {
    const openItems = this.getOpenItems();
    this.setOpenItems(openItems.filter((id) => id !== itemId));
  }

  /**
   * Toggle a specific item by ID
   */
  toggle(itemId: string): void {
    const openItems = this.getOpenItems();
    if (openItems.includes(itemId)) {
      this.close(itemId);
    } else {
      this.open(itemId);
    }
  }

  /**
   * Handle item toggle events from accordion items
   */
  private _handleItemToggle = (event: CustomEvent): void => {
    const { itemId, open } = event.detail;
    if (open) {
      this.open(itemId);
    } else {
      this.close(itemId);
    }
  };

  /**
   * Sync accordion item states with current value
   */
  private _syncItemsWithValue(): void {
    const openItems = this.getOpenItems();
    const items = this.querySelectorAll('el-dm-accordion-item');
    items.forEach((item) => {
      const accordionItem = item as ElDmAccordionItem;
      const itemValue = accordionItem.value;
      if (itemValue) {
        accordionItem.open = openItems.includes(itemValue);
      }
    });
  }

  render(): string {
    return `
      <div class="accordion" part="container" role="presentation">
        <slot></slot>
      </div>
    `;
  }
}

/**
 * DuskMoon Accordion Item Element
 *
 * An individual expandable panel within an accordion.
 *
 * @element el-dm-accordion-item
 *
 * @attr {string} value - Unique identifier for this item
 * @attr {boolean} disabled - Whether the item is disabled
 * @attr {boolean} open - Whether the item is expanded
 *
 * @slot header - Content for the header/trigger area
 * @slot - Default slot for the expandable content
 *
 * @csspart header - The header button
 * @csspart icon - The chevron icon
 * @csspart content - The content container
 */

const itemStyles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  .accordion-item {
    background-color: var(--color-surface, #ffffff);
  }

  .accordion-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 1rem 1.25rem;
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-on-surface, #1a1a1a);
    text-align: left;
    transition: background-color 150ms ease;
  }

  .accordion-header:hover:not(:disabled) {
    background-color: var(--color-surface-variant, #f5f5f5);
  }

  .accordion-header:focus-visible {
    outline: 2px solid var(--color-primary, #6366f1);
    outline-offset: -2px;
  }

  .accordion-header:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .header-content {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .chevron {
    width: 1.25rem;
    height: 1.25rem;
    transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
    flex-shrink: 0;
    margin-left: 0.75rem;
  }

  :host([open]) .chevron {
    transform: rotate(180deg);
  }

  .content-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  :host([open]) .content-wrapper {
    grid-template-rows: 1fr;
  }

  .content-inner {
    overflow: hidden;
  }

  .accordion-content {
    padding: 0 1.25rem 1rem;
    color: var(--color-on-surface-variant, #4a4a4a);
  }
`;

export class ElDmAccordionItem extends BaseElement {
  static properties = {
    value: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
  };

  /** Unique identifier for this item */
  declare value: string;

  /** Whether the item is disabled */
  declare disabled: boolean;

  /** Whether the item is expanded */
  declare open: boolean;

  constructor() {
    super();
    this.attachStyles(itemStyles);
  }

  /**
   * Handle header click
   */
  private _handleClick(): void {
    if (this.disabled) return;

    // Dispatch toggle event to parent accordion
    this.dispatchEvent(
      new CustomEvent('accordion-item-toggle', {
        bubbles: true,
        composed: true,
        detail: {
          itemId: this.value,
          open: !this.open,
        },
      }),
    );
  }

  /**
   * Handle keyboard events
   */
  private _handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._handleClick();
    }
  }

  /**
   * Toggle the item open/closed
   */
  toggle(): void {
    if (!this.disabled) {
      this._handleClick();
    }
  }

  render(): string {
    const chevronSvg = `
      <svg class="chevron" part="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;

    return `
      <div class="accordion-item">
        <button
          class="accordion-header"
          part="header"
          type="button"
          aria-expanded="${this.open ? 'true' : 'false'}"
          aria-controls="content-${this.value || 'item'}"
          ${this.disabled ? 'disabled' : ''}
        >
          <span class="header-content">
            <slot name="header"></slot>
          </span>
          ${chevronSvg}
        </button>
        <div class="content-wrapper">
          <div class="content-inner">
            <div
              class="accordion-content"
              part="content"
              id="content-${this.value || 'item'}"
              role="region"
              aria-hidden="${this.open ? 'false' : 'true'}"
            >
              <slot></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  update(): void {
    super.update();
    const header = this.shadowRoot?.querySelector('.accordion-header');
    header?.addEventListener('click', this._handleClick.bind(this));
    header?.addEventListener('keydown', this._handleKeyDown.bind(this) as EventListener);
  }
}
