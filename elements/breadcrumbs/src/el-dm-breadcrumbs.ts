/**
 * DuskMoon Breadcrumbs Element
 *
 * A hierarchical navigation breadcrumbs component for displaying the user's
 * current location within a site structure.
 *
 * @element el-dm-breadcrumbs
 *
 * @attr {string} items - JSON array of breadcrumb items [{label, href}]
 * @attr {string} separator - Separator character between items (default '/')
 *
 * @slot separator - Custom separator element to use between items
 *
 * @csspart nav - The navigation container
 * @csspart list - The ordered list element
 * @csspart item - Individual breadcrumb item container
 * @csspart link - Breadcrumb link element
 * @csspart current - Current page text (last item)
 * @csspart separator - Separator element between items
 *
 * @fires navigate - Fired when a breadcrumb link is clicked. Detail: { item, index }
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';

/**
 * Represents a single breadcrumb item
 */
export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** URL for the breadcrumb link (optional for last item) */
  href?: string;
}

/**
 * Event detail for the navigate event
 */
export interface NavigateEventDetail {
  /** The breadcrumb item that was clicked */
  item: BreadcrumbItem;
  /** The index of the clicked item */
  index: number;
}

const styles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none !important;
  }

  .breadcrumbs-nav {
    font-family: inherit;
  }

  .breadcrumbs-list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .breadcrumbs-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .breadcrumbs-link {
    color: var(--color-primary);
    text-decoration: none;
    font-size: 0.875rem;
    line-height: 1.25rem;
    transition: color 150ms ease;
    cursor: pointer;
  }

  .breadcrumbs-link:hover {
    color: var(--color-primary-dark, var(--color-primary));
    text-decoration: underline;
  }

  .breadcrumbs-link:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: 2px;
  }

  .breadcrumbs-current {
    color: var(--color-on-surface);
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 500;
  }

  .breadcrumbs-separator {
    color: var(--color-on-surface-variant, var(--color-outline));
    font-size: 0.875rem;
    user-select: none;
  }

  /* Hide slotted separator template */
  ::slotted([slot='separator']) {
    display: none;
  }
`;

export class ElDmBreadcrumbs extends BaseElement {
  static properties = {
    items: { type: Array, reflect: false },
    separator: { type: String, reflect: true, default: '/' },
  };

  /** Array of breadcrumb items */
  declare items: BreadcrumbItem[];

  /** Separator character between items */
  declare separator: string;

  constructor() {
    super();
    this.attachStyles(styles);
    this.items = [];
  }

  /**
   * Handle click on a breadcrumb link
   */
  private _handleClick(event: Event, item: BreadcrumbItem, index: number): void {
    event.preventDefault();

    // emit returns true if event was not cancelled
    const notCancelled = this.emit<NavigateEventDetail>('navigate', {
      item,
      index,
    });

    // If event was not prevented, navigate to the href
    if (notCancelled && item.href) {
      window.location.href = item.href;
    }
  }

  /**
   * Get the separator HTML - either from slot or default
   */
  private _getSeparatorHtml(): string {
    const slottedSeparator = this.querySelector('[slot="separator"]');
    if (slottedSeparator) {
      return slottedSeparator.outerHTML.replace('slot="separator"', '');
    }
    return this.separator || '/';
  }

  /**
   * Escape HTML special characters to prevent XSS
   */
  private _escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  render(): string {
    const itemsArray = Array.isArray(this.items) ? this.items : [];
    const separatorHtml = this._getSeparatorHtml();

    const itemsHtml = itemsArray
      .map((item, index) => {
        const isLast = index === itemsArray.length - 1;
        const escapedLabel = this._escapeHtml(item.label);

        if (isLast) {
          // Last item is current page - not clickable
          return `
            <li class="breadcrumbs-item" part="item">
              <span
                class="breadcrumbs-current"
                part="current"
                aria-current="page"
              >${escapedLabel}</span>
            </li>
          `;
        }

        // Regular breadcrumb link
        return `
          <li class="breadcrumbs-item" part="item">
            <a
              class="breadcrumbs-link"
              part="link"
              href="${item.href || '#'}"
              data-index="${index}"
            >${escapedLabel}</a>
            <span class="breadcrumbs-separator" part="separator" aria-hidden="true">${separatorHtml}</span>
          </li>
        `;
      })
      .join('');

    return `
      <nav class="breadcrumbs-nav" part="nav" aria-label="Breadcrumb">
        <ol class="breadcrumbs-list" part="list">
          ${itemsHtml}
        </ol>
        <slot name="separator"></slot>
      </nav>
    `;
  }

  update(): void {
    super.update();

    // Attach click handlers to all breadcrumb links
    const links = this.shadowRoot?.querySelectorAll('.breadcrumbs-link');
    links?.forEach((link) => {
      const index = parseInt(link.getAttribute('data-index') || '0', 10);
      const item = this.items[index];
      if (item) {
        link.addEventListener('click', (e) => this._handleClick(e, item, index));
      }
    });
  }
}
