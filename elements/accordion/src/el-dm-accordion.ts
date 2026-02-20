/**
 * DuskMoon Accordion Element
 *
 * An expandable/collapsible panels component for organizing content.
 * Uses styles from @duskmoon-dev/core for consistent theming.
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

import { BaseElement, css } from '@duskmoon-dev/el-base';
import { css as accordionCSS } from '@duskmoon-dev/core/components/accordion';

// Strip @layer wrapper for Shadow DOM compatibility
const coreStyles = accordionCSS.replace(/@layer\s+components\s*\{/, '').replace(/\}\s*$/, '');

const styles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Import core accordion styles */
  ${coreStyles}

  /* Web component specific: slotted item borders */
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
    this._syncItemsWithValue();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback?.();
    this.removeEventListener('accordion-item-toggle', this._handleItemToggle as EventListener);
  }

  getOpenItems(): string[] {
    return this.value ? this.value.split(',').filter(Boolean) : [];
  }

  setOpenItems(ids: string[]): void {
    this.value = ids.join(',');
    this._syncItemsWithValue();
    this.emit('change', { value: this.value, openItems: ids });
  }

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

  close(itemId: string): void {
    const openItems = this.getOpenItems();
    this.setOpenItems(openItems.filter((id) => id !== itemId));
  }

  toggle(itemId: string): void {
    const openItems = this.getOpenItems();
    if (openItems.includes(itemId)) {
      this.close(itemId);
    } else {
      this.open(itemId);
    }
  }

  private _handleItemToggle = (event: CustomEvent): void => {
    const { itemId, open } = event.detail;
    if (open) {
      this.open(itemId);
    } else {
      this.close(itemId);
    }
  };

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
 * Uses styles from @duskmoon-dev/core for consistent theming.
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
 * @csspart icon - The expand/collapse icon
 * @csspart content - The content container
 */

const itemStyles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  /* Import core accordion styles */
  ${coreStyles}

  /* Web component specific adjustments */
  .accordion-header {
    font-family: inherit;
    font-size: 1rem;
    justify-content: space-between;
    padding: 1rem 1.25rem;
  }

  .accordion-body-inner {
    padding: 0 1.25rem 1rem;
  }
`;

export class ElDmAccordionItem extends BaseElement {
  static properties = {
    value: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    open: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare disabled: boolean;
  declare open: boolean;

  constructor() {
    super();
    this.attachStyles(itemStyles);
  }

  private _handleClick(): void {
    if (this.disabled) return;

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

  private _handleKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._handleClick();
    }
  }

  toggle(): void {
    if (!this.disabled) {
      this._handleClick();
    }
  }

  render(): string {
    const expandSvg = `
      <svg class="accordion-expand" part="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;

    return `
      <div class="accordion-item ${this.open ? 'open' : ''}">
        <button
          class="accordion-header"
          part="header"
          type="button"
          aria-expanded="${this.open ? 'true' : 'false'}"
          aria-controls="content-${this.value || 'item'}"
          ${this.disabled ? 'disabled' : ''}
        >
          <span class="accordion-title">
            <slot name="header"></slot>
          </span>
          ${expandSvg}
        </button>
        <div class="accordion-content">
          <div class="accordion-body">
            <div
              class="accordion-body-inner"
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
