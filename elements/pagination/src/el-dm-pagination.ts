/**
 * DuskMoon Pagination Element
 *
 * A customizable pagination component for page navigation.
 * Supports first/last, previous/next buttons, and page number display with ellipsis.
 *
 * @element el-dm-pagination
 *
 * @attr {number} total - Total number of pages
 * @attr {number} current - Current active page (1-indexed)
 * @attr {number} siblings - Number of pages to show around current page
 * @attr {number} boundaries - Number of pages to show at start/end
 * @attr {string} size - Button size: xs, sm, md, lg
 * @attr {string} color - Color variant: primary, secondary, neutral
 *
 * @csspart container - The pagination container
 * @csspart button - Navigation buttons (first, prev, next, last)
 * @csspart page - Page number buttons
 * @csspart ellipsis - Ellipsis indicators
 *
 * @fires change - Fired when the current page changes, detail: { page: number }
 */

import { BaseElement, css } from '@duskmoon-dev/el-core';

export type PaginationSize = 'xs' | 'sm' | 'md' | 'lg';
export type PaginationColor = 'primary' | 'secondary' | 'neutral';

const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  :host([hidden]) {
    display: none !important;
  }

  .pagination {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-family: inherit;
  }

  .pagination-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-border, #d1d5db);
    background: var(--color-surface, #ffffff);
    color: var(--color-text, #374151);
    cursor: pointer;
    font-family: inherit;
    font-weight: 500;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease;
    border-radius: var(--radius-md, 0.375rem);
    min-width: 2rem;
    height: 2rem;
    padding: 0 0.5rem;
    font-size: 0.875rem;
    line-height: 1;
  }

  .pagination-btn:hover:not(:disabled) {
    background: var(--color-surface-hover, #f3f4f6);
    border-color: var(--color-border-hover, #9ca3af);
  }

  .pagination-btn:focus-visible {
    outline: 2px solid var(--color-primary, #3b82f6);
    outline-offset: 2px;
  }

  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination-btn.active {
    background: var(--color-primary, #3b82f6);
    border-color: var(--color-primary, #3b82f6);
    color: var(--color-primary-contrast, #ffffff);
  }

  .pagination-btn.nav-btn {
    padding: 0 0.375rem;
  }

  .pagination-btn.nav-btn svg {
    width: 1em;
    height: 1em;
  }

  .ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2rem;
    height: 2rem;
    color: var(--color-text-muted, #6b7280);
    font-size: 0.875rem;
    user-select: none;
  }

  /* Size variants */
  :host([size='xs']) .pagination-btn {
    min-width: 1.5rem;
    height: 1.5rem;
    padding: 0 0.25rem;
    font-size: 0.75rem;
    border-radius: var(--radius-sm, 0.25rem);
  }

  :host([size='xs']) .ellipsis {
    min-width: 1.5rem;
    height: 1.5rem;
    font-size: 0.75rem;
  }

  :host([size='sm']) .pagination-btn {
    min-width: 1.75rem;
    height: 1.75rem;
    padding: 0 0.375rem;
    font-size: 0.8125rem;
  }

  :host([size='sm']) .ellipsis {
    min-width: 1.75rem;
    height: 1.75rem;
    font-size: 0.8125rem;
  }

  :host([size='lg']) .pagination-btn {
    min-width: 2.5rem;
    height: 2.5rem;
    padding: 0 0.75rem;
    font-size: 1rem;
  }

  :host([size='lg']) .ellipsis {
    min-width: 2.5rem;
    height: 2.5rem;
    font-size: 1rem;
  }

  /* Color variants */
  :host([color='secondary']) .pagination-btn.active {
    background: var(--color-secondary, #8b5cf6);
    border-color: var(--color-secondary, #8b5cf6);
    color: var(--color-secondary-contrast, #ffffff);
  }

  :host([color='secondary']) .pagination-btn:focus-visible {
    outline-color: var(--color-secondary, #8b5cf6);
  }

  :host([color='neutral']) .pagination-btn.active {
    background: var(--color-neutral, #6b7280);
    border-color: var(--color-neutral, #6b7280);
    color: var(--color-neutral-contrast, #ffffff);
  }

  :host([color='neutral']) .pagination-btn:focus-visible {
    outline-color: var(--color-neutral, #6b7280);
  }
`;

// SVG icons for navigation buttons
const ICONS = {
  first: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z" clip-rule="evenodd"/></svg>`,
  prev: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd"/></svg>`,
  next: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd"/></svg>`,
  last: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.21 5.23a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L8.168 10 4.23 6.29a.75.75 0 01-.02-1.06zm6 0a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L14.168 10l-3.938-3.71a.75.75 0 01-.02-1.06z" clip-rule="evenodd"/></svg>`,
};

export class ElDmPagination extends BaseElement {
  static properties = {
    total: { type: Number, reflect: true, default: 1 },
    current: { type: Number, reflect: true, default: 1 },
    siblings: { type: Number, reflect: true, default: 1 },
    boundaries: { type: Number, reflect: true, default: 1 },
    size: { type: String, reflect: true },
    color: { type: String, reflect: true },
  };

  /** Total number of pages */
  declare total: number;

  /** Current active page (1-indexed) */
  declare current: number;

  /** Number of pages shown around the current page */
  declare siblings: number;

  /** Number of pages shown at the start and end */
  declare boundaries: number;

  /** Button size: xs, sm, md, lg */
  declare size: PaginationSize;

  /** Color variant: primary, secondary, neutral */
  declare color: PaginationColor;

  constructor() {
    super();
    this.attachStyles(styles);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this._handleClick.bind(this));
    this.addEventListener('keydown', this._handleKeydown.bind(this));
  }

  /**
   * Calculate the range of page numbers to display
   */
  private _getPageRange(): (number | 'ellipsis')[] {
    const total = Math.max(1, this.total);
    const current = Math.min(Math.max(1, this.current), total);
    const siblings = Math.max(0, this.siblings);
    const boundaries = Math.max(0, this.boundaries);

    // If total pages fit without ellipsis
    const totalPageNumbers = boundaries * 2 + siblings * 2 + 3; // boundaries + siblings + current + 2 ellipsis spots
    if (total <= totalPageNumbers) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(current - siblings, boundaries + 1);
    const rightSiblingIndex = Math.min(current + siblings, total - boundaries);

    const showLeftEllipsis = leftSiblingIndex > boundaries + 2;
    const showRightEllipsis = rightSiblingIndex < total - boundaries - 1;

    const pages: (number | 'ellipsis')[] = [];

    // Add left boundary pages
    for (let i = 1; i <= boundaries; i++) {
      pages.push(i);
    }

    // Add left ellipsis or connecting page
    if (showLeftEllipsis) {
      pages.push('ellipsis');
    } else if (boundaries + 1 < leftSiblingIndex) {
      pages.push(boundaries + 1);
    }

    // Add sibling pages and current page
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i > boundaries && i <= total - boundaries) {
        pages.push(i);
      }
    }

    // Add right ellipsis or connecting page
    if (showRightEllipsis) {
      pages.push('ellipsis');
    } else if (rightSiblingIndex < total - boundaries) {
      pages.push(total - boundaries);
    }

    // Add right boundary pages
    for (let i = total - boundaries + 1; i <= total; i++) {
      if (i > 0 && !pages.includes(i)) {
        pages.push(i);
      }
    }

    return pages;
  }

  /**
   * Navigate to a specific page
   */
  private _goToPage(page: number): void {
    const newPage = Math.min(Math.max(1, page), this.total);
    if (newPage !== this.current) {
      this.current = newPage;
      this.emit('change', { page: newPage });
    }
  }

  /**
   * Handle click events on pagination buttons
   */
  private _handleClick(event: Event): void {
    const target = event.target as HTMLElement;
    const button = target.closest('button');

    if (!button || button.disabled) return;

    const action = button.dataset.action;
    const page = button.dataset.page;

    if (action === 'first') {
      this._goToPage(1);
    } else if (action === 'prev') {
      this._goToPage(this.current - 1);
    } else if (action === 'next') {
      this._goToPage(this.current + 1);
    } else if (action === 'last') {
      this._goToPage(this.total);
    } else if (page) {
      this._goToPage(parseInt(page, 10));
    }
  }

  /**
   * Handle keyboard navigation
   */
  private _handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this._goToPage(this.current - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this._goToPage(this.current + 1);
        break;
      case 'Home':
        event.preventDefault();
        this._goToPage(1);
        break;
      case 'End':
        event.preventDefault();
        this._goToPage(this.total);
        break;
    }
  }

  render(): string {
    const total = Math.max(1, this.total);
    const current = Math.min(Math.max(1, this.current), total);
    const pages = this._getPageRange();

    const isFirstPage = current === 1;
    const isLastPage = current === total;

    let pagesHtml = '';

    for (const page of pages) {
      if (page === 'ellipsis') {
        pagesHtml += `
          <span class="ellipsis" part="ellipsis" aria-hidden="true">...</span>
        `;
      } else {
        const isActive = page === current;
        pagesHtml += `
          <button
            class="pagination-btn${isActive ? ' active' : ''}"
            part="page"
            data-page="${page}"
            aria-label="Page ${page}"
            aria-current="${isActive ? 'page' : 'false'}"
          >${page}</button>
        `;
      }
    }

    return `
      <nav class="pagination" part="container" role="navigation" aria-label="Pagination">
        <button
          class="pagination-btn nav-btn"
          part="button"
          data-action="first"
          aria-label="Go to first page"
          ${isFirstPage ? 'disabled' : ''}
        >${ICONS.first}</button>
        <button
          class="pagination-btn nav-btn"
          part="button"
          data-action="prev"
          aria-label="Go to previous page"
          ${isFirstPage ? 'disabled' : ''}
        >${ICONS.prev}</button>
        ${pagesHtml}
        <button
          class="pagination-btn nav-btn"
          part="button"
          data-action="next"
          aria-label="Go to next page"
          ${isLastPage ? 'disabled' : ''}
        >${ICONS.next}</button>
        <button
          class="pagination-btn nav-btn"
          part="button"
          data-action="last"
          aria-label="Go to last page"
          ${isLastPage ? 'disabled' : ''}
        >${ICONS.last}</button>
      </nav>
    `;
  }
}
